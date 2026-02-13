import { useState, useEffect } from "react";
import {
  registerEMandate,
  getTokenPostEmandate,
  getbankCodeListByCode,
  registerEMandateEaseBuze,
} from "../../api/Api_call";
import Loader from "../../components/utils/Loader";
import Button from "../../components/utils/Button";
import Images from "../../components/content/Images";
import { useUserInfoContext } from "../../components/context/UserInfoContext";
import Card from "../../components/utils/Card";
import { toast } from "react-toastify";
import SelectInput from "../../components/fields/SelectInput";

function RegisterNach() {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [regData, setRegData] = useState([]);
  const [nachData, setNachData] = useState([]);
  const [bankCodeListByCode, setbankCodeListByCode] = useState([]);
  const [authMode, setAuthMode] = useState("");
  const [token, setToken] = useState("");

  const { userInfo, setUserInfo } = useUserInfoContext();

  const FLAG_MAP = {
    netbankFlag: {
      value: "netbanking",
      label: "Netbanking",
    },
    cardFlag: {
      value: "debit_card",
      label: "Debit Card",
    },
    adharFlag: {
      value: "aadhaar",
      label: "Aadhaar",
    },
    // panFlag: {
    //   value: "pan",
    //   label: "PAN",
    // },
    // custidFlag: {
    //   value: "customer_id",
    //   label: "Customer ID",
    // },
  };

  // const updateData = () => {
  //     setTimeout(() => {
  //         setUserInfo((userInfo) => ({
  //             ...userInfo,
  //             is_e_nach_activate: true,
  //         }));
  //     }, 5000);
  // };

  //   console.log(userInfo?.selectedproduct);

  const registerNACHEaseBuzz = async () => {
    setLoading(true);
    const req = {
      success_url: `${location.origin}/success`,
      failure_url: `${location.origin}/failure`,
      amount: (userInfo?.getAssignProduct[0]?.loan_amount * 4) || 10,
      //   amount: 100000,  // Asking permision of 1lakh for mandate
      // amount: userInfo?.selectedproduct[0]?.loan_amount,
      email: userInfo?.personalInfo[0]?.email_id,
      phone: userInfo?.mobile_number,
      frequency: "daily",
      mandate_type: "ENACH",
      account_number: userInfo?.bankInfo[0]?.account_number,
      account_holder_name: userInfo?.bankInfo[0]?.account_holder_name,
      ifsc: userInfo?.bankInfo[0]?.ifsc_code,
      upi_handle: "",
      auth_mode: authMode,
      // auth_mode: 'physical',
      account_type: "savings",
      bank_code: userInfo?.bankInfo[0]?.ifsc_code?.slice(0, 4),
      request_type: "ENACH",
      lead_id: userInfo?.lead_id,
      user_id: userInfo?.user_id,
      loan_id: "",
      company_name: "JUNOON",
      product_code: import.meta.env.VITE_PRODUCT_NAME,
    };
    try {
      const response = await registerEMandateEaseBuze(req);
      console.log("API Response:", response);
      localStorage.setItem("reloaded", "true");

      const win = window.open("", "_self"); // or "_blank"
      win.document.open();
      win.document.write(response);
      win.document.close();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (localStorage.getItem("reloaded")) {
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
    localStorage.removeItem("reloaded");
  }, []);

  const registerNACH = async () => {
    setLoading(true);
    const req = {
      name: userInfo?.personalInfo[0]?.full_name,
      email: userInfo?.personalInfo[0]?.email_id,
      contact: userInfo?.mobile_number,
      // amount: import.meta.env.VITE_NACH_REGISTER_AMOUN,
      amount: 1,
      receipt: "Detail of Emaindate Text Free Flow",
      currenc: import.meta.env.VITE_NACH_REGISTER_AMOUNT,
      order_notes: {
        notes_key_1: "Emandate Register Request",
        notes_key_2: "Paisa Udhaar Mandate",
      },
      customer_notes: {
        notes_key_1:
          userInfo?.personalInfo[0]?.full_name + "-" + userInfo?.mobile_number,
        notes_key_2: userInfo?.lead_id + "-" + userInfo?.user_id,
      },
      company_id: import.meta.env.VITE_COMPANY_ID,
      product_name: import.meta.env.VITE_PRODUCT_NAME,
    };
    try {
      const response = await registerEMandate(req);
      // console.log("API Response:", response);

      if (response.status) {
        setRegData(response.data);
        setLoading(false);
      } else {
        console.log(response.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    // console.log(userInfo)
    if (regData?.order_id) {
      handlePayment();
    }
  }, [regData.order_id]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = import.meta.env.VITE_RAZORPAY_CHECKOUT_URL;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Get Token Post Emandate
  const tokenPostEmandate = async () => {
    if (!nachData?.razorpay_payment_id) return;

    const req = {
      lead_id: userInfo?.lead_id,
      payment_id: nachData.razorpay_payment_id,
      order_id: nachData.razorpay_order_id,
      signature: nachData.razorpay_signature,
      company_id: import.meta.env.VITE_COMPANY_ID,
      product_name: import.meta.env.VITE_PRODUCT_NAME,
    };

    try {
      setLoading(true);
      const response = await getTokenPostEmandate(req);
      setToken(response.token_data);
    } catch (error) {
      console.error(
        "Get Token Post Emandate:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  //comented by rk
  //   useEffect(() => {
  //     if (nachData) {
  //       tokenPostEmandate();
  //     }
  //   }, [nachData]);

  const handlePayment = () => {
    if (!regData?.key || !regData?.order_id || !regData?.customer_id) {
      console.error("Missing required payment regData.");
      return;
    }

    const options = {
      key: regData.key,
      order_id: regData.order_id,
      customer_id: regData.customer_id,
      recurring: "1",
      handler: (response) => {
        setNachData(response);
        // console.log("Payment Response:", response);
      },
      notes: {
        "note_key 1": "Payment for Emandate Registration",
        "note_key 2": "Paisa Udhaar Mandate.",
      },
      theme: {
        color: "#5484f3",
      },
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  //comented by rk
  //   useEffect(() => {
  //     if (token === "") return;

  //     const timer = setInterval(() => {
  //       setCountdown((prev) => prev - 1);
  //     }, 1000);

  //     const redirectTimer = setTimeout(() => {
  //       setUserInfo((userInfo) => ({
  //         ...userInfo,
  //         is_e_nach_activate: true,
  //       }));
  //     }, 5000);

  //     return () => {
  //       clearInterval(timer);
  //       clearTimeout(redirectTimer);
  //     };
  //   }, [token]);

  //to get e natch methods for dropdown
  const getEnatchMethods = async (req) => {
    try {
      const response = await getbankCodeListByCode(req);
      const enabledMethods = Object.entries(response?.data || {})
        .filter(([key, value]) => value === true && FLAG_MAP[key])
        .map(([key]) => FLAG_MAP[key]);

      setbankCodeListByCode(enabledMethods);
      //   console.log(enabledMethods);
    } catch (error) {
      console.error(
        "Get Token Post Emandate:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    getEnatchMethods(userInfo?.bankInfo[0]?.ifsc_code?.slice(0, 4));

    //   if (!sessionStorage.getItem("reloaded")) {
    //   sessionStorage.setItem("reloaded", "true");

    //   setTimeout(() => {
    //     window.location.reload();
    //   }, 100);
    // }
  }, []);

  if (loading) return <Loader msg="Please Wait..." />;

  return (
    <>
      {/* {token === "" && ( */}
      <Card heading="Register eMandate" style="bg-white">
        <div>
          <div className="flex justify-center">
            <p className="text-sm text-center text-gray-600">
              Please continue to register your eMandate & keep your Bank
              Account, Debit Card details handy for hassle-free process.
            </p>
          </div>
          <div>
            <div className="flex justify-center items-center my-5">
              <img src={Images.nach} alt="QR Code" className="h-36" />
            </div>
            <div className="flex justify-center items-center gap-2 my-5">
              <select
                name="enachMode"
                id="enachMode"
                value={authMode}
                onChange={(e) => setAuthMode(e.target.value)}
                className="bg-secondary px-4 py-2 rounded"
              >
                <option className="bg-gray-200" value="" disabled>
                  Select Auth Mode
                </option>
                {bankCodeListByCode?.map((mode, index) => {
                  return (
                    <option key={index} className="bg-white" value={mode.value}>
                      {mode.label.toUpperCase()}
                    </option>
                  );
                })}
              </select>

              <Button
                btnName={"Register eMandate"}
                // disabled={!authMode.length}
                style={`${!authMode.length
                    ? "bg-gray-200"
                    : "bg-primary hover:bg-secondary hover:text-black"
                  } text-white px-4 py-2`}
                // onClick={registerNACH}
                onClick={() => {
                  authMode
                    ? registerNACHEaseBuzz()
                    : toast.error("Please select ENACH Method!");
                }}
              />
            </div>
          </div>
        </div>
      </Card>
      {/* )} */}

      {/* {token && (
        <div>
          <div className="flex justify-center">
            <img src={Images.verified} alt="success" className="h-24" />
          </div>
          <h1 className="text-center text-primary font-bold text-lg mt-5">
            eMandate Registered
          </h1>

          <div className="my-3">
            <p className="text-center text-gray-800">
              Redirecting in{" "}
              <span className="text-primary font-bold">{countdown}</span>{" "}
              seconds...
            </p>
          </div>
        </div>
      )} */}
      {/* <h1 className="text-center text-gray-400 font-bold text-sm"> {token.token}</h1> */}
    </>
  );
}
export default RegisterNach;
