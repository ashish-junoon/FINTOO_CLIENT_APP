import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Card from "../../components/utils/Card";
import Button from "../../components/utils/Button";
import CheckboxInput from "../../components/fields/CheckboxInput";
import TextInput from "../../components/fields/TextInput";
import { insertSelectedProduct, validateConsentOTP } from "../../api/Api_call";
import { useUserInfoContext } from "../../components/context/UserInfoContext";
import ErrorMsg from "../../components/utils/ErrorMsg";
import Loader from "../../components/utils/Loader";
import BtnLoader from "../../components/utils/BtnLoader";
import { Link } from "react-router-dom";

function AvailLoan({ product, handleApply }) {
  const [isAgree, setIsAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notChecked, setNotChecked] = useState(false);
  const [isConsentOtpsent, setIsConsentOtpsent] = useState(false);
  const [concentOTP, setConsentOTP] = useState("");
  const [isConsentVerified, setIsConsentVerified] = useState(false);
  const [selectProduct, setSelectedProduct] = useState([]);

  const { userInfo, setUserInfo } = useUserInfoContext();

  const updateData = (product) => {
    setUserInfo((prevUserInfo) => ({
      ...prevUserInfo,
      selectedproduct: [
        {
          ...product,
          otp_consent_verified: true,
        },
      ],
    }));
  };

  const formik = useFormik({
    initialValues: {
      consentOTP: "",
    },
    validationSchema: Yup.object({
      consentOTP: Yup.string()
        .required("Enter OTP")
        .matches(/^[0-9]{4}$/, "Invalid OTP"),
    }),
    onSubmit: async (values) => {
      setLoading(true)
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // STEP 1: Update lat/lon
          // setLocation((prev) => ({ ...prev, latitude: lat, longitude: lon }));

          // STEP 2: Reverse Geocoding API
          // const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_API_KEY}`;

          try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status !== "OK") {
              throw new Error("Geocoding failed");
            }
            // console.log(data);
            const address = data.address || {};
            const result = data.results[0];

            //   setLocation({
            //     latitude: lat,
            //     longitude: lon,
            //     city: address.city || address.town || address.village || "",
            //     state: address.state || "",
            //     pincode: address.postcode || "",
            //     fullAddress: data.display_name || "",
            //   });

            ///meee
            // const userRequest = {
            //   lead_id: userInfo.lead_id,
            //   product_code: product.product_code,
            //   consent_otp: values.consentOTP.toString(),
            //   latitude: data.lat,
            //   longitude: data.lon,
            //   geo_address: Object.values(data.address).join(", ") || "",
            //   geo_state: data.address.state || data.address.city || "",
            //   geo_city: data.address.city || "",
            //   geo_pin_code: data.address.postcode || "",
            // };

            const getComponent = (type) =>
              result.address_components.find((c) => c.types.includes(type))
                ?.long_name || "";

            const userRequest = {
              lead_id: userInfo?.lead_id,
              product_code: product?.product_code,
              consent_otp: values.consentOTP.toString(),

              latitude: String(result.geometry.location.lat),
              longitude: String(result.geometry.location.lng),

              geo_address: result.formatted_address || "",

              geo_state: getComponent("administrative_area_level_1"),
              geo_city:
                getComponent("locality") ||
                getComponent("administrative_area_level_2"),

              geo_pin_code: getComponent("postal_code"),
            };

            try {
              const data = await validateConsentOTP(userRequest);
              if (data.status) {
                toast.success(data.message);
                setIsConsentVerified(true);
                handleApply();
                updateData((product = selectProduct));
                setLoading(true);
                setInterval(() => {
                  window.location.reload();
                  setLoading(false);
                }, 1000);
              } else {
                toast.error(data.message);
              }
            } catch (error) {
              toast.error("Something went wrong. Please try again.");
              console.error("Error submitting address info:", error);
            }
          } catch (error) {
            console.error("Error fetching location details:", error);
          } finally{
            setLoading(false)
          }
        },
        (error) => {
          console.error("Location Error:", error);
          alert("Please enable location permission.");
          setLoading(false);
        }
      );
    },
  });

  {
    loading && <Loader msg={"Wait..."} />;
  }

  const handleApplyForLoan = async () => {
    if (!isAgree) {
      setNotChecked(true);
      return;
    }
    const userRequest = {
      user_id: userInfo.user_id,
      lead_id: userInfo.lead_id,
      product_name: product.product_name,
      product_code: product.product_code,
      product_type: product.product_type,
      loan_amount: product.loan_amount,
      insurance: product.insurance,
      processing_fee: product.processing_fee,
      interest_rate: product.interest_rate,
      interest_type: product.interest_type,
      cgst: product.cgst,
      sgst: product.sgst,
      igst: product.igst,
      tenure: product.tenure,
      repayment_frequency: product.repayment_frequency,
      is_active: true,
      updated_by: userInfo.user_id,
    };
    try {
      setLoading(true);
      const data = await insertSelectedProduct(userRequest);
      if (data.status) {
        toast.success(data.message);
        setIsConsentOtpsent(true);
        setConsentOTP(data.consent_otp);
        setSelectedProduct(userRequest);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Error submitting address info:", error);
    }
    setLoading(false);
  };

  const handleCheckboxChange = (e) => {
    setIsAgree(e.target.checked);
    if (e.target.checked) setNotChecked(false);
  };

  const frequency = product?.repayment_frequency;

  // alert(frequency);

  return (
    <div>
      <p className="text-md font-semibold text-black text-center mb-4">
        You are applying for <b>{product.product_code}</b>
      </p>
      <Card
        heading={
          frequency === "Bulletpayment"
            ? "Credit Line Details"
            : `${product?.product_name || ""} - ${product?.product_code || ""}`
        }
      >
        <div className="grid grid-cols-5 gap-2 items-center">
          <div className="col-span-3 text-xs">
            <h2 className="text-md font-semibold text-gray-500">Loan Amount</h2>
          </div>
          <div className="col-span-2 text-end">
            <span className="px-4 py-1 font-semibold text-xs rounded">
              ₹{product.loan_amount}
            </span>
          </div>

          <div className="col-span-3 text-xs">
            <h2 className="text-md font-semibold text-gray-500">Tenure</h2>
          </div>
          <div className="col-span-2 text-end">
            <span className="px-4 py-1 font-semibold text-xs rounded">
              {product.tenure}
            </span>
          </div>

          <div className="col-span-3 text-xs">
            <h2 className="text-md font-semibold text-gray-500">
              Interest Rate
            </h2>
          </div>
          <div className="col-span-2 text-end">
            <span className="px-4 py-1 font-semibold text-xs rounded">
              {product.interest_rate}%{" "}
              {frequency === "Bulletpayment" ? "/Day" : "/PM"}
            </span>
          </div>

          <div className="col-span-3 text-xs">
            <h2 className="text-md font-semibold text-gray-500">
              Processing Fee
            </h2>
          </div>
          <div className="col-span-2 text-end">
            <span className="px-4 py-1 font-semibold text-xs rounded">
              {product.processing_fee}%
            </span>
          </div>

          <div className="col-span-3 text-xs">
            <h2 className="text-md font-semibold text-gray-500">
              Repayment Frequency
            </h2>
          </div>
          <div className="col-span-2 text-end">
            {frequency === "Bulletpayment" ? (
              <>
                <h2 className="px-4 py-1 font-semibold text-xs rounded">
                  Bullet Payment
                </h2>
              </>
            ) : (
              <span className="px-4 py-1 font-semibold text-xs rounded">
                {product.repayment_frequency}
              </span>
            )}
          </div>

          <div className="col-span-3 text-xs">
            {frequency === "Bulletpayment" ? (
              <>
                <h2 className="text-md font-semibold text-gray-500">
                  Repayment Amount
                </h2>
              </>
            ) : (
              <h2 className="text-md font-semibold text-gray-500">
                EMI Amount
              </h2>
            )}
          </div>
          <div className="col-span-2 text-end">
            <span className="px-4 py-1 font-semibold text-xs rounded">
              ₹{product.emi_amount}
            </span>
          </div>

          <div className="col-span-3 text-xs">
            <h2 className="text-md font-semibold text-gray-500">
              Total GST Amount
            </h2>
          </div>
          <div className="col-span-2 text-end">
            <span className="px-4 py-1 font-semibold text-xs rounded">
              ₹{Number(product.total_gst_amount).toFixed(2)}
            </span>
          </div>

          <div className="col-span-3 text-xs">
            <h2 className="text-md font-semibold text-gray-500">
              Processing Amount
            </h2>
          </div>

          <div className="col-span-2 text-end">
            <span className="px-4 py-1 font-semibold text-xs rounded">
              ₹{Number(product.processing_fee_amount).toFixed(2)}
            </span>
          </div>

          {/* <div className="col-span-3 text-xs">
                        <h2 className="text-md font-semibold text-gray-500">Insurance Premium</h2>
                    </div>
                    <div className="col-span-2 text-end">
                        <span className="px-4 py-1 font-semibold text-xs rounded">₹{product.insurance_premium}</span>
                    </div> */}

          <div className="col-span-3 text-xs">
            <h2 className="text-md font-semibold text-gray-500">
              Disbursement
            </h2>
          </div>
          <div className="col-span-2 text-end">
            <span className="px-4 py-1 font-semibold text-xs rounded">
              ₹{Number(product.disburesement_amount).toFixed(2)}
            </span>
          </div>
        </div>

        {!isConsentOtpsent && (
          <div>
            <div className="my-8">
              <CheckboxInput
                label={
                  <>
                    I confirm that I have read and accept the{" "}
                    <Link
                      className="underline text-blue-500"
                      target="_blank"
                      to="https://www.junooncapital.com/terms"
                    >
                      terms & conditions
                    </Link>{" "}
                    and provide my consent for the processing of this credit
                    line.
                  </>
                }
                name="agree"
                onChange={handleCheckboxChange}
                checked={isAgree}
                style="text-xs"
              />

              {notChecked && (
                <div className="text-red-500 text-xs mt-2">
                  Please check the box
                </div>
              )}
            </div>
            <Button
              btnName={loading ? <BtnLoader /> : "Agree & Apply"}
              btnIcon={loading ? null : "IoArrowForward"}
              type={"button"}
              onClick={loading ? null : handleApplyForLoan}
              style={`mt-4 py-1 ${
                loading ? "bg-gray-400" : "bg-secondary"
              } text-black w-full mb-2`}
              disabled={loading}
            />
          </div>
        )}

        {isConsentOtpsent && (
          <div className="my-5">
            <form onSubmit={formik.handleSubmit}>
              <TextInput
                label=""
                name="consentOTP"
                icon={"MdOutlineVerifiedUser"}
                type="text"
                id="consentOTP"
                maxLength={4}
                placeholder="Enter Consent OTP"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.consentOTP}
              />
              {formik.touched.consentOTP && formik.errors.consentOTP && (
                <ErrorMsg error={formik.errors.consentOTP} />
              )}
              <Button
                btnName={loading ? "Submiting..." :"Approve & Next"}
                style={loading ? "px-4 md:px-8 py-2 w-full bg-gray-300 text-black mt-5 cursor-not-allowed" : "px-4 md:px-8 py-2 w-full bg-secondary text-black mt-5"}
                btnIcon={"MdOutlineCheckCircle"}
                type="submit"
                disabled={loading}
              />
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AvailLoan;
