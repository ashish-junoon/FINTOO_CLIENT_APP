import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import OfferLoan from "../protected/LoanOffer"
import AcceptTerms from "./AcceptTerms"
import RegisterNach from "./RegisterNach"
import StartKYC from "./StartKYC"
import { useUserInfoContext } from "../../components/context/UserInfoContext"
import { useAuth } from "../../components/context/AuthContext"

function ProcessApp() {

    const [kycDone, setKycDone] = useState(false)
    const { userInfo } = useUserInfoContext()
    const { loggedUser } = useAuth()

    const navigate = useNavigate()
    const isConsent = userInfo?.selectedproduct[0]?.otp_consent_verified
    const isLoanConsent = userInfo?.is_loan_consent
    const isKycDone = userInfo?.is_e_kyc_done


    // alert(userInfo?.is_loan_consent)
    // alert(userInfo?.selectedproduct[0]?.otp_consent_verified)
    // alert(userInfo?.selectedproduct.length)

    useEffect(() => {
        if (userInfo?.is_loan_consent === true || userInfo?.getAssignProduct.length === 0) {
            navigate("/");
        }
    }, [userInfo, navigate]);


    useEffect(() => {
        if (loggedUser?.bank_info_fill === false) {
            navigate("/apply-loan");
        }
    }, [loggedUser, navigate]);


    // Update KYC Done
    useEffect(() => {
        if (isKycDone === true) {
            const timeout = setTimeout(() => {
                setKycDone(true);
            }, 6000);

            return () => clearTimeout(timeout);
        }
    }, [isKycDone]);



    return (

        <div>
            {/* Select Loan Offer */}
            {userInfo?.getAssignProduct?.length > 0 && userInfo?.getAssignProduct?.every(item => item.otp_consent_verified === false) && (
                <OfferLoan />
            )}

            {/* Start KYC */}
            {isConsent === true && userInfo?.is_e_kyc_done === false && (
                <StartKYC />
            )}

            {/* Register eNACH */}
            {isKycDone === true && userInfo?.is_e_nach_activate === false && (
                <RegisterNach />
            )}

            {/* Sanction Agreement */}
            {userInfo?.is_e_nach_activate === true && isLoanConsent === false && (
                <AcceptTerms />
            )}

        </div>
    )
}
export default ProcessApp