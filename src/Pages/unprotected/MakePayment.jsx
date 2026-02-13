import { useParams, useNavigate } from 'react-router-dom';
import Images from '../../components/content/Images';
import { useState, useEffect, useRef } from 'react';
import { CreatePaymentLink, GetPaymentStatus } from '../../api/Api_call';
import { toast } from 'react-toastify';
import Loader from '../../components/utils/Loader';

function MakePayment() {
    const { leadId, loanId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [paymentInfo, setPaymentInfo] = useState(null);

    const navigate = useNavigate()
    const didFetchRef = useRef(false);

    const isPaymentComplete = paymentInfo?.isPaymentDone;

    const getPaymentInfo = async () => {
        const payload = {
            lead_id: leadId,
            loan_id: loanId,
            company_id: import.meta.env.VITE_COMPANY_ID,
            product_name: import.meta.env.VITE_PRODUCT_NAME
        };

        try {
            const response = await GetPaymentStatus(payload);

            if (response?.status) {
                setPaymentInfo(response);
                setIsLoading(false);
            } else {
                toast.error("Invalid payment link.");
                setTimeout(() => navigate('/'), 5000);
            }
        } catch (error) {
            toast.error(error?.message || "Something went wrong.");
            setTimeout(() => navigate('/'), 5000);
        }
    };



    useEffect(() => {
        if (didFetchRef.current) return;
        didFetchRef.current = true;

        getPaymentInfo();
    }, [loanId, leadId]);

    if (isLoading) {
        return (
            <div className="h-screen flex justify-center items-center">
                <Loader msg="Please wait..." />
            </div>
        );
    }

    // Payment Process
    const handlePayment = async () => {
        setIsLoading(true);

        const request = {
            amount: paymentInfo?.emiToPayment?.totalEmiToPay,
            reference_id: leadId,
            description: "Making Payment by email URL",
            customer: {
                name: paymentInfo?.name,
                contact: paymentInfo?.mobile_number,
                email: paymentInfo?.email_id,
            },
            notify: {
                sms: true,
                email: true
            },
            options: {
                checkout: {
                    name: import.meta.env.VITE_FULL_PRODUCT_NAME
                }
            },
            notes: {
                policy_name: `${leadId}-${loanId}-${paymentInfo?.name}`
            },
            callback_url: import.meta.env.VITE_URLPAY_BACKURL,
            company_id: import.meta.env.VITE_COMPANY_ID,
            product_name: import.meta.env.VITE_PRODUCT_NAME
        };

        try {
            const response = await CreatePaymentLink(request);

            if (response.status && response.data?.short_url) {
                // Redirect directly
                window.location.replace(response.data.short_url);
            } else {
                toast.error(response.message || "Failed to create payment link.");
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error creating payment link:", error);
            toast.error("An error occurred while creating payment link.");
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex justify-center items-center">
            <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md sm:mx-4">
                <div className="flex items-center justify-center mb-4">
                    <img className="h-8 sm:h-10 w-auto" src={Images.fullLogo || "/placeholder.svg"} alt="Logo" />
                </div>
                <div className='border-b-2 border-gray-300' />

                {/* Payment Information */}

                {!isPaymentComplete ? (
                    <div className='p-4'>
                        <div>
                            <h2 className='text-lg font-semibold'>Hi, {paymentInfo?.name?.split(' ')[0]}</h2>
                            <p className='text-sm text-gray-600'>Please see your payment details below and complete the payment process.</p>
                        </div>

                        <div className='mt-6'>
                            <span className='text-sm font-semibold bg-primary text-white px-4 py-1 rounded-t shadow-md'>Payment Information</span>
                            <div className='p-4 rounded-b border-2 border-primary mt-0.5 shadow-md'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <div className='text-black font-semibold'>Mobile Number</div>
                                        <div>+91{paymentInfo?.mobile_number}</div>
                                    </div>
                                    <div>
                                        <div className='text-black font-semibold'>Due Date</div>
                                        <div>{paymentInfo?.emiToPayment?.due_date}</div>
                                    </div>
                                    <div>
                                        <div className='text-black font-semibold'>Penal Days</div>
                                        <div>{paymentInfo?.emiToPayment?.days_past_due}</div>
                                    </div>
                                    <div>
                                        <div className='text-black font-semibold'>Penal Interest</div>
                                        <div>₹{paymentInfo?.emiToPayment?.dpd_interest}</div>
                                    </div>
                                </div>
                            </div>

                            <div className='mt-5'>
                                <div className='flex items-center flex-col'>
                                    <div className='text-black text-sm italic'>Paying for Loan Account Number:</div>
                                    <div className='text-black text-sm font-semibold'>{paymentInfo?.loan_id}</div>
                                </div>
                                <div className='mt-2 flex items-center justify-center flex-col'>
                                    <div className='text-primary font-semibold mt-4'>Total Outstanding to Pay</div>
                                    <div className='text-black font-semibold mt-2 text-3xl'>₹{paymentInfo?.emiToPayment?.totalEmiToPay}</div>
                                </div>
                            </div>

                            <div>
                                <div className='flex items-center justify-center mt-6'>
                                    <button className='bg-primary text-white w-full px-4 py-2 rounded shadow-md'
                                        onClick={handlePayment}
                                    >Pay Now</button>
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className='p-4'>
                        <div className="flex flex-col items-center py-8">
                            <img src={Images.verified} alt="Success" />
                            <h2 className="text-base font-semibold italic mt-4 text-black">
                                Payment is already completed.
                            </h2>
                        </div>
                        {/* <div className='text-black font-semibold'>Payment is already completed.</div> */}
                    </div>
                )}

            </div>
        </div>
    );
}

export default MakePayment;
