import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import Card from '../utils/Card';
import ErrorMsg from '../utils/ErrorMsg';
import TextInput from '../fields/TextInput';
import ImageInput from '../fields/ImageInput';
import Button from '../utils/Button';
import { AddKYCInfo } from '../../api/Api_call';
import BtnLoader from '../utils/BtnLoader';
import { useAuth } from '../context/AuthContext';
import { useUserInfoContext } from '../context/UserInfoContext';

const KYCInfo = ({ onSubmit }) => {

    const [loading, setLoading] = useState(false);
    const [localData, setLocalData] = useState(null);

    const { loggedUser } = useAuth();
    const { userInfo, setUserInfo } = useUserInfoContext();
    const kyc = userInfo?.kycInfo[0];

    // Retrieve loggedUser from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("loggedUser");
        if (storedUser) {
            setLocalData(JSON.parse(storedUser));
        }
    }, []);

    const validateImageSize = (file) =>
        new Promise((resolve) => {
            if (!file) return resolve(false);
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const isValid = img.width >= 1021 && img.height >= 643;
                resolve(isValid);
            };
        });

    const imageDimensionTest = (fieldName) =>
        Yup.mixed()
            .required(`${fieldName} is required`)
            .test(
                'file-dimensions',
                `${fieldName} must be at least 1021px wide and 643px tall`,
                (file) => validateImageSize(file)
            );



    const formik = useFormik({
        initialValues: {
            panNumber: kyc?.pan_card_number || '',
            panCard: kyc?.pan_card_img_name || '',
            adharNumber: kyc?.pancard_data ? new File([company?.pancard_data], company?.pan_card_img_name, { type: 'image/jpeg' }) : '',
            adharFront: kyc?.aadhar_front_data ? new File([company?.aadhar_front_data], company?.aadhaar_front_image_name, { type: 'image/jpeg' }) : '',
            adharBack: kyc?.aadhar_back_data ? new File([company?.aadhar_back_data], company?.aadhaar_back_image_name, { type: 'image/jpeg' }) : '',
        },
        validationSchema: Yup.object({
            panNumber: Yup.string()
                .matches(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/, 'Invalid PAN Number.')
                .required('Required'),
            panCard: Yup.mixed().required('PAN Card required'),
            adharNumber: Yup.string()
                .matches(/^[0-9]{12}$/, 'Invalid Aadhar Number.')
                .required('Required'),
            adharFront: Yup.mixed().required('Aadhar Front Card required'),
            adharBack: Yup.mixed().required('Aadhar Back Card required'),
        }),
        onSubmit: async (values) => {

            setLoading(true);
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

                const panCardBase64 = await convertFileToBase64(values.panCard);
                const adharFrontBase64 = await convertFileToBase64(values.adharFront);
                const adharBackBase64 = await convertFileToBase64(values.adharBack);

                const userRequest = {
                    lead_id: loggedUser?.lead_id || localData?.lead_id,
                    aadhaar_number: values.adharNumber,
                    aadhaar_front_image_name: values.adharFront?.name,
                    aadhaar_front_image_extn: values.adharFront?.name?.split('.').pop(),
                    aadhar_front_data: adharFrontBase64 ? adharFrontBase64.split(",")[1] : null,

                    aadhaar_back_image_name: values.adharBack?.name,
                    aadhaar_back_image_extn: values.adharBack?.name?.split('.').pop(),
                    aadhar_back_data: adharBackBase64 ? adharBackBase64.split(",")[1] : null,

                    pan_card_number: values.panNumber,
                    pan_card_img_name: values.panCard?.name,
                    pan_card_img_extn: values.panCard?.name?.split('.').pop(),
                    pancard_data: panCardBase64 ? panCardBase64.split(",")[1] : null,
                };

                const data = await AddKYCInfo(userRequest);

                if (data.status === true && data.message!='Already exists') {
                    
                    setUserInfo((prevUserInfo) => ({
                        ...prevUserInfo,
                        kyc_info_fill: true,
                        kycInfo: [
                            {
                                aadhaar_numbe: values.adharNumber,
                                pan_card_number: values.panNumber,
                            }
                        ]
                    }));
                    toast.success(data.message);
                    setTimeout(() => {
                        if (onSubmit) onSubmit(values); // Pass form data to the parent
                    }, 2000);
                } else {
                    toast.error(data.message, {
                        position: 'top-right',
                        autoClose: 3000,
                    });
                }
            } catch (error) {
                toast.error('Something went wrong. Please try again.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                console.error('Add KYC info error:', error);
            }
            setLoading(false);
        },
    });

    return (
        <Card heading="KYC Information" icon={"IoCardOutline"} className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4">
            <form onSubmit={formik.handleSubmit} className="my-2 md:my-4 w-full max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto">
                <div className="space-y-4">
                    {/* PAN Number */}
                    <div className="w-full">
                        <TextInput
                            label="PAN Number"
                            icon="IoCardOutline"
                            placeholder="Enter PAN Number"
                            name="panNumber"
                            type="text"
                            id="panNumber"
                            textCase={true}
                            maxLength={11}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.panNumber}
                            className="w-full"
                        />
                        {formik.touched.panNumber && formik.errors.panNumber && (
                            <ErrorMsg error={formik.errors.panNumber} />
                        )}
                    </div>

                    {/* PAN Card Upload */}
                    <div className="w-full">
                        <div className="border border-black rounded w-full flex justify-center">
                            <ImageInput
                                label="Upload PAN Card"
                                name="panCard"
                                id="panCard"
                                onChange={(file) => formik.setFieldValue('panCard', file)}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.panCard && formik.errors.panCard && (
                                <ErrorMsg error={formik.errors.panCard} />
                            )}
                        </div>
                    </div>

                    {/* Aadhaar Number */}
                    <div className="w-full">
                        <TextInput
                            label="Aadhar Number"
                            icon="IoCardOutline"
                            placeholder="Enter Aadhar Number"
                            name="adharNumber"
                            type="text"
                            id="adharNumber"
                            maxLength={12}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.adharNumber}
                            className="w-full"
                        />
                        {formik.touched.adharNumber && formik.errors.adharNumber && (
                            <ErrorMsg error={formik.errors.adharNumber} />
                        )}
                    </div>

                    {/* Aadhaar Front & Back Upload */}
                    <div className="w-full flex flex-col sm:flex-row gap-3 md:gap-4">
                        {/* Aadhaar Front */}
                        <div className="border border-black p-2 w-full rounded">
                            <ImageInput
                                label="Upload Aadhaar Front"
                                name="adharFront"
                                id="adharFront"
                                className="h-16 sm:h-20 md:h-24 w-full object-contain"
                                onChange={(file) => formik.setFieldValue('adharFront', file)}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.adharFront && formik.errors.adharFront && (
                                <ErrorMsg error={formik.errors.adharFront} />
                            )}
                        </div>

                        {/* Aadhaar Back */}
                        <div className="border border-black p-2 w-full rounded mt-3 sm:mt-0">
                            <ImageInput
                                label="Upload Aadhaar Back"
                                name="adharBack"
                                id="adharBack"
                                className="h-16 sm:h-20 md:h-24 w-full object-contain"
                                onChange={(file) => formik.setFieldValue('adharBack', file)}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.adharBack && formik.errors.adharBack && (
                                <ErrorMsg error={formik.errors.adharBack} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                {(!userInfo?.kycInfo[0] || userInfo?.kyc_info_fill === false) && (
                    <div className="flex justify-center mt-4 md:mt-6">
                        <Button
                            btnName={loading ? <BtnLoader /> : "Submit & Next"}
                            btnIcon={loading ? null : "RiArrowRightLine"}
                            type={loading ? "button" : "submit"}
                            style={`mt-4 py-1 ${loading ? "bg-gray-200" : "bg-secondary"} text-black w-full`}
                            disabled={loading}
                        />
                    </div>
                )}
            </form>
        </Card>


    );
};

export default KYCInfo;
