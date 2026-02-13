import { useSearchParams } from "react-router-dom";
import { getAgreement } from "../../api/Api_call";
import { useState, useEffect } from "react";

function Policy() {

    const [isLoading, setIsLoading] = useState(false);
    const [agreementData, setAgreementData] = useState(null);
    const [searchParams] = useSearchParams();
    const leadId = searchParams.get("leadId");
    const userId = searchParams.get("userId");

    const getAgreementLetter = async () => {
        setIsLoading(true);
        const req = {
            company_id: import.meta.env.VITE_COMPANY_ID,
            product_name: import.meta.env.VITE_PRODUCT_NAME,
            user_id: userId,
            lead_id: leadId,
        };
        try {
            const response = await getAgreement(req);

            if (response.status) {
                setAgreementData(response.html_agreement_letter);
            } else {
                console.log(response.message);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        getAgreementLetter();
    }, [leadId, userId]);

    return (
        <div>
            {agreementData && <div dangerouslySetInnerHTML={{ __html: agreementData }} />}
        </div>
    );
}

export default Policy;
