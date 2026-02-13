import { createContext, useContext, useEffect, useState } from "react";
import { getUserDocuments } from "../../api/Api_call";
import { UserInfoContext } from "./UserInfoContext";

const GetDocContext = createContext();

export const GetDocProvider = ({ children }) => {
    const [documents, setDocuments] = useState({});

    const { userInfo } = useContext(UserInfoContext);


    const getDocuments = async () => {
        const req = {
            user_id: userInfo?.user_id,
            lead_id: userInfo?.lead_id
        }
        try {
            const response = await getUserDocuments(req);
            setDocuments(response || {});
        } catch (error) {
            console.error("Error fetching SectorType:", error);
        }
    };


    useEffect(() => {
        if (!userInfo?.user_id || !userInfo?.lead_id) return;
        if (userInfo?.user_id && userInfo?.lead_id) {
            getDocuments();
        }

    }, [userInfo?.user_id, userInfo?.lead_id]);

    return (
        <GetDocContext.Provider value={{ documents }}>
            {children}
        </GetDocContext.Provider>
    );
};

export const useGetDocument = () => useContext(GetDocContext);
