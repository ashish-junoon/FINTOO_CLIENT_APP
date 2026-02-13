import { useEffect } from 'react';
import { useUserInfoContext } from '../../components/context/UserInfoContext'
import { useGetDocument } from '../../components/context/GetDocument'
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/utils/Icon';

function Profile() {
    const { userInfo } = useUserInfoContext();
    const { documents } = useGetDocument();
    const user = userInfo

    const navigate = useNavigate()
    const personal = userInfo?.personalInfo[0]
    const employer = userInfo?.employmentInfo[0]
    const address = userInfo?.addressInfo[0]
    const bank = userInfo?.bankInfo[0]
    const guarantor = userInfo?.gurantorNomineeInfo[0]
    const kycInfo = userInfo?.kycInfo[0]


    // useEffect(() => {
    //     if (
    //         userInfo?.personal_info_fill === false ||
    //         userInfo?.employment_info_fill === false ||
    //         userInfo?.address_info === false ||
    //         userInfo?.kyc_info_fill === false ||
    //         userInfo?.bank_info_fill === false ||
    //         userInfo?.gurantor_nominee_fill === false
    //     ) {
    //         navigate("/apply-loan");
    //     }
    // }, [userInfo, navigate]);





    return (
        <>
            <div className='flex justify-center items-center my-8'>
                {documents?.profileImages?.[0]?.profile_image_code && (
                    <div>
                        <img
                            className="w-20 h-20 object-cover bg-slate-300 rounded-full shadow"
                            src={`data:image/${documents.profileImages[0].profile_image_code};base64,${documents.profileImages[0].profile_image_code}`}
                            alt="Profile"
                        />
                    </div>
                )}
            </div>
            <div>
                <div className='flex flex-col justify-center items-center'>
                    <h2 className='font-semibold mt-1 text-md text-gray-700'>{personal?.full_name}</h2>
                    <div className='flex justify-center items-center'>
                        <div className='text-gray-500 font-bold text-xs mr-1'>{user?.mobile_number}</div>
                        <div><Icon name="MdVerified" size={12} color="#0b5cff" /></div>
                    </div>
                    <div className='flex justify-center items-center'>
                        <h2 className='font-semibold mt-1 text-xs text-gray-500'>{personal?.email_id}{ }</h2>
                        <div><Icon name={user?.email_otp_verified ? "MdVerified" : ""} size={10} color="#0b5cff" /></div>
                    </div>
                </div>
            </div>

        </>

    )
}
export default Profile