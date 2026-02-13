import { useState } from "react"
import { ReloanUser } from "../../api/Api_call"
import { toast } from "react-toastify";
import { useUserInfoContext } from "../context/UserInfoContext";
import Modal from "./Modal";

const LoanClosureCard = ({ customerName, maxEligibleAmount }) => {
    const [isApplying, setIsApplying] = useState(false)
    const [isReloanModal, setIsReloanModal] = useState(false)
    const { userInfo } = useUserInfoContext();

    const offerAmount = maxEligibleAmount * (25 / 100) + maxEligibleAmount;


    const handleApplyNow = async () => {
        setIsApplying(true);

        const payload = {
            user_id: userInfo.user_id,
            lead_id: userInfo.lead_id,
            loan_id: userInfo?.selectedproduct?.[0]?.loan_id,
            created_by: userInfo.user_id,
            company_id: import.meta.env.VITE_COMPANY_ID,
            product_name: import.meta.env.VITE_PRODUCT_NAME,
            reloan_type: import.meta.env.VITE_RELOAN_TYPE
        };

        try {
            const response = await ReloanUser(payload);

            if (response?.status) {
                toast.success(response.message);
                localStorage.removeItem("loggedUser");
                setIsReloanModal(false);
                window.location.reload();
            } else {
                console.error("Unexpected response:", response);
                toast.error(response?.message || "Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error("Error applying for reloan:", error);
            toast.error("An error occurred while applying. Please try again.");
        } finally {
            setIsReloanModal(false);
            setIsApplying(false);
        }
    };



    return (
        <div className="w-full max-w-md overflow-hidden rounded bg-white shadow-lg">
            {/* Confetti-like top border */}
            <div className="h-2 bg-primary"></div>


            <div className="px-6 py-5">
                {/* Celebration header */}
                <div className="mb-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <h2 className="text-xl font-bold text-green-400">Congratulations!</h2>
                    </div>

                </div>

                {/* Main message */}
                <div className="mb-6 rounded-lg bg-green-50 p-4">
                    <p className="text-center text-gray-500">
                        <span className="font-sm font-semibold">Thank you {customerName}!</span> We're pleased to inform that your loan
                        has been successfully closed.
                    </p>
                </div>

                {/* New loan offer */}
                <div className="mb-2 space-y-4">

                    <p className="text-gray-600 text-center text-xs px-5 font-semibold">
                        Based on your previous repayment history, you have been offered credit line upto:
                    </p>

                    <div className="rounded bg-blue-100 py-1 text-center">
                        <span className="text-xl font-bold text-blue-700">₹{offerAmount}<span className="text-[rgb(233,16,16)]">*</span></span>
                    </div>

                    {/* <p className="text-gray-600 text-center">
                        Have questions or want to apply for a new credit line? Give us a call
                    </p>

                    <div className="rounded-md py-1 text-center">
                        <span className="text-xl font-bold text-black">+919289965670</span>
                    </div> */}

                    <ul className="ml-5 list-disc space-y-1 text-sm text-gray-600">
                        <li>Faster approval process</li>
                        <li>Competitive interest rates</li>
                        <li>Flexible repayment options</li>
                    </ul>
                </div>
            </div>

            {/* CTA Button */}
            <div className="px-6 mb-6">
                <button
                    onClick={() => setIsReloanModal(true)}
                    disabled={isApplying}
                    className="group flex w-full items-center justify-center rounded bg-secondary px-4 py-2 font-medium text-black transition-all hover:bg-yellow-400 disabled:opacity-70"
                >
                    {isApplying ? (
                        <>
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                            Processing...
                        </>
                    ) : (
                        <>
                            Apply Now
                        </>
                    )}
                </button>
            </div>


            <Modal isOpen={isReloanModal} onClose={() => setIsReloanModal(false)}>
                <div className="px-8 py-3 flex flex-col justify-center items-center">
                    <h1 className="text-lg font-gray-400 font-semibold py-5 ">Please click the button below to apply for a reloan.</h1>
                    <p className="text-sm border border-gray-400 lg:mx-6 p-5">Note: Once you apply for a reloan, you will be logged out from the current session. You will need to log in again to view your status.</p>
                    <button onClick={handleApplyNow} className="px-8 py-2 bg-secondary text-black rounded-md mt-4 ">Submit</button>
                </div>
            </Modal>
        </div >
    )
}

export default LoanClosureCard
