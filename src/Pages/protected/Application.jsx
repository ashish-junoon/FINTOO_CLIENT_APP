import React, { createContext, useContext, useState, useEffect } from "react";
import PersonalInfo from "../../components/form/PersonalInfo";
import EmploymentInfo from "../../components/form/EmploymentInfo";
import AddressInfo from "../../components/form/AddressInfo";
import Guarantor from "../../components/form/Guarantor";
import KYCInfo from "../../components/form/KYCInfo";
import BankInfo from "../../components/form/BankInfo";
import FormSubmitMsg from "../../components/form/FormSubmitMsg";

export const StepContext = createContext();
export const ResetContext = createContext();

export const useStep = () => useContext(StepContext);
export const useReset = () => useContext(ResetContext);

function Application() {
    const [step, setStep] = useState(0);
    const [isReset, setIsReset] = useState(0);
    const [parsedData, setParsedData] = useState(null);
    const [formData, setFormData] = useState({
        personal: {},
        employment: {},
        address: {},
        guarantor: {},
        kyc: {},
        bank: {},
        FormSubmitMsg: {},
    });

    // Load user data from localStorage and determine initial step
    useEffect(() => {
        const loadUserData = () => {
            try {
                const userData = localStorage.getItem("loggedUser");
                if (userData) {
                    const parsed = JSON.parse(userData);
                    // console.log("Loaded user data:", parsed);
                    setParsedData(parsed);

                    // Use setTimeout to ensure state is updated before determining step
                    setTimeout(() => {
                        determineInitialStep(parsed);
                    }, 0);
                }
            } catch (error) {
                console.error("Error loading user data:", error);
                setParsedData({});
            }
        };

        loadUserData();
    }, []);

    // Completely reworked initial step determination
    const determineInitialStep = (userData) => {
        // console.log("Determining step with data:", userData);

        // Safely access properties with optional chaining
        const steps = [
            { field: "personal_info_fill", stepNum: 0 },
            { field: "employment_info_fill", stepNum: 1 },
            { field: "address_info", stepNum: 2 },
            { field: "gurantor_nominee_fill", stepNum: 3 },
            { field: "kyc_info_fill", stepNum: 4 },
            { field: "bank_info_fill", stepNum: 5 }
        ];

        // Find the first step that isn't completed
        for (const { field, stepNum } of steps) {
            const isCompleted = userData?.[field] === true;
            // console.log(`Checking ${field}: ${userData?.[field]}, isCompleted: ${isCompleted}`);

            if (!isCompleted) {
                // console.log(`Setting step to ${stepNum} because ${field} is not completed`);
                setStep(stepNum);
                return;
            }
        }

        // If all steps are completed
        // console.log("All steps completed, setting to final step");
        setStep(6);
    };

    // Update user data in localStorage
    const updateUserData = (field, value) => {
        try {
            const userData = JSON.parse(localStorage.getItem("loggedUser"));
            const updatedData = {
                ...userData,
                [field]: value
            };
            // console.log(`Updating ${field} to ${value}`, updatedData);
            localStorage.setItem("loggedUser", JSON.stringify(updatedData));
            setParsedData(updatedData);
        } catch (error) {
            console.error("Error updating user data:", error);
        }
    };

    const components = [
        {
            Component: PersonalInfo,
            handleSubmit: (data) => {
                setFormData(prev => ({ ...prev, personal: data }));
                updateUserData("personal_info_fill", true);
                setStep(1);
            },
        },
        {
            Component: EmploymentInfo,
            handleSubmit: (data) => {
                setFormData(prev => ({ ...prev, employment: data }));
                updateUserData("employment_info_fill", true);
                setStep(2);
            },
        },
        {
            Component: AddressInfo,
            handleSubmit: (data) => {
                setFormData(prev => ({ ...prev, address: data }));
                updateUserData("address_info", true);
                setStep(3);
            },
        },
        {
            Component: Guarantor,
            handleSubmit: (data) => {
                setFormData(prev => ({ ...prev, guarantor: data }));
                updateUserData("gurantor_nominee_fill", true);
                setStep(4);
            },
        },
        {
            Component: KYCInfo,
            handleSubmit: (data) => {
                setFormData(prev => ({ ...prev, kyc: data }));
                updateUserData("kyc_info_fill", false);
                setStep(5);
            },
        },
        {
            Component: BankInfo,
            handleSubmit: (data) => {
                setFormData(prev => ({ ...prev, bank: data }));
                updateUserData("bank_info_fill", true);
                setStep(6);
            },
        },
        {
            Component: FormSubmitMsg,
            handleSubmit: () => {
                // console.log("Form Data Submitted Successfully:", formData);
            },
        },
    ];

    // Get current component
    const { Component, handleSubmit } = components[step] || {};

    // useEffect(() => {
    //     console.log("Current step:", step);
    // }, [step]);

    // Prevent rendering until user data is loaded
    if (parsedData === null) {
        return <div>Loading...</div>;
    }

    return (
        <StepContext.Provider value={{ step, setStep }}>
            <ResetContext.Provider value={{ isReset, setIsReset }}>
                {/* Debug info - can be removed in production */}
                <div style={{ display: 'none' }}>
                    <p>Current step: {step}</p>
                    <p>gurantor_nominee_fill: {String(parsedData?.gurantor_nominee_fill)}</p>
                </div>

                {/* Current step component */}
                {Component && (
                    <Component
                        onSubmit={handleSubmit}
                        formData={formData}
                        userData={parsedData}
                    />
                )}
            </ResetContext.Provider>
        </StepContext.Provider>
    );
}

export default Application;