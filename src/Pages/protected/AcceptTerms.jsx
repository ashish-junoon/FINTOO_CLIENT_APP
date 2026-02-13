import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { isMobile, isTablet, isDesktop, osName, browserName } from "react-device-detect";
import { useUserInfoContext } from "../../components/context/UserInfoContext";
import { getAgreement, getSanctionLetter, sendSanctionConsentOTP, validateSanctionOTP } from "../../api/Api_call";
import Modal from "../../components/utils/Modal";
import { Link, useNavigate } from "react-router-dom";
import TextInput from "../../components/fields/TextInput";
import BtnLoader from "../../components/utils/BtnLoader";
import ErrorMsg from "../../components/utils/ErrorMsg";
import Button from "../../components/utils/Button";
import { toast } from "react-toastify";

function AcceptTerms() {
    const [agreementData, setAgreementData] = useState(null);
    const [isRead, setIsRead] = useState(false);
    const [sanctionData, setSanctionData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [device, setDevice] = useState()
    const [ipAddress, setIpAddress] = useState("");

    const navigate = useNavigate();
    const { userInfo, setUserInfo } = useUserInfoContext();

    useEffect(() => {
        const deviceInfo = {
            deviceType: isMobile ? "Mobile" : isTablet ? "Tablet" : isDesktop ? "Desktop" : "Unknown",
            os: osName,
            browser: browserName,
        };

        setDevice(deviceInfo)
    }, []);

    useEffect(() => {
        const fetchIpAddress = async () => {
            try {
                const response = await fetch("https://api.ipify.org?format=json");
                const data = await response.json();
                setIpAddress(data.ip);
            } catch (error) {
                console.error("Error fetching IP address:", error);
            }
        };

        fetchIpAddress();
    }, []);


    const getAgreementLetter = async () => {
        const req = {
            company_id: import.meta.env.VITE_COMPANY_ID,
            product_name: import.meta.env.VITE_PRODUCT_NAME,
            user_id: userInfo?.user_id,
            lead_id: userInfo?.lead_id
        };
        try {
            const response = await getAgreement(req);

            if (response.status) {
                setAgreementData(response.html_agreement_letter);
            } else {
                console.log(response.message);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        getAgreementLetter();
    }, []);

    const getSanctionHTML = async () => {
        setIsLoading(true);
        const req = {
            company_id: import.meta.env.VITE_COMPANY_ID,
            product_name: import.meta.env.VITE_PRODUCT_NAME,
            user_id: userInfo?.user_id,
            lead_id: userInfo?.lead_id,
        };
        try {
            const response = await getSanctionLetter(req);

            if (response.status) {
                setSanctionData(response.html_sanction_letter);
            } else {
                console.log(response.message);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        getSanctionHTML();
    }, []);

    const handleCheck = async (e) => {
        setIsChecked(e.target.checked);
        if (e.target.checked) {
            const req = {
                company_id: import.meta.env.VITE_COMPANY_ID,
                product_name: import.meta.env.VITE_PRODUCT_NAME,
                user_id: userInfo?.user_id,
                lead_id: userInfo?.lead_id,
            }

            try {
                const response = await sendSanctionConsentOTP(req);

                if (response.status) {
                    toast.success(response.message);
                } else {
                    toast.error(response.message);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
    };

    const handleSuccess = () => {
        navigate("/");
    };

    const handleAggree = () => {
        setIsOpen(true);
    }

    const handleClose = () => {
        setIsRead(true);
        setIsOpen(false);
    }

    const formik = useFormik({
        initialValues: {
            otp: "",
        },
        validationSchema: Yup.object({
            otp: Yup.string()
                .required("Required")
                .matches(/^[0-9]{4}$/, "Invalid OTP."),
        }),
        onSubmit: async (values) => {
            setIsLoading(true);

            const req = {
                company_id: import.meta.env.VITE_COMPANY_ID,
                product_name: import.meta.env.VITE_PRODUCT_NAME,
                user_id: userInfo?.user_id,
                lead_id: userInfo?.lead_id,
                sanction_consent_otp: values.otp,
                device_info: device.deviceType + " " + device.browser,
                operating_system: device.os,
                ip: ipAddress,
            }

            try {
                const response = await validateSanctionOTP(req);

                if (response.status) {
                    setIsOpen(false);
                    handleSuccess();
                    setUserInfo((prevUserInfo) => ({
                        ...prevUserInfo,
                        is_loan_consent: true,
                    }));
                    toast.success(response.message);
                } else {
                    toast.error(response.message);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
            setIsLoading(false);
        },
    });

    return (
        <>
            <div className="">
                <div>
                    <div className="h-[450px] overflow-y-auto ">
                        <div className="mb-14">
                            {sanctionData && <div className="" dangerouslySetInnerHTML={{ __html: sanctionData }} />}
                        </div>
                        <div className="border border-gray-200 px-5 shadow-md rounded bg-gray-50">

                            {!isChecked && (
                                <div className="my-4">
                                    <input className="mr-2" type="checkbox" onChange={isRead ? handleCheck : handleAggree} checked={isChecked} />
                                    <span>I have read and agree to the
                                        <Link
                                            className="text-blue-500 underline px-2"
                                            target="_blank"
                                            to={`/agreement?leadId=${userInfo?.lead_id}&userId=${userInfo?.user_id}`}
                                        >
                                            Agreement
                                        </Link>
                                        & Sanction Terms, and I provide my consent via OTP.</span>
                                </div>
                            )}

                            {isChecked && (
                                <form onSubmit={formik.handleSubmit} className="my-2">
                                    <div className="md:w-2/6 mx-auto">
                                        <TextInput
                                            label="Confirm OTP"
                                            icon=""
                                            placeholder="Enter OTP"
                                            name="otp"
                                            required
                                            maxLength={4}
                                            {...formik.getFieldProps("otp")}
                                        />
                                        {formik.touched.otp && formik.errors.otp && (
                                            <ErrorMsg error={formik.errors.otp} />
                                        )}
                                    </div>
                                    <div className="flex  justify-center items-center">
                                        <Button
                                            btnName={isLoading ? <BtnLoader /> : "Agree & Accept"}
                                            btnIcon={isLoading ? null : ""}
                                            type={isLoading ? "button" : "submit"}
                                            style={`mt-4 py-1 px-2 bg-primary text-white text-black md:w-3/6`}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isOpen} onClose={handleClose} heading="">
                <div>
                    {agreementData && <div dangerouslySetInnerHTML={{ __html: agreementData }} />}

                    <div className="flex  justify-center items-center my-5">
                        <Button
                            btnName={isLoading ? <BtnLoader /> : "Close & Continue"}
                            btnIcon={isLoading ? null : ""}
                            onClick={handleClose}
                            style={`mt-4 py-1 px-2 ${isLoading ? "bg-blue-500" : "bg-[#ae275f]"} text-white w-3/6`}
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default AcceptTerms;
