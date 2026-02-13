import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Card from '../utils/Card';
import ErrorMsg from '../utils/ErrorMsg';
import TextInput from '../fields/TextInput';
import DateInput from '../fields/DateInput';
import SelectInput from '../fields/SelectInput';
import UploadInput from '../fields/UploadInput';
import Button from '../utils/Button';
import { AddEmploymentInfo } from '../../api/Api_call';
import { FileConverter } from '../utils/FileConverter';
import BtnLoader from '../utils/BtnLoader';
import { useGetData } from '../context/GetDataContext';
import { useAuth } from '../context/AuthContext';
import { useUserInfoContext } from '../context/UserInfoContext';

const EmploymentInfo = ({ onSubmit }) => {

    const [loading, setLoading] = useState(false);
    const [base64Data, setBase64Data] = useState(null);
    const [localData, setLocalData] = useState(null);

    const { loggedUser } = useAuth();
    const { userInfo, setUserInfo } = useUserInfoContext();
    const { sector, salaryDate, employedSince } = useGetData();

    const company = Array.isArray(userInfo?.employmentInfo) ? userInfo.employmentInfo[0] : undefined;


    useEffect(() => {
        const storedUser = localStorage.getItem("loggedUser");
        if (storedUser) {
            setLocalData(JSON.parse(storedUser));
        }
    }, []);



    const formik = useFormik({
        initialValues: {
            company: company?.company_name || '',
            sector: company?.sector_type || '',
            referral: company?.referral_code || '',
            workingSince: company?.employed_since || '',
            netSalary: company?.net_monthly_salary || '',
            salaryDate: company?.salary_date || '',
            file: company?.salary_slip_pdf_data ? new File([company?.salary_slip_pdf_data], company?.salary_slip_pdf_name, { type: 'application/pdf' }) : '',
        },
        validationSchema: Yup.object({
            company: Yup.string()
                .min(2, 'Must be 3 characters or more')
                .max(40, 'Must be 60 characters or less')
                .required('Required'),
            sector: Yup.string().required('Required'),
            referral: Yup.string()
                .matches(/^[A-Z0-9]{10}$/, 'Code must be 10 characters & case-sensitive.'),
            workingSince: Yup.string().required('Required'),
            netSalary: Yup.number()
                .min(15000, 'Net salary must be at least 15,000')
                .max(800000, 'Invalid salary')
                .required('Required')
                .typeError('Net salary must be a valid number'),
            salaryDate: Yup.string().required('Required'),
            file: Yup.mixed()
                .required('Salary Slip is required')
                .test('fileFormat', 'Only PDF files are allowed', (value) => {
                    if (!value) return false;
                    return value.type === 'application/pdf';
                })
                .test('fileSize', 'File must be less than 2 MB', (value) => {
                    if (!value) return false;
                    return value.size <= 2 * 1024 * 1024; // 2 MB in bytes
                }),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                let convertedBase64 = null;
                if (values.file) {
                    convertedBase64 = await FileConverter(values.file);
                    setBase64Data(convertedBase64);
                }

                const userRequest = {
                    lead_id: loggedUser?.lead_id || localData?.lead_id,
                    company_name: values.company,
                    sector_type: values.sector,
                    referral_code: values.referral,
                    employed_since: values.workingSince,
                    net_monthly_salary: values.netSalary,
                    salary_date: values.salaryDate,
                    salary_slip_pdf_name: values.file?.name,
                    salary_slip_pdf_extn: values.file?.name.split('.').pop(),
                    salary_slip_pdf_data: convertedBase64
                        ? convertedBase64.split(",")[1]
                        : null,
                };

                const data = await AddEmploymentInfo(userRequest);

                if (data.status === true) {
                    toast.success(data.message);
                    setUserInfo((prevUserInfo) => ({
                        ...prevUserInfo,
                        employment_info_fill: true,
                        employmentInfo: [
                            {
                                company_name: values.company,
                                sector_type: values.sector,
                                referral_code: values.referral,
                                employed_since: values.workingSince,
                                net_monthly_salary: values.netSalary,
                                salary_date: values.salaryDate,
                                salary_slip_pdf_name: values.file?.name,
                                salary_slip_pdf_extn: values.file?.name.split('.').pop(),
                                salary_slip_pdf_data: convertedBase64
                            }
                        ]
                    }));
                    setTimeout(() => {
                        if (onSubmit) onSubmit(values); // Pass form data to the parent
                    }, 2000);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error('Something went wrong. Please try again.');
                console.error('Add employment info error:', error);
            }
            setLoading(false);
        }
    });

    return (
        <Card heading="Employment Details" icon="IoBusinessOutline" style="px-5 md:px-8 py-2">
            <form onSubmit={formik.handleSubmit} className='my-5'>
                <div className="grid grid-cols-2 gap-4">
                    <div className='col-span-2'>
                        <TextInput
                            label="Company Name"
                            icon="IoBusinessOutline"
                            placeholder="Enter Company Name"
                            name="company"
                            type="text"
                            maxLength={50}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.company}
                        />
                        {formik.touched.company && formik.errors.company && (
                            <ErrorMsg error={formik.errors.company} />
                        )}
                    </div>

                    <div className='col-span-2'>
                        <SelectInput
                            label="Sector Type"
                            icon="IoBriefcaseOutline"
                            name="sector"
                            placeholder="Select"
                            options={
                                sector.map((option) => ({
                                    value: option.sector_name,
                                    label: option.sector_name,
                                }))
                            }
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.sector}
                        />

                        {formik.touched.sector && formik.errors.sector && (
                            <ErrorMsg error={formik.errors.sector} />
                        )}
                    </div>

                    <div className='col-span-2'>

                        <TextInput
                            label="Referral Code"
                            icon="RiUserShared2Line"
                            placeholder="Enter Code"
                            name="referral"
                            type="text"
                            maxLength={10}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.referral}
                        />
                        {formik.touched.referral && formik.errors.referral && (
                            <ErrorMsg error={formik.errors.referral} />
                        )}
                    </div>

                    <div className='col-span-2 md:col-span-1'>
                        <SelectInput
                            label="Employed Since"
                            icon="IoTimeOutline"
                            name="workingSince"
                            placeholder="Select"
                            options={
                                employedSince.map((option) => ({
                                    value: option.employed_since_name,
                                    label: option.employed_since_name,
                                }))
                            }
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.workingSince}
                        />
                        {formik.touched.workingSince && formik.errors.workingSince && (
                            <ErrorMsg error={formik.errors.workingSince} />
                        )}
                    </div>
                    <div className='col-span-2 md:col-span-1'>
                        <DateInput
                            label="Next Salary Date"
                            name="salaryDate"
                            id="salaryDate"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.salaryDate}
                            min={new Date().toISOString().split("T")[0]}
                        />
                        {formik.touched.salaryDate && formik.errors.salaryDate && (
                            <ErrorMsg error={formik.errors.salaryDate} />
                        )}

                    </div>
                    <div className='col-span-2 md:col-span-1'>
                        <TextInput
                            label="Monthly Salary"
                            icon="RiMoneyRupeeCircleLine"
                            placeholder="Net Salary"
                            name="netSalary"
                            type="text"
                            maxLength={8}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.netSalary}
                        />

                        {formik.touched.netSalary && formik.errors.netSalary && (
                            <ErrorMsg error={formik.errors.netSalary} />
                        )}
                    </div>



                    <div className='col-span-2 md:col-span-1'>
                        <UploadInput
                            label="Salary Slip"
                            name="file"
                            icon="MdUploadFile"
                            acceptedFormats="application/pdf"
                            onChange={(event) => {
                                formik.setFieldValue("file", event.currentTarget.files[0]);
                            }}
                            onBlur={formik.handleBlur}
                        />

                        {formik.touched.file && formik.errors.file && (
                            <ErrorMsg error={formik.errors.file} />
                        )}
                    </div>
                </div>
                {(!userInfo?.employmentInfo[0] || userInfo?.employment_info_fill === false) && (
                    <div className="flex justify-center mt-5">
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

export default EmploymentInfo;