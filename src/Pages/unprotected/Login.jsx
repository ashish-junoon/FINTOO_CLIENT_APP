import { useState } from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import Card from '../../components/utils/Card';
import ErrorMsg from '../../components/utils/ErrorMsg';
import TextInput from '../../components/fields/TextInput';
import Button from '../../components/utils/Button';
import { userLogin } from '../../api/Api_call';
import { useAuth } from "../../components/context/AuthContext";
import Images from '../../components/content/Images';
import BtnLoader from '../../components/utils/BtnLoader';

function Login() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const isConsent = false

    const item = localStorage.getItem("loggedUser");

    if (item) {
        const data = JSON.parse(item);
        const now = new Date();

        if (now.getTime() > data.expiry) {
            localStorage.removeItem("loggedUser"); // Remove expired item
            navigate("/");
        }
    }



    const formik = useFormik({
        initialValues: {
            mobileNumber: '',
            password: '',
        },
        validationSchema: Yup.object({
            mobileNumber: Yup.string()
                .matches(/^[6-9]\d{9}$/, 'Invalid mobile number.')
                .required('Mobile number is required'),
            password: Yup.string().required('Password is required'),
        }),
        onSubmit: async ({ mobileNumber, password }) => {
            setLoading(true);
            try {
                const request = {
                    mobile_number: mobileNumber,
                    password: password,
                    company_id: import.meta.env.VITE_COMPANY_ID,
                    product_name: import.meta.env.VITE_PRODUCT_NAME
                };

                const response = await userLogin(request);

                if (response?.status) {
                    // Check if all required fields are true
                    const isProfileComplete =
                        response.personal_info_fill === true &&
                        response.employment_info_fill === true &&
                        response.address_info === true &&
                        response.kyc_info_fill === true &&
                        response.bank_info_fill === true &&
                        response.gurantor_nominee_fill === true;

                    // Set isApplied based on profile completion status
                    response.isApplied = isProfileComplete;

                    // Call login with updated response
                    await login(response);

                    // console.log("Profile complete status:", isProfileComplete);

                    // Force navigation to happen after a small delay
                    setTimeout(() => {
                        if (!isProfileComplete) {
                            window.location.href = "/apply-loan";
                        } else if (isProfileComplete && !isConsent) {
                            window.location.href = "/process-loan";
                        } else {
                            // console.log("Navigating to apply-loan page");
                            window.location.href = "/";
                        }
                    }, 100);

                    setLoading(false);

                    return;
                } else {
                    setLoading(false);
                    toast.error(response.message);
                }
            } catch (error) {
                console.error('Login error:', error);
                toast.error('Something went wrong. Please try again.');
                setLoading(false);
            } finally {
                if (!response?.status) { // Only set loading to false if we didn't redirect
                    setLoading(false);
                }
            }
        }
    });

    return (
        <div className="flex items-center justify-center min-h-screen px-8">
            <div className="w-full max-w-sm">
                <Card heading="" icon="">
                    <div className="flex flex-col items-center justify-center mt-2 mb-8">
                        <div className="w-full rounded-lg">
                            <img
                                src={Images.fullLogo || "/placeholder.svg"}
                                alt="Profile"
                                className="w-1/2 rounded items-center justify-center mx-auto my-5"
                            />
                        </div>
                        {/* <div className="mt-2 text-center">
                            <h1 className="font-bold text-2xl sm:text-3xl">
                                Paisa<span className="text-primary">Udhar</span>
                            </h1>
                        </div> */}
                        <div>
                            <p className=" text-gray-600 text-xs sm:text-sm text-center">
                                Please login to access account.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="my-5 px-2 sm:px-5">
                        <div className="mb-4">
                            <TextInput
                                isFocused
                                label="Mobile Number"
                                icon="IoPhonePortraitOutline"
                                placeholder="Mobile Number"
                                name="mobileNumber"
                                type="text"
                                id="mobileNumber"
                                maxLength={11}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.mobileNumber}
                            />
                            {formik.touched.mobileNumber && formik.errors.mobileNumber && (
                                <ErrorMsg error={formik.errors.mobileNumber} />
                            )}
                        </div>
                        <div className="mb-4">
                            <TextInput
                                label="Password"
                                icon="IoKeyOutline"
                                placeholder="Enter Password"
                                name="password"
                                type="password"
                                id="password"
                                maxLength={25}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <ErrorMsg error={formik.errors.password} />
                            )}
                        </div>
                        <div className="flex justify-center">
                            <Button
                                btnName={loading ? <BtnLoader /> : "Login"}
                                btnIcon={loading ? null : "RiArrowRightLine"}
                                type={loading ? "button" : "submit"}
                                style="mt-4 py-1 bg-secondary text-black w-full"
                                disabled={formik.isSubmitting || loading}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between mt-5 gap-2">
                            <Button
                                btnName="New User? Register"
                                btnIcon="IoPersonOutline"
                                type="button"
                                style="py-1.5 text-xs text-primary hover:bg-primary hover:text-white border border-primary w-full"
                                onClick={() => navigate('/register')}
                            />
                            <Button
                                btnName="Forgot Password?"
                                btnIcon="IoKeyOutline"
                                type="button"
                                style="py-1.5 text-xs text-primary hover:bg-primary hover:text-white border border-primary w-full"
                                onClick={() => navigate('/reset-password')}
                            />
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}

export default Login;
