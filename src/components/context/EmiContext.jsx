import React, { createContext, useContext, useState, useEffect } from "react";
import { getEMISchedule } from "../../api/Api_call";
import { useUserInfoContext } from "./UserInfoContext";

export const EmiContext = createContext();

export const EmiProvider = ({ children }) => {
    const [emiData, setEmiData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Extract user data from UserContext
    const { userInfo } = useUserInfoContext();
    const uesrData = userInfo || {}; // Ensure userInfo is never null
    const selectedProduct = uesrData?.selectedproduct || []; // Default to empty array
    const loanId = selectedProduct.length > 0 ? selectedProduct[0]?.loan_id : null;
    const leadId = uesrData?.lead_id || null;

    useEffect(() => {
        const fetchEmiData = async () => {
            if (!loanId || !leadId) {
                setIsLoading(false); // Stop loading if no user or lead data
                return;
            }

            const req = {
                lead_id: leadId,
                loan_id: loanId
            };

            try {
                const response = await getEMISchedule(req);
                if (response?.status) {
                    setEmiData(response);
                } else {
                    console.error("API Error:", response?.message || "Unknown error");
                }
            } catch (error) {
                console.error("Error fetching EMI data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmiData();
    }, [loanId, leadId]); // Add dependencies to re-run effect when values change

    return (
        <EmiContext.Provider value={{ emiData, setEmiData, isLoading }}>
            {children}
        </EmiContext.Provider>
    );
};

// Custom hook to use EMI context
export const useEmiContext = () => useContext(EmiContext);
