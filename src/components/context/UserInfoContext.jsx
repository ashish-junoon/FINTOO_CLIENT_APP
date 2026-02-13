import React, { createContext, useContext, useState, useEffect } from "react";
import { getLoginUserData } from "../../api/Api_call";
import { useAuth } from "./AuthContext";
import Loader from "../utils/Loader";

export const UserInfoContext = createContext();

export const UserInfoProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const { loggedUser } = useAuth();
    const userId = loggedUser?.user_id || null;
    const leadId = loggedUser?.lead_id || null;

    // Function to fetch and update user info
    const fetchData = async () => {
        if (!userId || !leadId) {
            setIsLoading(false); // No user or lead data; stop loading
            return;
        }

        setIsLoading(true);
        const req = {
            user_id: userId,
            lead_id: leadId,
            login_user: "",
            permission: ""
        };

        try {
            const response = await getLoginUserData(req);
            if (response?.status) {
                // Get the loggedUser object from localStorage
                let loggedUser = JSON.parse(localStorage.getItem('loggedUser')) || {}; // Ensure it's an object

                // Update fields
                loggedUser.employment_info_fill = response.employment_info_fill;
                loggedUser.personal_info_fill = response.personal_info_fill;
                loggedUser.address_info_fill = response.address_info_fill;
                loggedUser.kyc_info_fill = response.kyc_info_fill;
                loggedUser.bank_info_fill = response.bank_info_fill;
                loggedUser.gurantor_nominee_fill = response.gurantor_nominee_fill;

                // Save the updated object back to localStorage
                localStorage.setItem('loggedUser', JSON.stringify(loggedUser));

                // Update state
                setUserInfo(response);
            } else {
                console.error("API Error:", response?.message || "Unknown error");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false); // Set loading to false after fetch completes
        }
    };

    // Fetch user data on mount and when userId or leadId changes
    useEffect(() => {
        fetchData();
    }, [userId, leadId]);

    if (isLoading) {
        return <Loader msg="Please Wait..." />;
    }
    

    return (
        <UserInfoContext.Provider value={{ userInfo, setUserInfo, isLoading, fetchData }}>
            {children}
        </UserInfoContext.Provider>
    );
};

export const useUserInfoContext = () => useContext(UserInfoContext);
