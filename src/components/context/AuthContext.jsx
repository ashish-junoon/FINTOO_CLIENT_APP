import { createContext, useContext, useReducer } from "react";

const AuthContext = createContext();

const TEN_HOURS_IN_MS = 10 * 60 * 60 * 1000;

const authReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            const now = new Date();
            const expiry = now.getTime() + TEN_HOURS_IN_MS;

            const loggedInUser = { ...action.payload, isAuthenticated: true };

            const isApplied = [
                "personal_info_fill",
                "employment_info_fill",
                "address_info",
                "kyc_info_fill",
                "bank_info_fill",
                "gurantor_nominee_fill"
            ].every(field => loggedInUser[field] === true);

            localStorage.setItem(
                "loggedUser",
                JSON.stringify({ ...loggedInUser, isApplied, expiry })
            );

            return {
                ...state,
                loggedUser: { ...loggedInUser, isApplied },
                isAuthenticated: true,
            };

        case "LOGOUT":
            localStorage.removeItem("loggedUser");
            return {
                ...state,
                loggedUser: null,
                isAuthenticated: false,
            };

        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const getValidUser = () => {
        const item = localStorage.getItem("loggedUser");
        if (!item) return null;

        const data = JSON.parse(item);
        const now = new Date();

        if (now.getTime() > data.expiry) {
            localStorage.removeItem("loggedUser");
            return null;
        }

        return data;
    };

    const validUser = getValidUser();

    const [state, dispatch] = useReducer(authReducer, {
        loggedUser: validUser,
        isAuthenticated: !!validUser,
    });

    const login = (loginResponse) => {
        dispatch({ type: "LOGIN", payload: loginResponse });
    };

    const logout = () => {
        dispatch({ type: "LOGOUT" });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
