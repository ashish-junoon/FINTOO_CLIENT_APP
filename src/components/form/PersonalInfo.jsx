import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import { toast } from 'react-toastify';
import Card from '../utils/Card';
import ErrorMsg from '../utils/ErrorMsg';
import TextInput from '../fields/TextInput';
import DateInput from '../fields/DateInput';
import SelectInput from '../fields/SelectInput';
import Button from '../utils/Button';
import { genderOptions, maritalStatusOptions } from '../content/Content';
import { AddPersonalInfo } from '../../api/Api_call';
import BtnLoader from '../utils/BtnLoader';
import { useAuth } from '../context/AuthContext';
import { useUserInfoContext } from '../context/UserInfoContext';

const PersonalInfo = ({ onSubmit }) => {

    const [loading, setLoading] = useState(false);
    const { loggedUser } = useAuth();
    const { userInfo, setUserInfo } = useUserInfoContext();

    const presonal = userInfo?.personalInfo[0]

    const formik = useFormik({
        initialValues: {
            fullName: presonal?.full_name || '',
            gender: presonal?.gender || '',
            maritalStatus: presonal?.marital_status || '',
            birthDate: presonal?.dob || '',
            email: presonal?.email_id || '',
        },
        validationSchema: Yup.object({
            fullName: Yup.string()
                .min(3, 'Must be 3 characters or more')
                .max(50, 'Must be 50 characters or less')
                .required('Required'),
            gender: Yup.string().required('Required'),
            maritalStatus: Yup.string().required('Required'),
            birthDate: Yup.string()
                .required('Required')
                .test('age', 'Age must be between 18 and 55 years', function (value) {
                    const birthDate = moment(value, 'YYYY-MM-DD');
                    const today = moment();
                    const ageInYears = today.diff(birthDate, 'years');
                    return ageInYears >= 18 && ageInYears <= 55;
                }),
            email: Yup.string().matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format')
                .required('Email is required'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            const userRequest = {
                user_id: loggedUser?.user_id,
                full_name: values.fullName,
                gender: values.gender,
                marital_status: values.maritalStatus,
                birth_date: values.birthDate,
                email: values.email,
            };

            try {
                const response = await AddPersonalInfo(userRequest);

                if (response.status) {
                    setUserInfo((prevUserInfo) => ({
                        ...prevUserInfo,
                        user_id: response.user_id,
                        lead_id: response.lead_id,
                        personal_info_fill: true,
                        personalInfo: [
                            {
                                full_name: values.fullName,
                                gender: values.gender,
                                marital_status: values.maritalStatus,
                                dob: values.birthDate,
                                email_id: values.email,
                            }
                        ],
                        employmentInfo: [],
                        addressInfo: [],
                        gurantorNomineeInfo: [],
                        kycInfo: [],
                        bankInfo: []
                    }));
                    const updatedUserData = {
                        ...JSON.parse(localStorage.getItem('loggedUser')),
                        personal_info_fill: true,
                        lead_id: response.lead_id,
                    };
                    localStorage.setItem('loggedUser', JSON.stringify(updatedUserData));
                    toast.success(response.message);

                    // Trigger step change
                    onSubmit(values); // <-- This ensures the step updates
                } else {
                    toast.error(response?.message || 'Failed to update personal info.');
                }
            } catch (error) {
                toast.error('Something went wrong. Please try again.');
                console.error('Error adding personal info:', error);
            }
            setLoading(false);
        }
    });

    return (
        <Card heading="Personal Information" icon="IoPersonOutline" style="px-5 md:px-8 py-2">
            <form onSubmit={formik.handleSubmit} className='my-4'>
                <div className='mb-4'>
                    <TextInput
                        label="Full Name"
                        icon="IoPersonOutline"
                        placeholder="Enter Full Name"
                        name="fullName"
                        type="text"
                        id="fullName"
                        maxLength={55}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.fullName}
                    />
                    {formik.touched.fullName && formik.errors.fullName && (
                        <ErrorMsg error={formik.errors.fullName} />
                    )}
                </div>
                <div className='mb-4'>
                    <SelectInput
                        label="Gender"
                        icon="IoMaleFemaleOutline"
                        name="gender"
                        id="gender"
                        placeholder="Select"
                        options={genderOptions}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.gender}
                    />
                    {formik.touched.gender && formik.errors.gender && (
                        <ErrorMsg error={formik.errors.gender} />
                    )}
                </div>
                <div className='mb-4'>
                    <SelectInput
                        label="Marital Status"
                        icon="GiDiamondRing"
                        name="maritalStatus"
                        id="maritalStatus"
                        options={maritalStatusOptions}
                        placeholder="Select"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.maritalStatus}
                    />
                    {formik.touched.maritalStatus && formik.errors.maritalStatus && (
                        <ErrorMsg error={formik.errors.maritalStatus} />
                    )}
                </div>
                <div className='mb-4'>
                    <DateInput
                        label="Birth Date"
                        name="birthDate"
                        id="birthDate"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.birthDate}
                        max={18}
                    />
                    {formik.touched.birthDate && formik.errors.birthDate && (
                        <ErrorMsg error={formik.errors.birthDate} />
                    )}
                </div>
                <div className='mb-4'>
                    <TextInput
                        label="Email"
                        icon="IoMailOutline"
                        placeholder="Enter Email"
                        name="email"
                        type="email"
                        id="email"
                        maxLength={70}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                    />
                    {formik.touched.email && formik.errors.email && (
                        <ErrorMsg error={formik.errors.email} />
                    )}
                </div>

                {(!userInfo?.personalInfo[0] || userInfo?.personal_info_fill === false) && (
                    <div className="flex justify-center">
                        <Button
                            btnName={loading ? <BtnLoader /> : "Submit & Next"}
                            btnIcon={loading ? null : "IoArrowForward"}
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

export default PersonalInfo;

