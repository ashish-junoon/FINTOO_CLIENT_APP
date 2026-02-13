import { useState, useEffect } from "react";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Card from "../../components/utils/Card";
import AdharCard from "../../components/utils/AdharCard";
import PanCard from "../../components/utils/PanCard";
import Button from "../../components/utils/Button";
import TextInput from "../../components/fields/TextInput";
import ErrorMsg from "../../components/utils/ErrorMsg";
import Icon from "../../components/utils/Icon";
import {
    generateAdhaarOTP,
    verifyAadhaarOTP,
} from "../../api/Api_call";
import { toast } from "react-toastify";

function TempKYC() {

    const [isLoading, setIsLoading] = useState(false);
    const [startKyc, setStartKyc] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const [adhaarVerified, setAdhaarVerified] = useState(false);
    const [panVerified, setPanVerified] = useState(false);

    //Resend Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setResendTimer((prevTimer) => prevTimer - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    //Handle Aadhaar Verified
    const handleAdharVerify = async () => {
        try {
            // isLoading(true);
            const payload = {
                company_id: import.meta.env.VITE_COMPANY_ID,
                product_name: import.meta.env.VITE_PRODUCT_NAME,
                aadhaar_number: "797943034811"
            }

            const data = await generateAdhaarOTP(payload);
            if (data.status) {
                setStartKyc(true);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error verifying PAN:", error);

        }
    }

    const handlePanVerify = async () => {
        try {
            const data = await generateAdhaarOTP();
            if (data.success) {
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error verifying PAN:", error);

        }
    }

    //Handle resend OTP
    const handleResendOTP = async () => {
        alert("Verify Aadhaar");
        setResendTimer(60);
    }

    //Handle Aadhaar OTP- Validation
    const validateOTP = useFormik({
        initialValues: {
            otp: ''
        },
        validationSchema: Yup.object({
            otp: Yup.string().required('OTP required.')
                .min(6, 'Invalid OTP.')
                .max(6, 'Invalid OTP.')
        }),
        onSubmit: async (values) => {
            toast.success(`OTP ${values.otp} verified successfully.`);

            setInterval(() => {
                setAdhaarVerified(true);
            }, 1000);
        },
    });


    return (
        <div className="flex justify-center items-center h-screen">
            <div className="w-full mx-5">
                <Card heading="eKYC Verification" style="mx-auto max-w-4xl px-4">

                    {/* Aadhaar Card Verification */}
                    <div className="mb-5 flex justify-center">
                        <div className="w-full max-w-xs">
                            <div className="flex justify-center">
                                <AdharCard
                                    name="Ravi Kumar"
                                    dob="01/01/1990"
                                    gender="Male"
                                    aadhaarNumber="XXXX XXXX 1234"
                                />
                            </div>

                            <div className="mt-1">
                                {!adhaarVerified ? (
                                    <>
                                        {!startKyc && (
                                            <Button
                                                btnName={isLoading ? "Sending OTP..." : "Verify Aadhaar"}
                                                type="button"
                                                style="w-full italic py-1.5 px-2 bg-secondary text-black"
                                                btnIcon={"MdOutlineCheckCircle"}
                                                onClick={handleAdharVerify}
                                                disabled={isLoading}
                                            />
                                        )}


                                        {startKyc && (
                                            <div className="w-full max-w-md border border-secondary shadow-md rounded py-6 px-8 mt-4">
                                                <h1 className="text-sm font-semibold italic underline mb-1">
                                                    Verify OTP
                                                </h1>
                                                <p className="text-xs">
                                                    Enter the OTP sent to your mobile.
                                                </p>

                                                <TextInput
                                                    type="text"
                                                    name="otp"
                                                    placeholder="Enter OTP"
                                                    value={validateOTP.values.otp}
                                                    onChange={validateOTP.handleChange}
                                                    onBlur={validateOTP.handleBlur}
                                                    icon={"RiLockPasswordLine"}
                                                    maxLength={6}
                                                    style="w-full"
                                                />

                                                <ErrorMsg error={validateOTP.errors.otp} />

                                                <div className="flex justify-end mt-2">
                                                    {resendTimer > 0 ? (
                                                        <span className="text-xs text-gray-500 italic">
                                                            Resend OTP in {resendTimer}s
                                                        </span>
                                                    ) : (
                                                        <button
                                                            className="text-xs font-semibold text-secondary"
                                                            onClick={handleResendOTP}
                                                            disabled={isLoading}
                                                        >
                                                            Resend OTP
                                                        </button>
                                                    )}
                                                </div>

                                                <Button
                                                    btnName={isLoading ? "Validating..." : "Validate OTP"}
                                                    type="button"
                                                    style="w-full italic py-1.5 px-2 bg-secondary text-black mt-4"
                                                    btnIcon={"MdOutlineCheckCircle"}
                                                    onClick={validateOTP.handleSubmit}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : (

                                    <div className="flex justify-center items-center gap-1 border border-green-500 shadow rounded py-1 px-4">
                                        <Icon
                                            name="MdVerified"
                                            size={20}
                                            color="#22c55e"
                                        />
                                        <span className="text-md font-semibold text-green-500">Aadhaar Verified</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* PAN Card Verification */}
                    {adhaarVerified && (
                        <div className="mb-5 flex justify-center">
                            <div className="w-full max-w-xs"> {/* Set consistent width here */}

                                <div className="flex justify-center">
                                    <PanCard
                                        name="Ravi Kumar"
                                        dob="01/01/1990"
                                        panNumber="ABCDE1234F"
                                    />
                                </div>

                                <div className="mt-1">
                                    {adhaarVerified && !panVerified ? (
                                        <Button
                                            btnName={"Verify PAN Card"}
                                            type="button"
                                            style="w-full italic py-1.5 px-2 bg-secondary text-black"
                                            btnIcon={"MdOutlineCheckCircle"}
                                            onClick={handlePanVerify}
                                        />
                                    ) : (
                                        <div className="flex justify-center items-center gap-1 border border-green-500 shadow rounded py-1 px-4">
                                            <Icon
                                                name="MdVerified"
                                                size={20}
                                                color="#22c55e"
                                            />
                                            <span className="text-md font-semibold text-green-500">PAN Verified</span>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default TempKYC;
