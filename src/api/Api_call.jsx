import axios from "axios";

// Create an Axios instance with a base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    // maxRedirects: 0, // Prevent Axios from following redirects to HTTPS
});

//------------------------------------------
//USER ONBOARDING
//------------------------------------------

// Register Applicant Mobile
export const RegisterUser = async (req) => {
    try {
        const response = await api.post("/User/RegisterUser", req);
        return response.data; // Return the API response data
    } catch (error) {
        console.error("Registration error:", error.response?.data || error.message);
        throw error; // Rethrow error to handle it in the calling function
    }
};

// Applicant Mobile OTP Verification
export const VerifyMobileOTP = async (req) => {
    try {
        const response = await api.post("/User/VerifyMobileOTP", req);
        return response.data; // Return the API response data
    } catch (error) {
        console.error("OTP verification error:", error.response?.data || error.message);
        throw error;
    }
};

// Applicant Account Password Creation
export const CreatePassword = async (req) => {
    try {
        const response = await api.post("/User/CreatePassword", req);
        return response.data; // Return the API response data
    } catch (error) {
        console.error("Password creation error:", error.response?.data || error.message);
        throw error;
    }
};

// Applicant Login
export const userLogin = async (req) => {
    try {
        const response = await api.post("/User/LoginUser", req);
        return response.data; // Return the API response data
    } catch (error) {
        console.error("Login error:", error.response?.data || error.message);
        throw error;
    }
};

// Add Applicant Presonal Details
export const AddPersonalInfo = async (req) => {
    try {
        const response = await api.post("/User/AddPersonalInformation", req);
        return response.data; // Return the API response data
    } catch (error) {
        console.error("Add personal info error:", error.response?.data || error.message);
        throw error;
    }
}

//Add Applicant Employment Details
export const AddEmploymentInfo = async (req) => {
    try {
        const response = await api.post("/User/AddEmployment", req);
        return response.data; // Return the API response data
    } catch (error) {
        console.error("Add employment info error:", error.response?.data || error.message);
        throw error;
    }
};

//Add Applicant Address
export const addAddress = async (req) => {
    try {
        const response = await api.post("/User/AddAddressDetails", req);
        return response.data; // Return the API response data
    } catch (error) {
        console.error("Add address error:", error.response?.data || error.message);
        throw error;
    }
};

//Add Guarantor Nominee
export const AddGuarantorNominee = async (req) => {
    try {
        const response = await api.post("/User/AddUserGuarantorInfo", req);
        return response.data; // Return the API response data
    } catch (error) {
        console.error("Add guarantor error:", error.response?.data || error.message);
        throw error;
    }
};

//Add KYC Information
export const AddKYCInfo = async (req) => {
    try {
        const response = await api.post("/User/AddUserKycDetail", req);
        return response.data; // Return the API response data
    } catch (error) {
        console.error("Add KYC error:", error.response?.data || error.message);
        throw error;
    }
};

//Add Bank Information
export const AddUserBankInfo = async (req) => {
    try {
        const response = await api.post("/User/AddUserBankInfo", req);
        return response.data; // Return the API response data
    } catch (error) {
        console.error("Add bank error:", error.response?.data || error.message);
        throw error;
    }
};

//Send Email OTP
export const sendEmailOTP = async (req) => {
    try {
        const response = await api.post("/User/SentEmailOtp", req);
        return response.data;
    } catch (error) {
        console.error("Send Email OTP:", error.response?.data || error.message);
        throw error;
    }
};

//Verify Email OTP
export const verifyEmailOTP = async (req) => {
    try {
        const response = await api.post("/User/VerifyEmailOTP", req);
        return response.data;
    } catch (error) {
        console.error("Verify Email OTP:", error.response?.data || error.message);
        throw error;
    }
};

//Upload selfie 
export const uploadProfileImage = async (req) => {
    try {
        const response = await api.post("/User/AddUploadProfileImage", req);
        return response.data;
    } catch (error) {
        console.error("Upolad image error:", error.response?.data || error.message);
        throw error;
    }
};

//Forget Password
export const ForgetPasswordOTP = async (req) => {
    try {
        const response = await api.post("/User/ForgetPasswordOTP", req);
        return response.data; // Return the API response data
    } catch (error) {
        console.error("Forget password error:", error.response?.data || error.message);
        throw error;
    }
};

//Resend OTP
export const resendOTP = async (req) => {
    try {
        const response = await api.post("/User/ResendMobileOTP", req);
        return response.data;
    } catch (error) {
        console.error("Resend OTP:", error.response?.data || error.message);
        throw error;
    }
}


//------------------------------------------
//AUTO FETCH DATA
//------------------------------------------

//Get sectors Type
export const fetchSectorOptions = async () => {
    try {
        const response = await api.get('/Master/GetSectorType');
        return response.data;
    } catch (error) {
        console.error('Error fetching sectors:', error);
        throw error;
    }
};

//Get Salary Date
export const fetchSalaryDate = async () => {
    try {
        const response = await api.get('/Master/GetSalaryDate');
        return response.data;
    } catch (error) {
        console.error('Error fetching sectors:', error);
        throw error;
    }
};

//Get Employed Since
export const fetchEmploySince = async () => {
    try {
        const response = await api.get('/Master/GetEmployedSince');
        return response.data;
    } catch (error) {
        console.error('Error fetching sectors:', error);
        throw error;
    }

};

//Get State & City
export const getStateCity = async (req) => {
    try {
        const response = await api.post("/Master/GetStatesCity", req);
        return response.data;
    } catch (error) {
        console.error("Get State & City error:", error.response?.data || error.message);
        throw error;
    }
};

//Get Bank Name
export const getBankName = async (req) => {
    try {
        const response = await api.get("/Master/GetBankNameList", req);
        return response.data;
    } catch (error) {
        console.error("Get Bank Name error:", error.response?.data || error.message);
        throw error;
    }
};

export const getEasebuzzBankName = async () => {
    try {
        const response = await api.get("/EasebuzzIntegration/BankcodeList");
        return response.data;
    } catch (error) {
        console.error("Get Bank Name error:", error.response?.data || error.message);
        throw error;
    }
};

//------------------------------------------    
//PRODUCT
//------------------------------------------

// Get Assigned product to Applicant
export const getProductAssigned = async (req) => {
    try {
        const response = await api.post("/Product/GetAssignProduct", req);
        return response.data; // Return the API response data
    } catch (error) {
        console.error("Get Product Assigned:", error.response?.data || error.message);
        throw error; // Rethrow error to handle it in the calling function
    }
};

//Insert Selected Product
export const insertSelectedProduct = async (req) => {
    try {
        const response = await api.post("/Product/SelectedProduct", req);
        return response.data; // Return the API response data
    } catch (error) {
        console.error("Insert Selected Product:", error.response?.data || error.message);
        throw error; // Rethrow error to handle it in the calling function
    }
};

//Verify consent OTP
export const validateConsentOTP = async (req) => {
    try {
        const response = await api.post("/Product/VerifyConsentOtp", req);
        return response.data; // Return the API response data
    } catch (error) {
        console.error("Validate Consent OTP:", error.response?.data || error.message);
        throw error;
    }
};


//------------------------------------------    
// USER EKYC, NACH & SANCTION
//------------------------------------------

//Prefil eKYC Verification
export const verifyPrefilleKYC = async (req) => {
    try {
        const response = await api.post("/Prefill/GetKYCInfo", req);
        return response.data;
    } catch (error) {
        console.error("Prefill eKYC:", error.response?.data || error.message);
        throw error;
    }
};

//Verify PAN Card- eKYC
// export const verifyPANCard = async (req) => {
//     try {
//         const response = await api.post("/eKyc/PanBasicKyc", req);
//         return response.data;
//     } catch (error) {
//         console.error("Verify PAN Card:", error.response?.data || error.message);
//         throw error;
//     }
// }


//Verify PAN Card- eKYC EASEBUZZ
export const verifyPANCard = async (req) => {
    try {
        const response = await api.post("/EasebuzzIntegration/VerifyPAN", req);
        return response.data;
    } catch (error) {
        console.error("Verify PAN Card:", error.response?.data || error.message);
        throw error;
    }
}

//Verify PAN Card- eKYC SALORA
export const verifyPANCardBySalora = async (req) => {
    try {
        const response = await api.post("/Salora/SaloraPanValidation/Pan-Validate", req);
        return response.data;
    } catch (error) {
        console.error("Verify PAN Card:", error.response?.data || error.message);
        throw error;
    }
}

//Verify Aadhar Card- eKYC
// export const verifyAadharCard = async (req) => {
//     try {
//         const response = await api.post("/eKyc/AadhaarKyc", req);
//         return response.data;
//     } catch (error) {
//         console.error("Verify Aadhar Card:", error.response?.data || error.message);
//         throw error;
//     }
// }


//Verify Aadhar Card- eKYC Easebuzz
export const verifyAadharCard = async (req) => {
    try {
        const response = await api.post("/EasebuzzIntegration/VerifyAadhaar", req);
        return response.data;
    } catch (error) {
        console.error("Verify Aadhar Card:", error.response?.data || error.message);
        throw error;
    }
}

//Verify Aadhar Card- eKYC Salora
export const verifyAadharCardBySalora = async (req) => {
    try {
        const response = await api.post("/Salora/SaloraDigilockergenerateUrl/Digilocker-GenerateUrl", req);
        return response.data;
    } catch (error) {
        console.error("Verify Aadhar Card:", error.response?.data || error.message);
        throw error;
    }
}

//Get Aadhar Details- Salora
export const GetAadhaarDetailsBySalora = async (req) => {
    try {
        const response = await api.post("/Salora/SaloraDigilockerSaveDetails/Digilocker-SaveDetails", req);
        return response.data;
    } catch (error) {
        console.error("Get Aadhar Details:", error.response?.data || error.message);
        throw error;
    }
}

//Verify Aadhar Card- With OTP
export const generateAdhaarOTP = async (req) => {
    try {
        const response = await api.post("/eKyc/AadhaarKycOTP", req);
        return response.data;
    } catch (error) {
        console.error("Verify Aadhar Card With OTP:", error.response?.data || error.message);
        throw error;
    }
}

//Verify Aadhaar Card OTP
export const verifyAadhaarOTP = async (req) => {
    try {
        const response = await api.post("/eKyc/AadhaarKycOTPSubmit", req);
        return response.data;
    } catch (error) {
        console.error("Verify Aadhaar Card OTP:", error.response?.data || error.message);
        throw error;
    }
}



//get bankcode
export const getbankCodeListByCode = async (req) => {
    try {
        const response = await api.get(`/EasebuzzIntegration/BankcodeListByCode?BankCode=${req}`);
        return response.data;
    } catch (error) {
        console.error("Register eMandate:", error.response?.data || error.message);
        throw error;
    }
}

//Register eMandate Easebuzz
export const registerEMandateEaseBuze = async (req) => {
    try {
        const response = await api.post("/EasebuzzIntegration/RegisterEMandate", req);
        return response.data;
    } catch (error) {
        console.error("Register eMandate:", error.response?.data || error.message);
        throw error;
    }
}

//Register eMandate Salora
export const registerEMandateBySalora = async (req) => {
    try {
        // const response = await api.post("/Salora/SaloraEMandate/e-Mandate", req);
        const response = await api.post("/Salora/SaloraEMandate/Combined-Process-eMandate", req);
        return response.data;
    } catch (error) {
        console.error("Register eMandate:", error.response?.data || error.message);
        throw error;
    }
}

//Register eMandate Salora
export const checkMandateStatusBySalora = async (req) => {
    try {
        const response = await api.post("/Salora/SaloraMandateStatus/e-MandateStatus", req);
        return response.data;
    } catch (error) {
        console.error("Register eMandate:", error.response?.data || error.message);
        throw error;
    }
}

// eMandate details Easebuzz
export const GetMandateDetailsById = async (req) => {
    try {
        const response = await api.post("/EasebuzzIntegration/GetMandateDetailsById", req);
        return response.data;
    } catch (error) {
        console.error("Register eMandate:", error.response?.data || error.message);
        throw error;
    }
}

//Register eMandate Easebuzz
export const GetPaymentDetaisByID = async (req) => {
    try {
        const response = await api.post("/EasebuzzIntegration/GetPaymentDetaisByID ", req);
        return response.data;
    } catch (error) {
        console.error("Register eMandate:", error.response?.data || error.message);
        throw error;
    }
}

// To Get Aadhaar Details By Id
export const GetAadhaarDetailsById = async (req) => {
    try {
        const response = await api.post("/EasebuzzIntegration/GetAadhaarDetailsById ", req);
        return response.data;
    } catch (error) {
        console.error("Register eMandate:", error.response?.data || error.message);
        throw error;
    }
}



//Register eMandate
export const registerEMandate = async (req) => {
    try {
        const response = await api.post("/PayProvider/RegisterEmandate", req);
        return response.data;
    } catch (error) {
        console.error("Register eMandate:", error.response?.data || error.message);
        throw error;
    }
}

//Get Token Post Emandate
export const getTokenPostEmandate = async (req) => {
    try {
        const response = await api.post("/PayProvider/GetTokenPostEmandate", req);
        return response.data;
    } catch (error) {
        console.error("Get Token Post Emandate:", error.response?.data || error.message);
        throw error;
    }
}

//Get Senction letter
export const getSanctionLetter = async (req) => {
    try {
        const response = await api.post("/User/GetSanctionLetter", req);
        return response.data;
    } catch (error) {
        console.error("Get Senction Letter:", error.response?.data || error.message);
        throw error;
    }
}

//Send Senction Consent
export const sendSanctionConsentOTP = async (req) => {
    try {
        const response = await api.post("/User/SentSanctionConsentOTP", req);
        return response.data;
    } catch (error) {
        console.error("Send Senction Consent:", error.response?.data || error.message);
        throw error;
    }
}

//Validate Senction Consent
export const validateSanctionOTP = async (req) => {
    try {
        const response = await api.post("/User/VerifySanctionOTP", req);
        return response.data;
    } catch (error) {
        console.error("Validate Senction Consent:", error.response?.data || error.message);
        throw error;
    }
}

//Get Agreement & Policy
export const getAgreement = async (req) => {
    try {
        const response = await api.post("/User/GetAgreementLetter", req);
        return response.data;
    } catch (error) {
        console.error("Get Agreement:", error.response?.data || error.message);
        throw error;
    }
}


//------------------------------------------    
// USER DASHBOARD
//------------------------------------------

//Get Login User Data
export const getLoginUserData = async (req) => {
    try {
        const response = await api.post("/User/GetleadDetails_V1", req);
        return response.data; // Return the API response data
    } catch (error) {
        console.error("Get User Details error:", error.response?.data || error.message);
        throw error; // Rethrow error to handle it in the calling function
    }
};

//Get EMI schedule
export const getEMISchedule = async (req) => {
    try {
        const response = await api.post("/Product/GetEmiSchedule_V1", req);
        return response.data;
    } catch (error) {
        console.error("EMI Schedule:", error.response?.data || error.message);
        throw error;
    }
}

//Get Applicant Documents
export const getUserDocuments = async (req) => {
    try {
        const response = await api.post("/User/GetUserDocuments", req);
        return response.data;
    } catch (error) {
        console.error("Get Documents:", error.response?.data || error.message);
        throw error;
    }
}



//------------------------------------------    
// PAYMENT INTEGRATION
//------------------------------------------

//Create Payment request EaseBuzz
export const CreatePaymentLinkEaseBuzz = async (req) => {
    try {
        const response = await api.post("/EasebuzzIntegration/PaymentGateway", req);
        return response.data;
    } catch (error) {
        console.error("Payment Gateway Error:", error.response?.data || error.message);
        throw error;
    }
}


//Create Payment request
export const CreatePaymentLink = async (req) => {
    try {
        const response = await api.post("/PayProvider/PaymentLinks", req);
        return response.data;
    } catch (error) {
        console.error("Get Bank Name error:", error.response?.data || error.message);
        throw error;
    }
}

//Submit payment response to DB
export const GetPaymentDetails = async (req) => {
    try {
        const response = await api.post("/PayProvider/GetPaymentDetails", req);
        return response.data;
    } catch (error) {
        console.error("Paymeny details:", error.response?.data || error.message);
        throw error;
    }
}

//Get Payment details
export const GetPaymentStatus = async (req) => {
    try {
        const response = await api.post("/User/PaymentByURL", req);
        return response.data;
    } catch (error) {
        console.error("Get Payment Status:", error.response?.data || error.message);
        throw error;
    }
}

export const ReloanUser = async (req) => {
    try {
        const response = await api.post("/ReLoan/ReLoan", req);
        return response.data;
    } catch (error) {
        console.error("Reloan:", error.response?.data || error.message);
        throw error;
    }
}

export const LoanHistory = async (req) => {
    try {
        const response = await api.post("/Admin/LoanHistory", req);
        return response.data;
    } catch (error) {
        console.error("Loan History:", error.response?.data || error.message);
        throw error;
    }
}