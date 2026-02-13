import { useEffect, useState } from "react";
import { useEmiContext } from "../../components/context/EmiContext";
import { LoanHistory } from "../../api/Api_call";
import { useUserInfoContext } from "../../components/context/UserInfoContext";
import { toast } from "react-toastify";
function Loan() {
    const [historyData, setHistoryData] = useState([]);
    const { emiData } = useEmiContext();
    const loanInfo = emiData?.activeLoanDetails;
    const payment = emiData?.emi_Schedules;
    const { userInfo } = useUserInfoContext();
    const pan = userInfo?.kycInfo?.[0]?.pan_card_number
    console.log("emiData",emiData);
    // alert(JSON.stringify(userInfo?.kycInfo?.[0]?.pan_card_number, null, 2))

    const history = async () => {
        const payload = {
            pan_number: pan
        }
        const response = await LoanHistory(payload);
        if (response.status) {
            setHistoryData(response?.loanHistories);
        } else {
            toast.error(response.message);
        }
    };

    useEffect(() => {
        history();
    }, []);



    return (
        <>
            {emiData !== null ? (
                <div>
                    {/* Loan ID */}
                    <div className="shadow rounded-t bg-primary text-white">
                        <div className="flex justify-center items-center py-1">
                            <div className="text-sm font-medium">
                                Credit Line No: {emiData?.loan_id}
                            </div>
                        </div>
                    </div>

                    {/* Summary Info */}
                    <div className="shadow-lg border mt-[-1px] border-gray-200">
                        <div className="overflow-x-auto scrollbar-hide">
                            <div className="grid grid-cols-5 min-w-max">

                                {/* Amount */}
                                <div>
                                    <div className="text-base text-center font-bold py-1">
                                        {loanInfo?.repayment_amount}
                                    </div>
                                    <div className="bg-gray-100 text-black text-[13px] py-1 text-center">
                                        Amount
                                    </div>
                                </div>
                                <div>
                                    <div className="text-base text-center font-bold py-1">
                                        {emiData?.activeLoanDetails?.loan_amount}
                                    </div>
                                    <div className="bg-gray-100 text-black text-[13px] py-1 text-center">
                                        Sanction Amount
                                    </div>
                                </div>
                                {/* Installment */}
                                <div>
                                    <div className="text-base text-center font-bold py-1">
                                        {loanInfo?.number_of_installment}
                                    </div>
                                    <div className="bg-gray-100 text-black text-[13px] py-1 text-center">
                                        Installment
                                    </div>
                                </div>

                                {/* Tenure 2 */}
                                <div>
                                    <div className="text-base text-center font-bold py-1">
                                        {loanInfo?.tenure}
                                    </div>
                                    <div className="bg-gray-100 text-black text-[13px] py-1 text-center">
                                        Tenure
                                    </div>
                                </div>

                                {/* Tenure 3 */}
                                <div>
                                    <div className="text-base text-center font-bold py-1">
                                        {emiData?.activeLoanDetails?.repayment_date}
                                    </div>
                                    <div className="bg-gray-100 text-black text-[13px] py-1 text-center">
                                        Repayment Date
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>



                    {/* EMI Table */}
                    {payment?.[0]?.total_paid_amount > 0 && (
                        <div className="w-full mt-10 overflow-x-auto">
                            <span className="text-xs font-semibold bg-primary text-white px-2 py-1 rounded-t">Payment History</span>
                            <table className="min-w-max w-full border border-gray-300 bg-white shadow-md">
                                <thead>
                                    <tr className="bg-gray-100 border-b">
                                        <th className="border px-2 py-2 text-xs text-left">#</th>
                                        <th className="border px-2 py-2 text-xs text-left">Amount</th>
                                        <th className="border px-2 py-2 text-xs text-left">Mode</th>
                                        <th className="border px-2 py-2 text-xs text-left">Paid On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payment?.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="border px-2 py-2 text-xs">{index + 1}</td>
                                            <td className="border px-2 py-2 text-xs">{item.total_paid_amount}</td>
                                            <td className="border px-2 py-2 text-xs">{item.payment_mode}</td>
                                            <td className="border px-2 py-2 text-xs">{item.paid_on}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="shadow rounded-t bg-gray-600 text-white border border-black">
                    <div className="flex justify-center items-center py-1">
                        <div className="text-sm font-medium">No Active Credit Line Found</div>
                    </div>
                </div>
            )}

            {/* History */}
            <div className="w-full mt-5 overflow-x-auto">
                {historyData?.length > 0 && (
                    <div className="w-full mt-5 overflow-x-auto">
                        <span className="text-xs font-semibold bg-primary text-white px-2 py-1 rounded-t">Credit Line History</span>
                        <table className="min-w-max w-full border border-gray-300 bg-white shadow-md">
                            <thead>
                                <tr className="bg-gray-100 border-b">
                                    <th className="border px-2 py-2 text-xs text-left">#</th>
                                    <th className="border px-2 py-2 text-xs text-left">Loan ID</th>
                                    <th className="border px-2 py-2 text-xs text-left">Loan Amount</th>
                                    <th className="border px-2 py-2 text-xs text-left">Due Date</th>
                                    <th className="border px-2 py-2 text-xs text-left">Status</th>
                                    <th className="border px-2 py-2 text-xs text-left">Closed Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyData?.map((item, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="border px-2 py-2 text-xs">{index + 1}</td>
                                        <td className="border px-2 py-2 text-xs">{item.loan_id}</td>
                                        <td className="border px-2 py-2 text-xs">{item.loan_amount}</td>
                                        <td className="border px-2 py-2 text-xs">{item.due_date}</td>
                                        <td className="border px-2 py-2 text-xs">{item.loan_status}</td>
                                        <td className="border px-2 py-2 text-xs">{item.loan_closed_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

export default Loan;
