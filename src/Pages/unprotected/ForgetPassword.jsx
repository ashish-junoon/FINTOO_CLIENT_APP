import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { isMobile, isTablet, isDesktop, osName, browserName, engineName, getUA } from "react-device-detect";
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Card from '../../components/utils/Card';
import ErrorMsg from '../../components/utils/ErrorMsg';
import Button from '../../components/utils/Button';
import TextInput from '../../components/fields/TextInput';
import { ForgetPasswordOTP, RegisterUser, VerifyMobileOTP, CreatePassword, resendOTP } from '../../api/Api_call';

function ForgetPassword() {

    const [register, setRegister] = useState(true);
    const [sendOtp, setSendOtp] = useState(false);
    const [password, setPassword] = useState(false);
    const [userId, setUserId] = useState();
    const [timer, setTimer] = useState(60);
    const [device, setDevice] = useState()
    const [canResend, setCanResend] = useState(false);
    const [userOTP, setUserOTP] = useState();

    const navigate = useNavigate();

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


    // Generate Reset Password OTP
    const mobileFormik = useFormik({
        initialValues: {
            mobileNumber: '',
        },
        validationSchema: Yup.object({
            mobileNumber: Yup.string()
                .matches(/^[6-9]\d{9}$/, 'Invalid mobile number.')
                .required('Required'),
        }),
        onSubmit: async (values, {setSubmitting}) => {
            const userRequest = {
                mobile_number: values.mobileNumber,
                company_id: import.meta.env.VITE_COMPANY_ID,
                product_name: import.meta.env.VITE_PRODUCT_NAME
            };

            try {
                const data = await ForgetPasswordOTP(userRequest);
                if (data.status) {
                    setUserId(data.user_id)
                    setRegister(false);
                    setSendOtp(true)
                    setUserOTP(data.mobile_otp);
                    toast.success(data.message);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.error('Reset password failed:', error);
            } finally {
                setSubmitting(false);
            }
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
        onSubmit: async (values, {setSubmitting}) => {
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
            } finally {
                setSubmitting(false);
            }
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
        onSubmit: async (values, setSubmitting) => {
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
            } finally {
                setSubmitting(false);
            }
        },
    });


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

    const handleResendOtp = async () => {
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
    };

    return (
        <Card heading="Reset Password" style={"px-10"}>
            <div className='md:px-8 px-2 py-4'>
                {/* Mobile Number Form */}
                {register && (
                    <form onSubmit={mobileFormik.handleSubmit} className='my-4'>
                        <TextInput
                            isFocused
                            label="Mobile No"
                            icon="IoPhonePortraitOutline"
                            placeholder="Enter Mobile Number"
                            name="mobileNumber"
                            id="mobileNumber"
                            maxLength={10}
                            onChange={mobileFormik.handleChange}
                            onBlur={mobileFormik.handleBlur}
                            value={mobileFormik.values.mobileNumber}
                            disabled={sendOtp}
                            style={sendOtp ? 'bg-dark' : 'bg-white'}
                        />
                        {mobileFormik.touched.mobileNumber && mobileFormik.errors.mobileNumber && (
                            <ErrorMsg error={mobileFormik.errors.mobileNumber} />
                        )}
                        <div className="flex justify-center">
                            <Button
                                btnName="Get OTP"
                                btnIcon="RiArrowRightLine"
                                disabled={mobileFormik.isSubmitting}
                                type="submit"
                                style="mt-5 py-1 bg-secondary text-black w-full"
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
                                maxLength={10}
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
                            required
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
                                    type="button"
                                    onClick={handleResendOtp}
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
                                btnName="Verify OTP"
                                btnIcon="RiArrowRightLine"
                                disabled={otpFormik.isSubmitting}
                                type="submit"
                                style="mt-4 py-1 bg-secondary text-black hover:bg-secondary w-full"
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
                                btnName="Submit"
                                btnIcon="RiArrowRightLine"
                                type="submit"
                                disabled={passwordFormik.isSubmitting}
                                style="mt-4 py-1 bg-secondary text-black hover:bg-secondary w-full"
                            />
                        </div>
                    </form>
                )}
            </div>
        </Card>
    );
}

export default ForgetPassword;