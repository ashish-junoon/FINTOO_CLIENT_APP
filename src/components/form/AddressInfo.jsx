import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import Card from '../utils/Card';
import ErrorMsg from '../utils/ErrorMsg';
import Button from '../utils/Button';
import TextInput from '../fields/TextInput';
import SelectInput from '../fields/SelectInput';
import { houseTypeOptions } from '../content/Content';
import { addAddress, getStateCity } from '../../api/Api_call';
import BtnLoader from '../utils/BtnLoader';
import { useAuth } from '../context/AuthContext';
import { useUserInfoContext } from '../context/UserInfoContext';

const AddressInfo = ({ onSubmit }) => {
    const [loading, setLoading] = useState(false);
    const [localData, setLocalData] = useState(null);
    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [cities, setCities] = useState([]);

    const { loggedUser } = useAuth();
    const { userInfo, setUserInfo } = useUserInfoContext();
    const address = userInfo?.addressInfo[0];

    useEffect(() => {
        const storedUser = localStorage.getItem("loggedUser");
        if (storedUser) {
            setLocalData(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const fetchState = async () => {
            try {
                const response = await getStateCity({ stateCode: "" });
                setStates(response.states);
            } catch (error) {
                console.error('Error fetching States:', error);
            }
        };
        fetchState();
    }, []);

    useEffect(() => {
        const fetchCity = async () => {
            if (!selectedState) return;

            try {
                const response = await getStateCity({ stateCode: selectedState });
                setCities(response.cities);
            } catch (error) {
                console.error('Error fetching Cities:', error);
            }
        };
        fetchCity();
    }, [selectedState]);

    const formik = useFormik({
        initialValues: {
            houseType: address?.house_type || '',
            address: address?.address || '',
            district: address?.district || '',
            state: address?.state || '',
            zipCode: address?.zip_code || '',
        },
        validationSchema: Yup.object({
            houseType: Yup.string().required('Required'),
            address: Yup.string()
                .required('Required')
                .min(3, 'Must be 3 characters or more')
                .max(60, 'Must be 60 characters or less'),
            district: Yup.string().required('Required'),
            state: Yup.string().required('Required'),
            zipCode: Yup.string()
                .required('Required')
                .matches(/^[0-9]{6}$/, 'Invalid zip code.'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            const userRequest = {
                lead_id: loggedUser?.lead_id || localData?.lead_id,
                house_type: values.houseType,
                address: values.address,
                district: values.district,
                state: values.state,
                zip_code: values.zipCode,
            };

            try {
                const data = await addAddress(userRequest);
                if (data.status === true) {
                    setUserInfo((prevUserInfo) => ({
                        ...prevUserInfo,
                        address_info_fill: true,
                        addressInfo: [
                            {
                                house_type: values.houseType,
                                address: values.address,
                                district: values.district,
                                state: values.state,
                                zip_code: values.zipCode,
                            }
                        ]
                    }));
                    toast.success(data.message);
                    setTimeout(() => {
                        if (onSubmit) onSubmit(values);
                    }, 2000);
                } else {
                    toast.error(data.message, { autoClose: 3000 });
                }
            } catch (error) {
                toast.error('Something went wrong. Please try again.', { autoClose: 3000 });
                console.error('Error submitting address info:', error);
            }
            setLoading(false);
        },
    });

    return (
        <Card heading="Address Information" icon={'IoLocationOutline'} style="px-4 md:px-8 py-2">
            <form onSubmit={formik.handleSubmit} className='my-5'>
                <div className="grid grid-cols-2 gap-4">
                    <div className='col-span-2'>
                        <SelectInput
                            label="House Type"
                            icon="IoHomeOutline"
                            name="houseType"
                            placeholder="Select"
                            options={houseTypeOptions}
                            {...formik.getFieldProps('houseType')}
                        />
                        {formik.touched.houseType && formik.errors.houseType && (
                            <ErrorMsg error={formik.errors.houseType} />
                        )}
                    </div>
                    <div className='col-span-2'>
                        <SelectInput
                            label="State"
                            icon="MdLocationCity"
                            name="state"
                            placeholder="Select"
                            options={states.map((state) => ({
                                value: state.code,
                                label: state.name
                            }))}
                            onChange={(e) => {
                                const selectedCode = e.target.value;
                                setSelectedState(selectedCode);
                                formik.setFieldValue('state', selectedCode);
                                formik.setFieldValue('district', '');
                                setCities([]);
                            }}
                            value={formik.values.state}
                        />
                        {formik.touched.state && formik.errors.state && (
                            <ErrorMsg error={formik.errors.state} />
                        )}
                    </div>
                    <div className='col-span-2'>
                        <SelectInput
                            label="City"
                            icon="IoLocationOutline"
                            name="district"
                            placeholder="Select"
                            options={cities.map((city) => ({
                                value: city.code,
                                label: city.name
                            }))}
                            onChange={(e) => {
                                formik.setFieldValue('district', e.target.value);
                            }}
                            value={formik.values.district}
                        />
                        {formik.touched.district && formik.errors.district && (
                            <ErrorMsg error={formik.errors.district} />
                        )}
                    </div>
                    <div className='col-span-2'>
                        <TextInput
                            label="Address"
                            icon="RiHome7Line"
                            placeholder="Enter Address"
                            name="address"
                            maxLength={200}
                            {...formik.getFieldProps('address')}
                        />
                        {formik.touched.address && formik.errors.address && (
                            <ErrorMsg error={formik.errors.address} />
                        )}
                    </div>
                    <div className='col-span-2'>
                        <TextInput
                            label="PIN Code"
                            icon="GiPin"
                            placeholder="Enter PIN"
                            name="zipCode"
                            maxLength={6}
                            {...formik.getFieldProps('zipCode')}
                        />
                        {formik.touched.zipCode && formik.errors.zipCode && (
                            <ErrorMsg error={formik.errors.zipCode} />
                        )}
                    </div>
                </div>
                {(!userInfo?.addressInfo[0] || userInfo?.address_info_fill === false) && (
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

export default AddressInfo;
