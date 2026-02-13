import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import Card from '../utils/Card';
import ErrorMsg from '../utils/ErrorMsg';
import TextInput from '../fields/TextInput';
import SelectInput from '../fields/SelectInput';
import Button from '../utils/Button';
import { AddGuarantorNominee } from '../../api/Api_call';
import { relationOptions, nomineeRelationOptions } from '../content/Content';
import BtnLoader from '../utils/BtnLoader';
import { useAuth } from '../context/AuthContext';
import { useUserInfoContext } from '../context/UserInfoContext';

const Guarantor = ({ onSubmit }) => {

    const [loading, setLoading] = useState(false);
    const [localData, setLocalData] = useState(null);

    const { loggedUser } = useAuth();
    const { userInfo, setUserInfo } = useUserInfoContext();


    // Retrieve loggedUser from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("loggedUser");
        if (storedUser) {
            setLocalData(JSON.parse(storedUser));
        }
    }, []);

    // Custom validation function to check for unique mobile numbers
    const validateUniqueMobiles = (values) => {
        const errors = {};
        const mobileNumbers = [
            values.mobile_number1,
            values.mobile_number2,
            values.nomineeMobile
        ].filter(Boolean); // Filter out empty values

        // Create a Set to check for duplicates
        const uniqueMobiles = new Set(mobileNumbers);

        if (uniqueMobiles.size !== mobileNumbers.length) {
            // If there are duplicates, find which fields have duplicate values
            const duplicates = mobileNumbers.filter((number, index) =>
                mobileNumbers.indexOf(number) !== index
            );

            if (duplicates.includes(values.mobile_number1)) {
                errors.mobile_number1 = 'Mobile numbers must be different.';
            }
            if (duplicates.includes(values.mobile_number2)) {
                errors.mobile_number2 = 'Mobile numbers must be different.';
            }
            if (duplicates.includes(values.nomineeMobile)) {
                errors.nomineeMobile = 'Mobile numbers must be different.';
            }
        }

        return errors;
    };

    const formik = useFormik({
        initialValues: {
            guarantorName1: userInfo?.gurantorNomineeInfo?.[0]?.name || '',
            relation1: userInfo?.gurantorNomineeInfo?.[0]?.relation || '',
            mobile_number1: userInfo?.gurantorNomineeInfo?.[0]?.mobile_number || '',

            guarantorName2: userInfo?.gurantorNomineeInfo?.[1]?.name || '',
            relation2: userInfo?.gurantorNomineeInfo?.[1]?.relation || '',
            mobile_number2: userInfo?.gurantorNomineeInfo?.[1]?.mobile_number || '',

            nomineeName: userInfo?.gurantorNomineeInfo?.[2]?.name || '',
            nomineeRelation: userInfo?.gurantorNomineeInfo?.[2]?.relation || '',
            nomineeMobile: userInfo?.gurantorNomineeInfo?.[2]?.mobile_number || '',
        },
        validationSchema: Yup.object({
            guarantorName1: Yup.string()
                .required('Required')
                .min(3, 'Invalid name')
                .max(40, 'Invalid name'),
            relation1: Yup.string().required('Required'),
            mobile_number1: Yup.string()
                .matches(/^[6-9]\d{9}$/, 'Invalid mobile number.')
                .required('Required'),

            guarantorName2: Yup.string()
                .required('Required')
                .min(3, 'Invalid name')
                .max(40, 'Invalid name'),
            relation2: Yup.string().required('Required'),
            mobile_number2: Yup.string()
                .matches(/^[6-9]\d{9}$/, 'Invalid mobile number.')
                .required('Required'),

            nomineeName: Yup.string()
                .required('Required')
                .min(3, 'Invalid name')
                .max(40, 'Invalid name'),
            nomineeRelation: Yup.string().required('Required'),
            nomineeMobile: Yup.string()
                .matches(/^[6-9]\d{9}$/, 'Invalid mobile number.')
                .required('Required'),
        }),
        validate: validateUniqueMobiles,
        onSubmit: async (values) => {
            setLoading(true);

            const userRequest = {
                lead_id: loggedUser?.lead_id || localData?.lead_id,
                guarantor: [
                    {
                        type: "Guarantor",
                        name: values.guarantorName1,
                        mobile_number: values.mobile_number1,
                        relation: values.relation1,
                    },
                    {
                        type: "Guarantor",
                        name: values.guarantorName2,
                        mobile_number: values.mobile_number2,
                        relation: values.relation2,
                    },
                    {
                        type: "Nominee",
                        name: values.nomineeName,
                        mobile_number: values.nomineeMobile,
                        relation: values.nomineeRelation,
                    }
                ]
            };

            try {
                const data = await AddGuarantorNominee(userRequest);
                if (data.status === true) {
                    setUserInfo((prevUserInfo) => ({
                        ...prevUserInfo,
                        gurantor_nominee_fill: true,
                        gurantorNomineeInfo: [
                            {
                                name: values.guarantorName1,
                                mobile_number: values.mobile_number1,
                                relation: values.relation1,
                            },
                            {
                                name: values.guarantorName2,
                                mobile_number: values.mobile_number2,
                                relation: values.relation2,
                            },
                            {
                                name: values.nomineeName,
                                mobile_number: values.nomineeMobile,
                                relation: values.nomineeRelation,
                            }
                        ]
                    }));
                    toast.success(data.message);
                    setTimeout(() => {
                        if (onSubmit) onSubmit(values);
                    }, 2000);
                    // console.log('Guarantor Info:', data);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error('Something went wrong. Please try again.');
                console.error('Add guarantor info error:', error);
            }
            setLoading(false);
        },
    });

    return (
        <Card heading="Guarantor Details" icon={'PiUsers'} style={"px-4 md:px-8 py-2"}>
            <form onSubmit={formik.handleSubmit} className="my-4">
                <span className='bg-primary text-white px-4'>Guarantor 1</span>
                <div className='border border-gray-500 p-3 mb-3'>
                    <div className="grid grid-cols-2 gap-2">
                        <div className='col-span-2'>
                            <TextInput
                                label="Full Name"
                                icon="RiUser6Line"
                                placeholder="Guarantor Name"
                                name="guarantorName1"
                                type="text"
                                id="guarantorName1"
                                maxLength={45}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.guarantorName1}
                            />
                            <div className='mb-1'>
                                {formik.touched.guarantorName1 && formik.errors.guarantorName1 ? (
                                    <ErrorMsg error={formik.errors.guarantorName1} />
                                ) : null}
                            </div>
                        </div>

                        <div className='col-span-2 md:col-span-1'>
                            <SelectInput
                                label="Relation"
                                icon="PiUsersLight"
                                name="relation1"
                                id="relation1"
                                placeholder="Select"
                                options={relationOptions}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.relation1}
                            />
                            <div className='mb-1'>
                                {formik.touched.relation1 && formik.errors.relation1 ? (
                                    <ErrorMsg error={formik.errors.relation1} />
                                ) : null}
                            </div>
                        </div>

                        <div className='col-span-2 md:col-span-1'>
                            <TextInput
                                label="Mobile No."
                                icon="RiUser6Line"
                                placeholder="Mobile No."
                                maxLength={10}
                                name="mobile_number1"
                                type="text"
                                id="mobile_number1"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.mobile_number1}
                            />
                            <div className='mb-1'>
                                {formik.touched.mobile_number1 && formik.errors.mobile_number1 ? (
                                    <ErrorMsg error={formik.errors.mobile_number1} />
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                <span className='bg-primary text-white px-4 mt-5'>Guarantor 2</span>
                <div className='border border-gray-500 p-3 mb-3'>
                    <div className="grid grid-cols-2 gap-2">
                        <div className='col-span-2'>
                            <TextInput
                                label="Full Name"
                                icon="RiUser6Line"
                                placeholder="Guarantor Name"
                                name="guarantorName2"
                                type="text"
                                id="guarantorName2"
                                maxLength={45}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.guarantorName2}
                            />
                            <div className='mb-1'>
                                {formik.touched.guarantorName2 && formik.errors.guarantorName2 ? (
                                    <ErrorMsg error={formik.errors.guarantorName2} />
                                ) : null}
                            </div>
                        </div>

                        <div className='col-span-2 md:col-span-1'>
                            <SelectInput
                                label="Relation"
                                icon="PiUsersLight"
                                name="relation2"
                                id="relation2"
                                placeholder="Select"
                                options={relationOptions}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.relation2}
                            />
                            <div className='mb-1'>
                                {formik.touched.relation2 && formik.errors.relation2 ? (
                                    <ErrorMsg error={formik.errors.relation2} />
                                ) : null}
                            </div>
                        </div>

                        <div className='col-span-2 md:col-span-1'>
                            <TextInput
                                label="Mobile No."
                                icon="RiUser6Line"
                                placeholder="Mobile No."
                                name="mobile_number2"
                                type="text"
                                id="mobile_number2"
                                maxLength={10}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.mobile_number2}
                            />
                            <div className='mb-1'>
                                {formik.touched.mobile_number2 && formik.errors.mobile_number2 ? (
                                    <ErrorMsg error={formik.errors.mobile_number2} />
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                <span className='bg-primary text-white px-6 mt-5'>Nominee </span>
                <div className='border border-gray-500 p-3 mb-3'>
                    <div className="grid grid-cols-2 gap-2">
                        <div className='col-span-2'>
                            <TextInput
                                label="Full Name"
                                icon="RiUser6Line"
                                placeholder="Nominee Name"
                                name="nomineeName"
                                type="text"
                                id="nomineeName"
                                maxLength={45}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.nomineeName}
                            />
                            <div className='mb-2'>
                                {formik.touched.nomineeName && formik.errors.nomineeName ? (
                                    <ErrorMsg error={formik.errors.nomineeName} />
                                ) : null}
                            </div>
                        </div>

                        <div className='col-span-2 md:col-span-1'>
                            <SelectInput
                                label="Relation"
                                icon="PiUsersLight"
                                name="nomineeRelation"
                                id="nomineeRelation"
                                placeholder="Select"
                                options={nomineeRelationOptions}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.nomineeRelation}
                            />
                            <div className='mb-3'>
                                {formik.touched.nomineeRelation && formik.errors.nomineeRelation ? (
                                    <ErrorMsg error={formik.errors.nomineeRelation} />
                                ) : null}
                            </div>
                        </div>

                        <div className='col-span-2 md:col-span-1'>
                            <TextInput
                                label="Mobile No."
                                icon="RiUser6Line"
                                placeholder="Mobile No."
                                name="nomineeMobile"
                                type="text"
                                id="nomineeMobile"
                                maxLength={10}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.nomineeMobile}
                            />
                            <div className='mb-3'>
                                {formik.touched.nomineeMobile && formik.errors.nomineeMobile ? (
                                    <ErrorMsg error={formik.errors.nomineeMobile} />
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                {(!userInfo?.gurantorNomineeInfo[0] || userInfo?.gurantor_nominee_fill === false) && (
                    <div className="flex justify-center">
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

export default Guarantor;