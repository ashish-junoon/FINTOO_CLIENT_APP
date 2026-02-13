import React, { useState, useEffect } from 'react';
import { isMobile, isTablet, isDesktop, osName, browserName } from "react-device-detect";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Card from '../../components/utils/Card';
import ErrorMsg from '../../components/utils/ErrorMsg';
import Button from '../../components/utils/Button';
import TextInput from '../../components/fields/TextInput';
import Icon from '../../components/utils/Icon';
import { RegisterUser, resendOTP, VerifyMobileOTP, CreatePassword } from '../../api/Api_call';
import BtnLoader from '../../components/utils/BtnLoader';

function Register() {

    const [getStart, setGetStart] = useState(true);
    const [loading, setLoading] = useState(false);
    const [device, setDevice] = useState()
    const [register, setRegister] = useState(false);
    const [sendOtp, setSendOtp] = useState(false);
    const [password, setPassword] = useState(false);
    const [userId, setUserId] = useState();
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [userOTP, setUserOTP] = useState();


    const navigate = useNavigate();

    //Get Device Info
    useEffect(() => {
        const deviceInfo = {
            deviceType: isMobile ? "Mobile" : isTablet ? "Tablet" : isDesktop ? "Desktop" : "Unknown",
            os: osName,
            browser: browserName,
            // engine: engineName,
            // userAgent: navigator.userAgent,
        };

        setDevice(deviceInfo.deviceType + " " + deviceInfo.browser + " " + deviceInfo.os)
    }, []);

    // Timer logic for OTP
    useEffect(() => {
        let interval;
        if (sendOtp && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [sendOtp, timer]);


    // Validation for Get Register
    const mobileFormik = useFormik({
        initialValues: {
            mobileNumber: '',
        },
        validationSchema: Yup.object({
            mobileNumber: Yup.string()
                .matches(/^[6-9]\d{9}$/, 'Invalid mobile number.')
                .required('Required'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            const userRequest = {
                mobile_no: values.mobileNumber,
                device_info: device,
                company_id: import.meta.env.VITE_COMPANY_ID,
                product_name: import.meta.env.VITE_PRODUCT_NAME
            };

            try {
                const res = await RegisterUser(userRequest);
                if (res.status) {
                    setUserId(res.user_id)
                    setRegister(false);
                    setSendOtp(true)
                    setUserOTP(res.otp);
                    toast.success(res.message);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.error('Registration failed:', error);
                toast.error('An error occurred during registration.');
            }
            setLoading(false);
        },
    });

    // Validation for OTP Verification
    const otpFormik = useFormik({
        initialValues: {
            otp: '',
        },
        validationSchema: Yup.object({
            otp: Yup.string()
                .matches(/^\d{4}$/, 'Invalid OTP.')
                .required('Required'),
        }),
        onSubmit: async (values) => {
            setLoading(true);

            const userRequest = {
                mobile_no: mobileFormik.values.mobileNumber,
                reg_otp: values.otp,
            };

            try {
                const res = await VerifyMobileOTP(userRequest);
                if (res.status) {
                    setSendOtp(false);
                    setPassword(true);
                    toast.success(res.message);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.error('OTP verification failed:', error);
                toast.error('An error occurred during OTP verification.');
            }
            setLoading(false);
        },
    });

    // Validation for Create Password
    const passwordFormik = useFormik({
        initialValues: {
            password: '',
            cnfrmPassword: '',
        },
        validationSchema: Yup.object({
            password: Yup.string()
                .matches(
                    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,20}$/,
                    'Password must be 8+ characters and include at least one letter, one number, and one special character.'
                )
                .required('Required'),
            cnfrmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Passwords do not match.')
                .required('Required'),
        }),
        onSubmit: async values => {

            setLoading(true);
            const userRequest = {
                user_id: userId,
                password: values.password,
            };

            try {
                const data = await CreatePassword(userRequest);
                if (data.status) {
                    toast.success(data.message);
                    navigate('/login');
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error('Something went wrong. Please try again.');
                console.error('CreatePassword API failed:', error);
            }
            setLoading(false);
        },
    });

    const handleResendOtp = async () => {
        setLoading(true);
        setSendOtp(true);
        setCanResend(false);
        setTimer(60);

        const userRequest = {
            mobile_no: mobileFormik.values.mobileNumber,
            device_info: device,
            company_id: import.meta.env.VITE_COMPANY_ID,
            product_name: import.meta.env.VITE_PRODUCT_NAME

        };

        try {
            const res = await resendOTP(userRequest);
            if (res.status) {
                toast.success(res.message);
                localStorage.setItem('user_id', res.user_id);
                setUserOTP(res.otp);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error('Failed to resend OTP:', error);
            toast.error('Failed to resend OTP. Please try again.');
        }
        setLoading(false);
    };

    const handleStart = () => {
        setGetStart(false);
        setRegister(true);
    };

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <Card heading={getStart ? "Get Started" : "Get Registered"} style={""}>
            <div className='md:px-8 px-2 py-5'>
                {/* Getting Started */}
                {getStart && (
                    <div className='my-2'>
                        <h1 className='text-sm font-semibold my-5'>Keep these documents handy to complete your application quickly.</h1>
                        <div className='my-3 space-y-2'>
                            <div className='flex items-center'>
                                <Icon name="IoCheckmarkCircleSharp" size={16} color='#0b5cff' />
                                <p className='text-xs ml-1 text-black'>PAN Card &nbsp;
                                    <span className='text-gray-600'>(JPEG/PNG)</span>
                                </p>
                            </div>
                            <div className='flex items-center'>
                                <Icon name="IoCheckmarkCircleSharp" size={16} color='#0b5cff' />
                                <p className='text-xs ml-1 text-black'>Aadhaar Card &nbsp;
                                    <span className='text-gray-600'>(JPEG/PNG)</span>
                                </p>
                            </div>
                            <div className='flex items-center'>
                                <Icon name="IoCheckmarkCircleSharp" size={16} color='#0b5cff' />
                                <p className='text-xs ml-1 text-black'>Salary Slip PDF &nbsp;
                                    <span className='text-gray-600'>(Last 3 Months)</span>
                                </p>
                            </div>
                            <div className='flex items-center'>
                                <Icon name="IoCheckmarkCircleSharp" size={16} color='#0b5cff' />
                                <p className='text-xs ml-1 text-black'>Bank Statement PDF &nbsp;
                                    <span className='text-gray-600'>(Last 3 Months)</span>
                                </p>
                            </div>
                        </div>


                        <div className='flex justify-center'>
                            <Button
                                btnName="Get Started"
                                btnIcon="RiArrowRightLine"
                                type="submit"
                                style="mt-4 py-1 bg-secondary text-black hover:shadow-none w-full"
                                onClick={handleStart}
                            />
                        </div>
                        <div className='flex justify-center my-6'>
                            <Button
                                btnName="Already user? Login"
                                btnIcon="RiUser6Line"
                                type="button"
                                style="py-1.5 text-xs text-primary hover:bg-primary hover:text-white border border-primary w-full"
                                onClick={handleLogin}
                            />
                        </div>
                    </div>
                )}


                {/* Mobile Number Form */}
                {register && (
                    <form onSubmit={mobileFormik.handleSubmit}>
                        <div className='mb-3'>
                            <TextInput
                                isFocused
                                label="Mobile Number"
                                icon="IoPhonePortraitOutline"
                                placeholder="Enter 10 Digit Number"
                                name="mobileNumber"
                                id="mobileNumber"
                                required
                                maxLength={10}
                                onChange={mobileFormik.handleChange}
                                onBlur={mobileFormik.handleBlur}
                                value={mobileFormik.values.mobileNumber}
                                style={sendOtp ? 'bg-dark' : 'bg-white'}
                            />
                            {mobileFormik.touched.mobileNumber && mobileFormik.errors.mobileNumber && (
                                <ErrorMsg error={mobileFormik.errors.mobileNumber} />
                            )}
                        </div>
                        <div className="flex justify-center">
                            <Button
                                btnName={loading ? <BtnLoader /> : "Get OTP"}
                                btnIcon={loading ? null : "RiArrowRightLine"}
                                type={loading ? "button" : "submit"}
                                style={`mt-4 py-1 ${loading ? "bg-gray-400" : "bg-secondary"} text-black w-full`}
                                disabled={loading}
                            />
                        </div>
                        <div className='flex justify-center mt-6'>
                            <Button
                                btnName="Already user? Login"
                                btnIcon="RiUser6Line"
                                type="button"
                                style="py-1.5 text-xs text-primary hover:bg-primary hover:text-white border border-primary w-full"
                                onClick={handleLogin}
                            />
                        </div>
                    </form>
                )}


                {/* OTP Form */}
                {sendOtp && (
                    <form onSubmit={otpFormik.handleSubmit}>
                        <div className='mb-3'>
                            <TextInput
                                label="Mobile No"
                                icon="IoPhonePortraitOutline"
                                placeholder="Enter Mobile Number"
                                name="mobileNumber"
                                id="mobileNumber"
                                value={mobileFormik.values.mobileNumber}
                                disabled
                                style="bg-light"
                            />
                        </div>

                        <TextInput
                            label="OTP"
                            icon="IoPhonePortraitOutline"
                            placeholder="Enter OTP"
                            name="otp"
                            type="text"
                            id="otp"
                            maxLength={4}
                            onChange={otpFormik.handleChange}
                            onBlur={otpFormik.handleBlur}
                            value={otpFormik.values.otp}
                        />
                        {otpFormik.touched.otp && otpFormik.errors.otp && (
                            <ErrorMsg error={otpFormik.errors.otp} />
                        )}


                        <div className="flex justify-end my-2">
                            {canResend ? (
                                <button
                                    className="text-primary text-xs font-semibold underline"
                                    onClick={handleResendOtp}
                                    type="button"
                                >
                                    Resend OTP
                                </button>
                            ) : (
                                <span className="text-[9px] sm:text-xs font-semibold text-dark">
                                    Resend OTP in {timer} sec
                                </span>
                            )}
                        </div>

                        <div className="flex justify-center">
                            <Button
                                btnName={loading ? <BtnLoader /> : "Verify OTP"}
                                btnIcon={loading ? null : "RiArrowRightLine"}
                                type={loading ? "button" : "submit"}
                                style="mt-4 py-1 bg-primary text-white w-full"
                                disabled={loading}
                            // onClick={handleVerifyOTP}
                            />
                        </div>
                    </form>
                )}

                {/* Password Form */}
                {password && (
                    <form onSubmit={passwordFormik.handleSubmit} className='my-5'>
                        {/* Password Field */}
                        <div className='mb-4'>
                            <TextInput
                                label="Password"
                                icon="RiLockPasswordLine"
                                placeholder="Enter Password"
                                name="password"
                                type="password"
                                id="password"
                                maxLength={30}
                                onChange={passwordFormik.handleChange}
                                onBlur={passwordFormik.handleBlur}
                                value={passwordFormik.values.password}
                            />
                            {passwordFormik.touched.password && passwordFormik.errors.password && (
                                <ErrorMsg error={passwordFormik.errors.password} />
                            )}
                        </div>

                        <div className='mb-4'>
                            {/* Confirm Password Field */}
                            <TextInput
                                label="Confirm Password"
                                icon="RiLockPasswordLine"
                                placeholder="Confirm Password"
                                name="cnfrmPassword"
                                type="password"
                                id="cnfrmPassword"
                                maxLength={30}
                                onChange={passwordFormik.handleChange}
                                onBlur={passwordFormik.handleBlur}
                                value={passwordFormik.values.cnfrmPassword}
                            />
                            {passwordFormik.touched.cnfrmPassword && passwordFormik.errors.cnfrmPassword && (
                                <ErrorMsg error={passwordFormik.errors.cnfrmPassword} />
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <Button
                                btnName={loading ? <BtnLoader /> : "Submit"}
                                btnIcon={loading ? null : "RiArrowRightLine"}
                                type={loading ? "button" : "submit"}
                                style="mt-4 py-1 bg-primary text-white w-full"
                            />
                        </div>
                    </form>
                )}
            </div>
        </Card>
    );
}

export default Register;
