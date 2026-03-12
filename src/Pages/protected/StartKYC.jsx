import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Images from "../../components/content/Images";
import Button from "../../components/utils/Button";
import { useUserInfoContext } from "../../components/context/UserInfoContext";
import { GetAadhaarDetailsBySalora, verifyAadharCard, verifyAadharCardBySalora, verifyPANCard, verifyPANCardBySalora } from "../../api/Api_call";
import BtnLoader from "../../components/utils/BtnLoader";
import Card from "../../components/utils/Card";
import AdharCard from "../../components/utils/AdharCard";
import PanCard from "../../components/utils/PanCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { a } from "framer-motion/client";

function StartKYC() {
  const navigate = useNavigate();
  // query parameters if exists------------------
  const [redirectParams, setRedirectParams] = useSearchParams();

  const transactionId = redirectParams.get("txnId");
  const isSuccess = redirectParams.get("success");
  // --------------------------------------------
  const [validating, setValidating] = useState(false);
  const [validating2, setValidating2] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [verified, setVerified] = useState(false);

  const { userInfo, setUserInfo } = useUserInfoContext();

  const isPanVerified = userInfo?.pan_verified;
  const isAdharVerified = userInfo?.aadhaar_verified;
  const isKYCDone = userInfo?.is_e_kyc_done;


  // Aadhaar Verification by salora
  const handleAdharVerify = async () => {
    setValidating(true);
    const userRequest = {
      // partnerLoanId: userInfo?.lead_id,
      partnerLoanId: "4787891",
      redirectionUrl: `${location.origin}/process-loan`,
      productinfo: {
        comapnyName: import.meta.env.VITE_COMPANY_ID,
        productName: import.meta.env.VITE_PRODUCT_NAME,
        userId: userInfo?.user_id,
        leadId: userInfo?.lead_id,
        createdBy: "user"
      }
    };

    try {
      const data = await verifyAadharCardBySalora(userRequest);
      if (data?.model?.kycUrl) {
        // setUserInfo((prevUserInfo) => ({
        //     ...prevUserInfo,
        //     aadhaar_verified: true,
        // }));

        localStorage.setItem("reloaded", "true");
        window.location.href = data?.model?.kycUrl;
      } else {
        toast.error(data?.message || data?.detail || "Adhar Varification Failed!");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Error verifying Aadhaar:", error);
    } finally {
      setValidating(false);
    }
  };


  //(runs only if redirected)
  useEffect(() => {
    if (!transactionId) return; //do not proceed without txnid
    if (isSuccess === false) {
      navigate("/process-loan");
      toast.error("Aadhaar verification failed. Please try again!")
      return;
    }

    const req = {
      partnerLoanId: "4787894123",
      transactionId: transactionId,
      aadharNumber: userInfo?.kycInfo[0]?.aadhaar_number,
      productinfo: {
        comapnyName: import.meta.env.VITE_COMPANY_ID,
        productName: import.meta.env.VITE_PRODUCT_NAME,
        userId: userInfo?.user_id,
        leadId: userInfo?.lead_id,
        createdBy: "user"
      },
    };

    // To Get Adhar Details by salora
    const GetAdharDetaisBySalora = async () => {
      try {
        const response = await GetAadhaarDetailsBySalora(req);
        if (response.status == 's') {
          // check for aadhaar mis-match
          if (userInfo?.kycInfo[0]?.aadhaar_number.slice(-4) !== response?.maskedAdharNumber.slice(-4)) {
              toast.error("Aadhaar number mismatched");
              return;
          }
          toast.success("Aadhaar verified successfully.")
          window.location.reload();
        } else {
          toast.error(response.message || "Aadhaar verification failed. Please try again!");
        }
        // console.log(mandateDetails);
      } catch (error) {
        console.error("Error in GetMandateDetailsById", error);
      }
    };
    GetAdharDetaisBySalora();

    // Remove the query param after using it
    // redirectParams.delete("txnId");
    // redirectParams.delete("success");
    // setRedirectParams(redirectParams, { replace: true });
  }, [])

  useEffect(() => {
    if (localStorage.getItem("reloaded")) {
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
    localStorage.removeItem("reloaded");
  }, []);

  // PAN Verification by salora
  const handlePanVerify = async () => {
    setValidating2(true);
    const userRequest = {
      // partnerLoanId: userInfo?.lead_id, //*
      partnerLoanId: "4787894123",
      pan: userInfo?.kycInfo[0]?.pan_card_number, //*
      phone_number: userInfo?.mobile_number, //*
      email: userInfo?.personalInfo?.[0]?.email_id, //*
      income: userInfo?.employmentInfo?.[0]?.net_monthly_salary * 12, //*
      occupation: 1, //*
      productinfo: {
        comapnyName: import.meta.env.VITE_COMPANY_ID,
        productName: import.meta.env.VITE_PRODUCT_NAME,
        userId: userInfo?.user_id,
        leadId: userInfo?.lead_id,
        createdBy: "user"
      }
    };

    try {
      const data = await verifyPANCardBySalora(userRequest);
      if (data.status === 1) {
        setUserInfo((prevUserInfo) => ({
          ...prevUserInfo,
          pan_verified: true,
        }));
        toast.success(data?.message || "Pan Varification Successfull!");
      } else {
        toast.error(data?.data?.failure_reason || "Pan Varification Failed!");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Error verifying PAN:", error);
    } finally {
      setValidating2(false);
    }
  };

  // Update Verified state when both documents are verified
  useEffect(() => {
    if (isPanVerified && isAdharVerified) {
      const timeout = setTimeout(() => {
        setVerified(true);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isPanVerified, isAdharVerified]);

  // Update eKYC state when both documents are verified
  // useEffect(() => {
  //     if (isPanVerified && isAdharVerified) {
  //         const timeout = setTimeout(() => {
  //             setUserInfo(prev => ({
  //                 ...prev,
  //                 is_e_kyc_done: true,
  //             }));
  //         }, 3000);

  //         return () => clearTimeout(timeout);
  //     }
  // }, [isPanVerified, isAdharVerified]);

  const handleEkycDone = () => {
    setUserInfo((prev) => ({
      ...prev,
      is_e_kyc_done: true,
    }));
  };

  useEffect(() => {
    let intervalTimer;
    let timeoutTimer;

    if (isPanVerified && isAdharVerified) {
      intervalTimer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      timeoutTimer = setTimeout(() => {
        handleEkycDone(); // call after 10 seconds
      }, 5000);
    }

    return () => {
      clearInterval(intervalTimer);
      clearTimeout(timeoutTimer);
    };
  }, [isPanVerified, isAdharVerified]);

  return (
    <>
      {!verified && (
        <Card heading="eKYC Verification" style="mx-auto max-w-4xl px-4">
          <div className="mb-5" >
            <div
              className={`${isPanVerified ? "bg-green-100" : "bg-red-200"} rounded-t-lg py-0.5 px-5 flex justify-between items-center`}
            >
              <div className="font-semibold text-sm">
                {isPanVerified ? (
                  <span className="text-green-500">Verified</span>
                ) : (
                  <span className="text-red-500">Unverified</span>
                )}
              </div>
              <div className="text-xs font-semibold">
                {!isPanVerified && (
                  <Button
                    btnName={validating2 ? <BtnLoader /> : "Verify"}
                    type="button"
                    style="w-full uppercase py-0.5 px-2 bg-secondary text-[10px] text-black"
                    btnIcon={!validating ? "MdOutlineCheckCircle" : ""}
                    disabled={validating}
                    onClick={handlePanVerify}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <PanCard
                name={userInfo?.personalInfo[0]?.full_name}
                dob={userInfo?.personalInfo[0]?.dob}
                panNumber={userInfo?.kycInfo[0]?.pan_card_number}
              />
            </div>
          </div>

          <div className="">
            <div
              className={`${isAdharVerified ? "bg-green-100" : "bg-red-200"} rounded-t-lg py-0.5 px-5 flex justify-between items-center`}
            >
              <div className="font-semibold text-sm">
                {isAdharVerified ? (
                  <span className="text-green-500">Verified</span>
                ) : (
                  <span className="text-red-500">Unverified</span>
                )}
              </div>
              <div className="text-xs font-semibold">
                {!isAdharVerified && (
                  <Button
                    btnName={validating ? <BtnLoader /> : "Verify"}
                    type="button"
                    style="w-full uppercase py-0.5 px-2 bg-secondary text-[10px] text-black"
                    btnIcon={!validating ? "MdOutlineCheckCircle" : ""}
                    disabled={validating}
                    onClick={handleAdharVerify}
                  />
                )}
              </div>
            </div>
            <div className="flex justify-center">
              <AdharCard
                name={userInfo?.personalInfo[0]?.full_name}
                dob={userInfo?.personalInfo[0]?.dob}
                gender={userInfo?.personalInfo[0]?.gender}
                aadhaarNumber={userInfo?.kycInfo[0]?.aadhaar_number}
              />
            </div>
          </div>
        </Card>
      )}

      {verified && (
        <Card heading="" style="mx-10">
          <div className="flex flex-col justify-center items-center">
            <div className="my-3">
              <img src={Images.verified} alt="Verified" className="w-16 h-16" />
            </div>
            <div className="flex flex-col justify-center items-center">
              <h1 className="text-xl font-bold mb-2 text-primary">
                eKYC Verified
              </h1>
              <p className="text-md text-gray-600 mb-8 text-center">
                Your KYC verification has been successfully completed. Please
                wait while we redirect you for NACH registration.
              </p>
            </div>
          </div>

          <div className="my-3">
            <p className="text-center text-gray-800">
              Redirecting in{" "}
              <span className="text-primary font-bold">{countdown}</span>{" "}
              seconds...
            </p>
          </div>
        </Card>
      )}
    </>
  );
}

export default StartKYC;
