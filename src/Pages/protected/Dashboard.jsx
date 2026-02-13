import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import Card from "../../components/utils/Card"
import { useAuth } from '../../components/context/AuthContext'
import Button from "../../components/utils/Button"
import { useUserInfoContext } from '../../components/context/UserInfoContext'
import { getProductAssigned, sendEmailOTP, verifyEmailOTP, uploadProfileImage } from "../../api/Api_call"
import TextInput from '../../components/fields/TextInput'
import ErrorMsg from '../../components/utils/ErrorMsg'
import ImageInput from '../../components/fields/ImageInput'
import BtnLoader from '../../components/utils/BtnLoader'
import { useGetDocument } from '../../components/context/GetDocument'
import PaymentCard from '../../components/utils/payment-card'
import LoanClosureCard from '../../components/utils/loan-closure-card'
import { useEmiContext } from '../../components/context/EmiContext'


function Dashboard() {
    const [product, setProduct] = useState();
    const [loading, setLoading] = useState(false);
    const [isEmailOTP, setIsEmailOTP] = useState(false);
    const [isSelfie, setIsSelfie] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [timer, setTimer] = useState(60);
    const navigate = useNavigate();

    const { userInfo, setUserInfo } = useUserInfoContext();
    const { emiData } = useEmiContext();
    const { loggedUser } = useAuth();
    const { documents } = useGetDocument();
    const emiToPay = userInfo?.emiToPay?.[0];
    const loanAmount = userInfo?.selectedproduct?.[0]?.loan_amount


    //Logout user after cookie expires
    const item = localStorage.getItem("loggedUser");

    if (item) {
        const data = JSON.parse(item);
        const now = new Date();

        if (now.getTime() > data.expiry) {
            localStorage.removeItem("loggedUser"); // Remove expired item
            navigate("/");
        }
    }


    // Remove expired item or empty object
    // useEffect(() => {
    //     if (
    //         !userInfo || // null or undefined
    //         typeof userInfo !== "object" || // not an object
    //         Object.keys(userInfo).length === 0 || // empty object
    //         userInfo.status === false || // status false
    //         !userInfo.user_id || // user_id missing
    //         !userInfo.lead_id // lead_id missing
    //     ) {
    //         localStorage.removeItem("loggedUser");
    //         navigate("/login");
    //     }
    // }, [userInfo]);


    const handleEmailOTPVerified = () => {
        setUserInfo(() => ({
            ...userInfo,
            email_otp_verified: true,
        }));
    }


    const handleProfileUpload = () => {
        setUserInfo(() => ({
            ...userInfo,
            selfie_uploaded_verified: true,
        }));
    }

    const handleSendEmailOTP = async (req) => {
        setLoading(true);
        const request = {
            user_id: userInfo?.user_id,
            email_id: userInfo?.personalInfo[0].email_id
        }

        try {
            const response = await sendEmailOTP(request);
            // console.log("API Response:", response);

            if (response.status) {
                setIsEmailOTP(true)
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("An error occurred while fetching data.");
        }
        setLoading(false);
    }

    const formik = useFormik({
        initialValues: {
            emailOTP: '',
        },
        validationSchema: Yup.object({
            emailOTP: Yup.string()
                .required('OTP is required')
                .matches(/^\d{4}$/, 'OTP must be 4 digits'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            const request = {
                user_id: userInfo?.user_id,
                email_otp: values.emailOTP,
            };

            try {
                const response = await verifyEmailOTP(request);
                if (response.status) {
                    handleEmailOTPVerified();
                    toast.success(response.message);
                } else {
                    toast.error(response.message);
                }
            } catch (error) {
                console.error("Error sending OTP:", error);
                toast.error("Failed to send OTP. Please try again.");
            }
            setLoading(false);
        },
    });


    const selfieUpload = useFormik({
        initialValues: {
            selfie: '',
        },
        validationSchema: Yup.object({
            selfie: Yup.mixed().required('Photo required'),
        }),
        onSubmit: async (values) => {
            try {
                // Convert files to Base64
                const convertFileToBase64 = async (file) => {
                    if (!file) return null;
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = (error) => reject(error);
                        reader.readAsDataURL(file);
                    });
                };

                const selfieCardBase64 = await convertFileToBase64(values.selfie);

                const userRequest = {
                    user_id: userInfo?.user_id,
                    profile_image_name: values.selfie?.name,
                    profile_image_extn: values.selfie?.name?.split('.').pop(),
                    profile_image_data: selfieCardBase64 ? selfieCardBase64.split(",")[1] : null
                };

                // console.log(userRequest);

                const data = await uploadProfileImage(userRequest);

                if (data.status) {
                    toast.success(data.message);
                    handleProfileUpload();
                    location.reload();
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error('Something went wrong. Please try again.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                console.error('Add KYC info error:', error);
            }
        },
    });

    const handleApplyForLoan = async (req) => {
        setLoading(true);
        const request = {
            user_id: userInfo?.user_id,
            lead_id: userInfo?.lead_id
        }

        try {
            const response = await getProductAssigned(request);
            // console.log("API Response:", response);

            if (response.status) {
                // toast.success(response.message);
                setProduct(response.data);
                navigate('/process-loan', { state: { lead_id: userInfo?.lead_id, user_id: userInfo?.user_id } });
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("An error occurred while fetching data.");
        }
        setLoading(false);
    }

    const handleUploadSelfie = async (req) => {
        setIsSelfie(true)
    };



    //Reset Timer
    useEffect(() => {
        if (disabled) {
            const interval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer === 1) {
                        clearInterval(interval);
                        setDisabled(false);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [disabled]);


    useEffect(() => {
        if (loggedUser?.bank_info_fill === false) {
            navigate("/apply-loan");
        }
    }, [loggedUser, navigate]);



    return (
        <div className="mb-16" >
            {/* Profile Card */}
            <Card style={"px-4 md:px-8 mb-5"} >
                <div className="grid grid-cols-3">
                    <div className="col-span-2 py-2">
                        <h1 className="text-xs">Welcome!</h1>
                        <h1 className="text-base font-bold">{userInfo?.personalInfo[0].full_name}</h1>
                    </div>
                    <div className="col-span-1">
                        <div className="flex justify-end">
                            {documents?.aadhaar_pan?.length > 0 && (
                                <img
                                    className="w-16 h-16 object-cover bg-slate-300 rounded-full shadow"
                                    src={documents?.profileImages?.[0]?.profile_image_code_url}
                                    alt="Profile"
                                />
                            )}
                        </div>
                    </div>
                </div>
                <span className='text-xs font-semibold'>Application Reference:</span>
                <div className="flex justify-left items-center border-b border-gray-400">
                    <h1 className='font-bold text-primary'>{userInfo?.lead_id}</h1>
                </div>

                <div className="flex justify-center items-center py-3">
                    <h1 className="text-center font-semibold text-xs">Status:</h1>
                    {userInfo?.is_e_kyc_done === false && (
                        <span className={`text-xs font-bold px-4 py-1 mx-2 bg-lime-100 text-green-400 rounded shadow-md`}>
                            In-Process
                        </span>
                    )}

                    {userInfo?.is_e_kyc_done && (userInfo?.lead_status === 5 || userInfo?.lead_status === 24 || userInfo?.lead_status === 25 || userInfo?.lead_status === 26) && (
                        <span className={`text-xs font-bold px-4 py-1 mx-2 bg-green-100 text-success rounded shadow-md`}>
                            Approved
                        </span>
                    )}
                    {userInfo?.lead_status === 6 && (
                        <span className={`text-xs font-bold px-4 py-1 mx-2 bg-green-500 text-white rounded shadow-md`}>
                            Active
                        </span>
                    )}
                    {userInfo?.lead_status == 10 && (
                        <span className={`text-xs font-bold px-4 py-1 mx-2 bg-green-200  text-green-500 rounded shadow-md`}>
                            Closed
                        </span>
                    )}
                </div>
            </Card>

            {/* Send Email OTP */}
            {userInfo?.email_otp_verified == false && !isEmailOTP && (
                <div className="grid grid-cols-3 shadow mb-5 py-1.5 px-5 border border-red-200">

                    <div className="col-span-2 font-semibold italic text-xs text-black flex justify-start items-center">
                        {userInfo?.personalInfo[0].email_id}
                    </div>
                    <div className='col-span-1'>
                        <div className='flex justify-end'>
                            <Button
                                btnName={loading ? <BtnLoader width={20} height={20} /> : "Verify"}
                                type={loading ? "button" : "submit"}
                                style={`py-1 ${loading ? "bg-gray-500" : "bg-red-200"} text-red-600 w-3/4 text-xs font-bold`}
                                onClick={loading ? null : handleSendEmailOTP}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div >
            )
            }
            {/* Email OTP Verification */}
            {
                userInfo?.email_otp_verified == false && isEmailOTP && (
                    <div className='border my-5 py-5 shadow-lg'>
                        <div className="flex flex-col justify-center items-center py-3 px-5">
                            <p className='text-center text-xs'>OTP has been sent to your email<br /> <span className='text-primary font-semibold'>{userInfo?.personalInfo[0].email_id}</span></p>
                        </div>
                        <form onSubmit={formik.handleSubmit}>
                            <div className="grid grid-cols-3 py-3 px-12">
                                <div className="col-span-2 flex justify-start">
                                    <div>
                                        <TextInput
                                            label=""
                                            icon="MdOutlineVerified"
                                            placeholder="Enter Email OTP"
                                            name="emailOTP"
                                            maxLength={4}
                                            {...formik.getFieldProps('emailOTP')}
                                        />
                                        {formik.touched.emailOTP && formik.errors.emailOTP && (
                                            <ErrorMsg error={formik.errors.emailOTP} />
                                        )}
                                    </div>
                                </div>

                                <div className='col-span-1'>
                                    <Button
                                        btnName={loading ? <BtnLoader width={20} height={20} /> : "validate"}
                                        type={loading ? "button" : "submit"}
                                        style={`py-2 mt-1 ml-2 ${loading ? "bg-blue-300" : "bg-secondary"} text-black px-4 uppercase text-xs font-bold`}
                                        disabled={loading}
                                    />
                                </div>
                            </div >
                            <div className='flex justify-center items-center'>
                                <button
                                    className={`text-xs font-semibold ${disabled ? "text-gray-500" : "text-primary"}`}
                                    type="button"
                                    disabled={disabled} onClick={handleSendEmailOTP}>{disabled ? `Resend OTP in ${timer}s` : "Resend OTP"}</button>
                            </div>
                        </form>
                    </div >
                )
            }

            {/* Uplad Selfie */}
            {
                userInfo?.selfie_uploaded_verified == false && !isSelfie && (
                    <div className="grid grid-cols-3 shadow mb-5 py-1.5 px-5 border border-red-200">

                        <div className="col-span-2 flex justify-start items-center font-semibold italic text-xs text-black">
                            Capture or upload your selfie
                        </div>
                        <div className='col-span-1flex'>
                            <div className='flex justify-end'>
                                <Button
                                    btnName={"Take Selfie"}
                                    // type={loading ? "button" : "submit"}
                                    style={`py-1 ${loading ? "bg-gray-200" : "bg-red-200"} text-red-600 w-3/4 text-xs font-bold`}
                                    onClick={handleUploadSelfie}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div >
                )
            }

            {/* Upload Selfie */}
            {
                userInfo?.selfie_uploaded_verified == false && isSelfie && (
                    <div>
                        <form onSubmit={selfieUpload.handleSubmit}>
                            <div className="flex flex-col justify-center items-center py-3 px-3">
                                <div className="col-span-2">
                                    <div className='flex justify-center items-center'>
                                        <div className=''>
                                            <ImageInput
                                                label="Click to capture or upload selfie"
                                                name="selfie"
                                                id="selfie"
                                                style="h-46 w-30"
                                                aspect={1}
                                                onChange={(file) => selfieUpload.setFieldValue('selfie', file)}
                                                onBlur={selfieUpload.handleBlur}
                                            />
                                            {selfieUpload.touched.selfie && selfieUpload.errors.selfie && (
                                                <ErrorMsg error={selfieUpload.errors.selfie} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {selfieUpload.values.selfie && (
                                    <div className='col-span-1'>
                                        <div className='flex justify-center items-center mt-5'>
                                            <Button
                                                btnName={loading ? <BtnLoader width={20} height={20} /> : "Upolad"}
                                                type={loading ? "button" : "submit"}
                                                style={`py-1 ${loading ? "bg-gray-500" : "bg-secondary"} w-full uppercase text-xs px-4 font-semibold text-black`}
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div >
                        </form>
                    </div >
                )
            }

            {/* Lead Status Messages */}
            {
                userInfo?.lead_status &&
                (() => {
                    const statusMessages = {
                        1: {
                            heading: "Application Received",
                            message: "Thank you for choosing us. We are currently processing your application.",
                            button: false,
                        },
                        2: {
                            heading: "Under Review",
                            message: "Your application is being assessed for further consideration.",
                            button: false,
                        },
                        3: {
                            heading: "Credit Assessment",
                            message: "Your application is undergoing a credit assessment to determine eligibility for the credit line.",
                            button: false,
                        },
                        4: {
                            heading: "Approved",
                            message: userInfo?.is_loan_consent === true
                                ? "Congratulations! Your application has been approved for the credit line. It will be deposited into your account soon."
                                : "Your application has been approved for the credit line. Please continue to complete your KYC & finish application.",
                            button: userInfo?.is_loan_consent === false ? true : false,
                        },
                        5: {
                            heading: "Credit Line Approved",
                            message: "Congratulations! Your application has been approved for the credit line. It will be deposited into your account soon.",
                            button: false,
                        },
                        24: {
                            heading: "Credit Line Approved",
                            message: "Congratulations! Your application has been approved for the credit line. It will be deposited into your account soon.",
                            button: false,
                        },
                        25: {
                            heading: "Request Proceed for Disbursement",
                            message: "Congratulations! Your application has been Proceed. It will be deposited into your account soon.",
                            button: false,
                        },
                        7: {
                            heading: "Rejected",
                            message: "We regret to inform you that your application has been rejected due to our internal policies.",
                            button: false,
                        },
                        8: {
                            heading: "Follow-up",
                            message: "We have made attempts to contact you but have not yet received confirmation. We will reach out to you again to obtain confirmation.",
                            button: false,
                        },
                        9: {
                            heading: "Hold Disbursal",
                            message: "We regret to inform you that your disbursal has been held due to our internal policies.",
                            button: false,
                        },
                        26: {
                            heading: "Amount Disbursement Failed",
                            message: "Unfortunately, your amount disbursement process was initiated but failed. We will reinitiate it within 24 to 36 hours.",
                            button: false,
                        },
                    };

                    const currentStatus = statusMessages[userInfo?.lead_status];

                    return (
                        <div className="mb-8 shadow-md rounded-b-lg">
                            {/* Status card till credit assessment */}
                            {currentStatus && (
                                <>
                                    <div
                                        className={`py-1 text-sm shadow-sm ${userInfo?.lead_status === 26 ? "bg-red-100 text-red-500" : userInfo?.is_e_kyc_done ? "bg-green-100 text-green-600" : "bg-lime-100 text-black"}`}
                                    >
                                        <h1 className="text-center font-semibold text-md">{currentStatus.heading}</h1>
                                    </div>
                                    <div
                                        className={`flex flex-col justify-center items-center py-2 border px-5 rounded-b-lg ${userInfo?.is_e_kyc_done ? "border-green-100" : "border-lime-100"
                                            }`}
                                    >
                                        <div className="justify-center">
                                            <h6 className="text-sm text-center py-2">{currentStatus.message}</h6>
                                            {currentStatus.button && (
                                                <div className="flex justify-center">
                                                    {(() => {
                                                        if (!userInfo?.getAssignProduct === null || userInfo?.getAssignProduct?.length >= 1) {
                                                            return (
                                                                <Button
                                                                    btnName="Continue"
                                                                    style="px-4 md:px-8 text-sm my-2 py-2 w-2/3 bg-primary text-white"
                                                                    btnIcon="PiHandCoinsDuotone"
                                                                    onClick={handleApplyForLoan}
                                                                />
                                                            );
                                                        } else if (
                                                            userInfo?.getAssignProduct?.length >= 1 &&
                                                            userInfo?.getAssignProduct?.every(item => item.otp_consent_verified === true) &&
                                                            userInfo?.is_e_kyc_done === false
                                                        ) {
                                                            return (
                                                                <Button
                                                                    btnName="Continue eKYC"
                                                                    style="px-4 md:px-8 text-sm my-2 py-2 w-2/3 bg-primary text-white"
                                                                    btnIcon="PiHandCoinsDuotone"
                                                                    onClick={handleApplyForLoan}
                                                                />
                                                            );
                                                        } else if (userInfo?.getAssignProduct?.every(item => item.otp_consent_verified === true) && userInfo?.is_e_kyc_done === true && userInfo?.is_e_nach_activate === false) {
                                                            return (
                                                                <Button
                                                                    btnName="Continue eNACH"
                                                                    style="px-4 md:px-8 text-sm my-2 py-2 w-2/3 bg-primary text-white"
                                                                    btnIcon="PiHandCoinsDuotone"
                                                                    onClick={handleApplyForLoan}
                                                                />
                                                            );
                                                        } else if (userInfo?.is_e_nach_activate === true && userInfo?.is_loan_consent === false) {
                                                            return (
                                                                <Button
                                                                    btnName="Finish Application"
                                                                    style="px-4 md:px-8 text-sm my-2 py-2 w-2/3 bg-primary text-white"
                                                                    btnIcon="PiHandCoinsDuotone"
                                                                    onClick={handleApplyForLoan}
                                                                />
                                                            );
                                                        } else {
                                                            return null;
                                                        }
                                                    })()}
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </>
                            )}
                        </div>
                    );
                })()
            }

            {/* Screen After Loan Disbursed */}

            {/* Credit Score */}
            {
                userInfo?.lead_status === 6 && (

                    <Card style={"mb-4"}>
                        <div className='grid grid-cols-2 gap-5'>

                            <div >
                                <h1 className='text-center font-semibold text-xs text-primary'>Credit Score</h1>
                                <div className='flex justify-center items-center mt-1'>
                                    <div
                                        className={`px-4 py-2 text-white shadow rounded ${userInfo?.cibilCreditScores[0]?.credit_score <= 500
                                            ? "bg-danger"
                                            : userInfo?.cibilCreditScores[0]?.credit_score >= 501 &&
                                                userInfo?.cibilCreditScores[0]?.credit_score <= 674
                                                ? "bg-warning"
                                                : userInfo?.cibilCreditScores[0]?.credit_score >= 675 &&
                                                    userInfo?.cibilCreditScores[0]?.credit_score <= 750
                                                    ? "bg-success"
                                                    : "bg-[#0de20d]"
                                            }`}
                                    >
                                        <span className="font-bold text-xl">
                                            {userInfo?.cibilCreditScores[0]?.credit_score}
                                        </span>
                                    </div>

                                </div>
                            </div>
                            <div className=''>
                                <div className="flex justify-start items-center">
                                    <div className="w-3 h-3 bg-danger rounded mr-1"></div>
                                    <p className="text-xs">Low</p>
                                </div>
                                <div className="flex justify-start items-center">
                                    <div className="w-3 h-3 bg-warning rounded mr-1"></div>
                                    <p className="text-xs">Fair</p>
                                </div>
                                <div className="flex justify-start items-center">
                                    <div className="w-3 h-3 bg-success rounded mr-1"></div>
                                    <p className="text-xs">Good</p>
                                </div>
                                <div className="flex justify-start items-center">
                                    <div className="w-3 h-3 bg-[#0de20d] rounded mr-1"></div>
                                    <p className="text-xs">Excellent</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                )
            }

            {/* EMI Payment Card */}
            {
                userInfo?.emiToPay?.length == !null && (
                    <PaymentCard emiData={emiToPay} emisheduleData={emiData} />
                )
            }

            {/* Loan Closure Card */}
            {
                userInfo?.lead_status === 10 && (
                    <LoanClosureCard customerName={userInfo?.personalInfo[0]?.full_name} maxEligibleAmount={loanAmount} />
                )
            }
        </div >
    )
}
export default Dashboard