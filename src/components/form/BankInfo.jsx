import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import Card from '../../components/utils/Card';
import ErrorMsg from '../utils/ErrorMsg';
import TextInput from '../fields/TextInput';
import SelectInput from '../fields/SelectInput';
import UploadInput from '../fields/UploadInput';
import Button from '../utils/Button';
import { AddUserBankInfo } from '../../api/Api_call';
import BtnLoader from '../utils/BtnLoader';
import { useGetData } from '../context/GetDataContext';
import { useAuth } from '../context/AuthContext';
import { useUserInfoContext } from '../context/UserInfoContext';

const BankInfo = ({ onSubmit }) => {

    const [loading, setLoading] = useState(false);
    const [localData, setLocalData] = useState(null);

    const { bankList } = useGetData();
    const { loggedUser } = useAuth();
    const { userInfo, setUserInfo } = useUserInfoContext();

    // console.log(JSON.stringify(loggedUser))


    // Retrieve loggedUser from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("loggedUser");
        if (storedUser) {
            setLocalData(JSON.parse(storedUser));
        }
    }, []);

    const handleFormDone = () => {
        setUserInfo({
            personal_info_fill: true,
            employment_info_fill: true,
            address_info: true,
            gurantor_nominee_fill: true,
            kyc_info_fill: true,
            bank_info_fill: true
        })
    }

    const formik = useFormik({
        initialValues: {
            bankName: '',
            accountHolder: '',
            accountNumber: '',
            confirmAccNumber: '',
            ifscCode: '',
            bankStatement: null,
        },
        validationSchema: Yup.object({
            bankName: Yup.string().required('Bank name is required.'),
            accountHolder: Yup.string()
                .min(3, 'Must be at least 3 characters.')
                .max(50, 'Must be 50 characters or less.')
                .matches(/^[A-Za-z\s]+$/, 'Invalid account holder name.')
                .required('Account holder name is required.'),
            accountNumber: Yup.string()
                .matches(/^\d{8,18}$/, 'Account number must be between 8 and 18 digits.')
                .required('Account number is required.'),
            confirmAccNumber: Yup.string()
                .oneOf([Yup.ref('accountNumber')], 'Account numbers must match.')
                .required('Please confirm your account number.'),
            ifscCode: Yup.string()
                .matches(/^[A-Za-z0-9]{11}$/, 'Invalid IFSC code.')
                .required('IFSC code is required.'),
            bankStatement: Yup.mixed().required('Bank statement is required.'),
        }),
        onSubmit: async (values) => {

            setLoading(true);
            try {
                const convertFileToBase64 = async (file) => {
                    if (!file) return null;
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = (error) => reject(error);
                        reader.readAsDataURL(file);
                    });
                };

                const bankStatementBase64 = await convertFileToBase64(values.bankStatement);

                const userRequest = {
                    lead_id: loggedUser?.lead_id || localData?.lead_id,
                    bank_name: values.bankName,
                    account_holder_name: values.accountHolder,
                    account_number: values.accountNumber,
                    ifsc_code: values.ifscCode,
                    bank_statement_image_name: values.bankStatement?.name,
                    bank_statement_image_extn: values.bankStatement?.name?.split('.').pop(),
                    bank_statement_data: bankStatementBase64 ? bankStatementBase64.split(',')[1] : null,
                    created_by : "user",
                    account_type : "1",
                };

                // console.log('Payload:', userRequest);

                const response = await AddUserBankInfo(userRequest);

                if (response.status) {
                    handleFormDone()
                    toast.success(response.message);
                    setUserInfo((prevUserInfo) => ({
                        ...prevUserInfo,
                        bank_info_fill: true,
                        bankInfo: [
                            {
                                bank_name: values.bankName,
                                account_holder_name: values.accountHolder,
                                account_number: values.accountNumber,
                                ifsc_code: values.ifscCode,
                                bank_statement_image_name: values.bankStatement?.name,
                                bank_statement_image_extn: values.bankStatement?.name?.split('.').pop(),
                                bank_statement_data: bankStatementBase64 ? bankStatementBase64.split(',')[1] : null,
                            }
                        ]
                    }));
                    setTimeout(() => {
                        if (onSubmit) onSubmit(values); // Notify parent component
                    }, 2000);
                } else {
                    toast.error(response.message);
                }
            } catch (error) {
                toast.error('Something went wrong. Please try again.');
                console.error('Bank Info Submission Error:', error);
            }
            setLoading(false);
        },
    });

    return (

        <Card heading="Bank Details" icon="MdOutlineAccountBalance" style="px-4 md:px-8 py-2">
            <form onSubmit={formik.handleSubmit} className='my-4'>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <SelectInput
                            label="Bank Name"
                            placeholder="Select"
                            icon="MdOutlineAccountBalance"
                            name="bankName"
                            id="bankName"
                            options={
                                bankList.map((bankList) => ({
                                    label: bankList.bankName,
                                    value: bankList.bankName,
                                }))
                            }
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.bankName}
                        />
                        {formik.touched.bankName && formik.errors.bankName && (
                            <ErrorMsg error={formik.errors.bankName} />
                        )}
                    </div>
                    <div className="col-span-2">
                        <TextInput
                            label="A/c Holder Name"
                            icon="IoPersonOutline"
                            placeholder="Enter Full Name"
                            name="accountHolder"
                            id="accountHolder"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.accountHolder}
                        />
                        {formik.touched.accountHolder && formik.errors.accountHolder && (
                            <ErrorMsg error={formik.errors.accountHolder} />
                        )}
                    </div>
                    <div className="col-span-2">
                        <TextInput
                            label="Account Number"
                            icon="RiFileTextLine"
                            placeholder="Enter Account Number"
                            name="accountNumber"
                            type={"password"}
                            id="accountNumber"
                            eyeIcon={false}
                            maxLength={18}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.accountNumber}
                        />
                        {formik.touched.accountNumber && formik.errors.accountNumber && (
                            <ErrorMsg error={formik.errors.accountNumber} />
                        )}
                    </div>
                    <div className="col-span-2">

                        <TextInput
                            label="Confirm A/c Number"
                            icon="RiFileShield2Line"
                            placeholder="Confirm Account Number"
                            name="confirmAccNumber"
                            id="confirmAccNumber"
                            maxLength={18}
                            paste={true}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.confirmAccNumber}
                        />
                        {formik.touched.confirmAccNumber && formik.errors.confirmAccNumber && (
                            <ErrorMsg error={formik.errors.confirmAccNumber} />
                        )}
                    </div>
                    <div className="col-span-2">

                        <TextInput
                            label="IFSC Code"
                            icon="RiSecurePaymentFill"
                            placeholder="Enter IFSC Code"
                            name="ifscCode"
                            id="ifscCode"
                            textCase={true}
                            maxLength={11}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.ifscCode}
                            style={`uppercase`}
                        />
                        {formik.touched.ifscCode && formik.errors.ifscCode && (
                            <ErrorMsg error={formik.errors.ifscCode} />
                        )}
                    </div>

                    <div className="col-span-2">
                        <UploadInput
                            label="Bank Statement"
                            name="bankStatement"
                            icon="MdUploadFile"
                            id="bankStatement"
                            acceptedFormats="application/pdf"
                            onChange={(e) => formik.setFieldValue("bankStatement", e.target.files[0])}
                        />
                        {formik.touched.bankStatement && formik.errors.bankStatement && (
                            <ErrorMsg error={formik.errors.bankStatement} />
                        )}
                    </div>

                </div>
                {(!userInfo?.bankInfo[0] || userInfo?.bank_info_fill === false) && (
                    <div className="mx-auto">
                        <Button
                            btnName={loading ? <BtnLoader /> : "Submit & Next"}
                            btnIcon={loading ? null : "RiArrowRightLine"}
                            type={loading ? "button" : "submit"}
                            style={`mt-4 py-1 ${loading ? "bg-gray-400" : "bg-secondary"} text-black w-full`}
                            disabled={loading}
                        />
                    </div>
                )}

            </form>
        </Card>
    );
};

export default BankInfo;
