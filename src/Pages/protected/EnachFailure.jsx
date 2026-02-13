import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { GetAadhaarDetailsById, GetMandateDetailsById, GetPaymentDetaisByID } from "../../api/Api_call";
import { toast } from "react-toastify";
import { useUserInfoContext } from "../../components/context/UserInfoContext";

const EnachFailure = () => {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(10);
  const { userInfo, setUserInfo } = useUserInfoContext();
  const [mandateDetails, setmandateDetails] = useState({});
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get("id");
  const transactinType = searchParams.get("type");

  const formattedDateTime = mandateDetails?.created_at
    ? new Date(mandateDetails.created_at).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "--";

  useEffect(() => {
    if (!transactionId || !transactinType) {
      navigate("/");
    }

    const countdown = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      if(transactinType === "ENACH"){
        navigate("/process-loan", {replace: true});
      }else if(transactinType === "aadhaar"){
        navigate("/process-loan", {replace: true});
      }else{
        navigate("/", {replace: true});
      }
    }, 10000);

    return () => {
      clearInterval(countdown);
      clearTimeout(redirect);
    };
  }, [navigate]);

  // To get Mandate Details 
  const GetMandateDetails = async () => {
    const req = {
      TransactionId: transactionId,
    };
    if (transactionId) {
      try {
        const response = await GetMandateDetailsById(req);
        if (response.status) {
          setmandateDetails(response?.data);
        } else {
          toast.error(response.message || "Something went wrong!");
        }
        // console.log(mandateDetails);
      } catch (error) {
        console.error("Error in GetMandateDetailsById", error);
      }
    }
  };
  
  // To get Payment Details
  const   GetPaymentDetaisBy = async () => {
    const req = {
      TransactionId: transactionId,
    };
    if (transactionId) {
      try {
        const response = await GetPaymentDetaisByID(req);
        if (response.status) {
          setmandateDetails(response?.msg[0]);
        } else {
          toast.error(response.message || "Something went wrong!");
        }
        // console.log(mandateDetails);
      } catch (error) {
        console.error("Error in GetMandateDetailsById", error);
      }
    }
  };
  
  // To get Adhar Details
  const GetAdharDetaisBy = async () => {
    const req = {
      unique_request_number: transactionId,
      aadhar_number: userInfo?.kycInfo[0]?.aadhaar_number,
      user_id: userInfo?.user_id,
      lead_id: userInfo?.lead_id,
      company_id: "SALORA",
      product_name: "FT"
    };
    if (transactionId) {
      try {
        const response = await GetAadhaarDetailsById(req);
        if (response.status) {
          setmandateDetails(response?.aadhaar_Data);
          console.log(response?.aadhaar_Data);
        } else {
          toast.error(response.message || "Something went wrong!");
        }
        // console.log(mandateDetails);
      } catch (error) {
        console.error("Error in GetMandateDetailsById", error);
      }
    }
  };

  useEffect(() => {
    if (transactinType === "ENACH") {
      GetMandateDetails();
    }else if(transactinType === "aadhaar"){
      GetAdharDetaisBy()
    } else if(transactinType === "pg") {
      GetPaymentDetaisBy()
    }
  }, []);

  return (
    <div className="flex items-center rounded-xl justify-center border-t-4 border-t-red-500">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center w-full">
        <h1 className="text-2xl font-bold mb-4">
          {transactinType === "ENACH" && "eNACH Registration Failed ❌"}
          {transactinType === "aadhaar" && "Aadhaar Verification Failed ❌"}
          {transactinType === "pg" && "Transaction Failed ❌"}
        </h1>

        <div className="text-sm mb-2">
          <p className="text-red-500 font-semibold">
            {transactinType === "ENACH" && `Failure Reason: ${mandateDetails?.response_meta?.description}`}
            {transactinType === "pg" && `Failure Reason: ${(mandateDetails?.error_Message !== "NA" && mandateDetails?.error_Message) || mandateDetails?.status || "Something went wrong!"}`}
            {transactinType === "aadhaar" && `Reason: ${mandateDetails?.status}`}
          </p>
        </div>

        <div className="text-sm mb-2 m-auto max-md:w-full py-3">
          <p className="mb-1">
            <span className="font-semibold">{transactinType === "aadhaar" ? "Reference Id:" : "Transaction id:"}</span>{" "}
            <span>{transactionId || "Null"}</span>
          </p>
          {/* <p className="flex flex-col text-left mb-1">
            <span className="font-semibold">Bank Reference Number:</span>
            <span>{mandateDetails?.bank_reference_number || "Null"}</span>
          </p>
          <p className="flex flex-col text-left mb-1">
            <span className="font-semibold">Created At: </span>
            <span>{formattedDateTime || "Null"}</span>
          </p> */}
        </div>

        <p className="mb-4">
          Unfortunately, 
          {transactinType === "ENACH" &&  " your mandate registration " || 
          transactinType === "aadhaar" && " your Aadhaar Verification " || 
          transactinType === "pg" && " your Transaction "} 
          could not be completed. Please try again.
        </p>

        {/* <p className="text-sm opacity-80">
          Redirecting in <b>{timer}</b> seconds...
          <Link className="ml-2 font-bold text-primary" to="/process-loan">
            Go to Home
          </Link>
        </p> */}
        <p className="text-sm opacity-80 flex items-center justify-center">
          Redirecting in <b className="mx-2"> {timer} </b> seconds...
          {/* <Link className="ml-2 font-bold text-primary" to="/process-loan">Go to Home</Link> */}
          <p className="ml-2 font-bold text-primary cursor-pointer" onClick={()=> (transactinType === "ENACH" || transactinType === "aadhaar")  ? navigate("/process-loan", {replace: true}) : navigate("/", {replace: true}) } >Go to Home</p>
        </p>
      </div>
    </div>
  );
};

export default EnachFailure;
