import { createContext, useContext, useEffect, useState } from "react";
import { fetchSectorOptions, fetchSalaryDate, fetchEmploySince, getBankName, getEasebuzzBankName } from "../../api/Api_call";

const GetDataContext = createContext();

export const GetDataProvider = ({ children }) => {
    const [sector, setSector] = useState([]);
    const [salaryDate, setSalaryDate] = useState([]);
    const [employedSince, setEmployedSince] = useState([]);
    const [bankList, setBankList] = useState([]);

    const getSectorType = async () => {
        try {
            const response = await fetchSectorOptions();
            setSector(response?.sector || []);
        } catch (error) {
            console.error("Error fetching SectorType:", error);
        }
    };

    const getSalaryDate = async () => {
        try {
            const response = await fetchSalaryDate();
            setSalaryDate(response?.salary_Models || []);
        } catch (error) {
            console.error("Error fetching SalaryDate:", error);
        }
    };

    const getEmployedSince = async () => {
        try {
            const response = await fetchEmploySince();
            setEmployedSince(response?.employedSinces || []);
        } catch (error) {
            console.error("Error fetching EmployedSince:", error);
        }
    };

    // const getBankList = async () => {
    //     try {
    //         const response = await getBankName();
    //         setBankList(response?.bankName || []);
    //     } catch (error) {
    //         console.error("Error fetching bank list:", error);
    //     }
    // };

    const getBankList = async () => {
        try {
            const response = await getEasebuzzBankName();
            setBankList(response?.data || []);
        } catch (error) {
            console.error("Error fetching bank list:", error);
        }
    };
    useEffect(() => {
        getSectorType();
        getSalaryDate();
        getEmployedSince();
        getBankList();
    }, []);

    return (
        <GetDataContext.Provider value={{ sector, salaryDate, employedSince, bankList }}>
            {children}
        </GetDataContext.Provider>
    );
};

export const useGetData = () => useContext(GetDataContext);
