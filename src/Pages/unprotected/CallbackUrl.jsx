

import { useSearchParams, useNavigate } from "react-router-dom";
import Images from "../../components/content/Images";
import { useEffect, useState } from "react";
import { GetPaymentDetails } from "../../api/Api_call";
import { toast } from "react-toastify";
import Loader from "../../components/utils/Loader";
import { useUserInfoContext } from "../../components/context/UserInfoContext";

function CallbackUrl() {
    const [searchParams] = useSearchParams();
    const [payInfo, setPayInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const { userInfo } = useUserInfoContext();

    useEffect(() => {
        // Remove query parameters from the URL
        window.history.replaceState(null, null, "/payment-info");

        history.pushState(null, null, location.href);
        window.onpopstate = function () {
            history.go(1);
        };
    }, []);

    const paymentData = {
        payment_id: searchParams.get("razorpay_payment_id"),
        payment_link_id: searchParams.get("razorpay_payment_link_id"),
        payment_link_reference_id: searchParams.get("razorpay_payment_link_reference_id"),
        payment_link_status: searchParams.get("razorpay_payment_link_status"),
        razorpay_signature: searchParams.get("razorpay_signature"),
    };

    useEffect(() => {
        const handlePayment = async () => {
            if (!paymentData.payment_id) return; // Ensure payment_id exists before making API call

            const request = {
                loan_account: "JCA629",
                emi_no: 0,
                payment_id: paymentData.payment_id,
                payment_link_id: paymentData.payment_link_id,
                payment_link_reference_id: paymentData.payment_link_reference_id,
                payment_link_status: paymentData.payment_link_status,
                signature: paymentData.razorpay_signature,
                company_id: import.meta.env.VITE_COMPANY_ID,
                product_name: import.meta.env.VITE_PRODUCT_NAME
            };

            try {
                const response = await GetPaymentDetails(request);

                if (response.success) {
                    setPayInfo(response.pay_data);
                    setIsLoading(false);
                } else {
                    toast.error(response.message + "Failed to fetch payment details.");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("An error occurred while fetching data.");
            }
        };
        handlePayment();
    }, [paymentData.payment_id]); // Dependency array to prevent re-fetching unnecessarily



    if (isLoading) return <div><Loader msg="Please wait..." /> </div>;

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="p-6 border border-gray-200 rounded shadow-md flex flex-col items-center justify-center">
                {payInfo?.status === "captured" && (
                    <div className="flex flex-col items-center justify-center">
                        <img src={Images.verified} alt="Success" />
                        <h2 className="text-lg font-semibold italic mt-2 text-green-500">
                            Payment Success!
                        </h2>
                        <h6 className="text-center text-xs text-gray-800 mt-">
                            Your payment has been successfully processed.
                        </h6>
                        <div className="grid grid-cols-2 gap-3 my-5">
                            <div className="col-span-2">
                                <div className="text-center">Transaction Id</div>
                                <div className="text-sm font-semibold text-black">{payInfo.transaction_id}</div>
                            </div>

                            <div className="col-span-1">
                                <div className="flex flex-col justify-center items-center">
                                    <div className=" text-xs">Method</div>
                                    <div className="text-black font-semibold uppercase">{payInfo.method}</div>
                                </div>
                            </div>
                            <div className="col-span-1">
                                <div className="flex flex-col justify-center items-center">
                                    <div className=" text-xs">Amount</div>
                                    <div className="text-black font-semibold">{payInfo.amount}</div>
                                </div>
                            </div>
                        </div>
                        <button
                            className="mt-4 shadow-md text-primary border border-primary hover:bg-primary hover:text-white w-full font-bold py-2 px-4 rounded"
                            onClick={() => navigate("/")}
                        >
                            Go to Home
                        </button>
                    </div>
                )}
                {payInfo?.status === "failed" && (
                    <div className="flex flex-col items-center justify-center">
                        <img src={Images.unverified} alt="Failed" />
                        <h2 className="text-lg font-semibold italic mt-2 text-danger">
                            Payment Failed!
                        </h2>
                        <h6 className="text-center text-gray-700 mt-2">
                            Your payment has failed.
                        </h6>
                        <div className="grid grid-cols-2 gap-3 my-5">
                            <div className="col-span-2">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="text-center">Transaction Id</div>
                                    <div className="font-semibold text-black">{payInfo?.transaction_id}</div>
                                </div>
                            </div>


                            <div className="col-span-1">
                                <div className="flex flex-col justify-center items-center">
                                    <div className=" text-xs">Method</div>
                                    <div className="text-black font-semibold uppercase">{payInfo?.method}</div>
                                </div>
                            </div>
                            <div className="col-span-1">
                                <div className="flex flex-col justify-center items-center">
                                    <div className=" text-xs">Amount</div>
                                    <div className="text-black font-semibold">{payInfo?.amount}</div>
                                </div>
                            </div>
                        </div>
                        <button
                            className="mt-4 shadow-md text-primary border border-primary hover:bg-primary hover:text-white w-full font-bold py-2 px-4 rounded"
                            onClick={() => navigate("/")}
                        >
                            Go to Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CallbackUrl;
