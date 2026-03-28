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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'success' or 'error'
  const [modalMessage, setModalMessage] = useState('');
  const [modalCountdown, setModalCountdown] = useState(5);

  // Modal countdown effect
  useEffect(() => {
    let interval;
    if (modalOpen && modalCountdown > 0) {
      interval = setInterval(() => {
        setModalCountdown((prev) => prev - 1);
      }, 1000);
    } else if (modalOpen && modalCountdown === 0) {
      setModalOpen(false);
      if (modalType === 'success') {
        navigate("/process-loan", { replace: true });
      }
      window.location.reload();
    }
    return () => clearInterval(interval);
  }, [modalOpen, modalCountdown, modalType, navigate]);

  const { userInfo, setUserInfo } = useUserInfoContext();

  const isPanVerified = userInfo?.pan_verified;
  const isAdharVerified = userInfo?.aadhaar_verified;
  const isKYCDone = userInfo?.is_e_kyc_done;


  // Aadhaar Verification by salora
  const handleAdharVerify = async () => {
    setValidating(true);
    const parts = userInfo?.personalInfo[0]?.full_name?.trim().split(/\s+/);
    const userRequest = {
      redirectionUrl: `${location.origin}/process-loan`,
      firstName: parts[0] || "",
      lastName: parts.length > 1 ? parts[parts.length - 1] : "",
      mobile: userInfo?.mobile_number,
      emailId: userInfo?.personalInfo[0]?.email_id,
      comapny_id: import.meta.env.VITE_COMPANY_ID,
      product_name: import.meta.env.VITE_PRODUCT_NAME,
      user_id: userInfo?.user_id,
      lead_id: userInfo?.lead_id,
      created_by: "user"
    };

    try {
      const data = await verifyAadharCardBySalora(userRequest);
      if (data?.status === "SUCCESS") {
        localStorage.setItem("reloaded", "true");
        toast.success(data?.message)
        window.location.href = data?.model?.kycUrl || data?.model?.url;
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
    if (isSuccess === "false") {
      navigate("/process-loan");
      setModalType('error');
      setModalMessage("Aadhaar verification failed. Please try again!");
      setModalOpen(true);
      setModalCountdown(5);
      return;
    }

    const req = {
      transactionId: transactionId,
      aadhaar_number: userInfo?.kycInfo?.[0]?.aadhaar_number,
      comapny_id: import.meta.env.VITE_COMPANY_ID,
      product_name: import.meta.env.VITE_PRODUCT_NAME,
      user_id: userInfo?.user_id,
      lead_id: userInfo?.lead_id,
      created_by: "user"
    };

    // To Get Adhar Details by salora (on redirect)
    const GetAdharDetaisBySalora = async () => {
      try {
        const response = await GetAadhaarDetailsBySalora(req);
        if (response.status == 'SUCCESS') {
          // check for aadhaar mis-match
          if (userInfo?.kycInfo[0]?.aadhaar_number.slice(-4) !== response?.model?.maskedAdharNumber.slice(-4)) {
            setModalType('error');
            setModalMessage("Aadhaar number mismatched");
            setModalOpen(true);
            setModalCountdown(5);
            return;
          }
          setUserInfo((prevUserInfo) => ({
            ...prevUserInfo,
            address_info_verified: true,
          }));
          setModalType('success');
          setModalMessage("Aadhaar verified successfully.");
          setModalOpen(true);
          setModalCountdown(5);
          // window.location.reload(); // This will be handled by modal countdown
          // navigate("/process-loan", { replace: true }); // This will be handled by modal countdown
        } else {
          setModalType('error');
          setModalMessage(response.message || "Aadhaar verification failed. Please try again!");
          setModalOpen(true);
          setModalCountdown(5);
        }
        // console.log(mandateDetails);
      } catch (error) {
        console.error("Error in GetMandateDetailsById", error);
      }
    };
    GetAdharDetaisBySalora();

    // Remove the query param after using it
    redirectParams.delete("txnId");
    redirectParams.delete("success");
    setRedirectParams(redirectParams, { replace: true });
  }, [transactionId, isSuccess])

  useEffect(() => {
    if (localStorage.getItem("reloaded")) {
      setTimeout(() => {
        // window.location.reload();
      }, 100);
    }
    localStorage.removeItem("reloaded");
  }, []);

  // PAN Verification by salora
  const handlePanVerify = async () => {
    setValidating2(true);
    const userRequest = {
      pan: userInfo?.kycInfo[0]?.pan_card_number,
      comapny_id: import.meta.env.VITE_COMPANY_ID,
      product_name: import.meta.env.VITE_PRODUCT_NAME,
      user_id: userInfo?.user_id,
      lead_id: userInfo?.lead_id,
      created_by: "user",
      // client_ref_num: crypto.randomUUID(),
    };

    try {
      const data = await verifyPANCardBySalora(userRequest);
      if (data?.status === 1 || data?.status === "SUCCESS") {
        setUserInfo((prevUserInfo) => ({
          ...prevUserInfo,
          pan_verified: true,
        }));
        toast.success(data?.message || "Pan Varification Successfull!");
      } else {
        toast.error(data?.message || "Pan Varification Failed!");
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
          <div className="mb-5">
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

          <div className="" >
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
      
      {/* Custom Modal for Verification Results */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center lg:justify-start z-50 lg:ps-16">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className={`px-4 py-1 rounded-t-lg ${modalType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              <h3 className="text-lg font-semibold">
                {modalType == 'success' ? 'Verification Successful' : 'Verification Failed'}
              </h3>
            </div>
            <div className="p-6 text-center">
              <div className="mb-4">
                {modalType === 'success' ? (
                  <div className="text-green-500 text-6xl mb-4">✓</div>
                ) : (
                  <div className="text-red-500 text-6xl mb-4">✕</div>
                )}
              </div>
              <p className="text-lg mb-4 text-gray-800">{modalMessage || "verification response"}</p>
              <p className="text-sm text-gray-600">
                This window will close in <span className="font-bold text-primary">{modalCountdown}</span> seconds and refresh the page.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StartKYC;
