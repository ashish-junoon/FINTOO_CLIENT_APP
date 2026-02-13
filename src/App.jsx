import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./components/context/AuthContext";
import ProtectedRoutes from "./components/routes/ProtectedRoutes";

// Import Page Components
import Dashboard from "./Pages/protected/Dashboard";
import Register from "./Pages/unprotected/Register";
import Login from "./Pages/unprotected/Login";
import ForgetPassword from "./Pages/unprotected/ForgetPassword";
import PublicLayout from "./components/layout/PublicLayout";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import Application from "./Pages/protected/Application";
import Loan from "./Pages/protected/Loan";
import Profile from "./Pages/protected/Profile";
import ProcessApp from "./Pages/protected/ProcessApp";
import { useUserInfoContext } from "./components/context/UserInfoContext";
import PaymentRedirect from "./Pages/protected/PaymentRedirect";
import Policy from "./Pages/protected/Policy";
import AcceptTerms from "./Pages/protected/AcceptTerms";
import MakePayment from "./Pages/unprotected/MakePayment";
import CallbackUrl from "./Pages/unprotected/CallbackUrl";
import TempKYC from "./Pages/unprotected/TempKYC";
import EnachSuccess from "./Pages/protected/EnachSuccess";
import EnachFailure from "./Pages/protected/EnachFailure";


function App() {
  const { loggedUser } = useAuth();
  const { userInfo } = useUserInfoContext();
  const isLoggedIn = loggedUser?.status;
  const isApplied = loggedUser?.bank_info_fill === true && loggedUser?.kyc_info_fill === true && loggedUser?.address_info === true && loggedUser?.employment_info_fill === true && loggedUser?.personal_info_fill === true && loggedUser?.gurantor_nominee_fill === true;


  return (
    <Router>
      <Routes>
        {isLoggedIn ? (
          /* Protected routes */
          <Route element={<ProtectedRoutes />}>
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/apply-loan" element={!isApplied ? <Application /> : <Navigate to="/" replace />} />
              <Route path="/process-loan" element={!userInfo?.is_loan_consent ? <ProcessApp /> : <Navigate to="/" replace />} />
              <Route path="/my-loan" element={<Loan />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Navigate to="/" />} />
              <Route path="/payment-status" element={<PaymentRedirect />} />
              <Route path="*" element={<Navigate to="/" />} />
              <Route path="/test" element={<AcceptTerms />} />
              <Route path="/success" element={<EnachSuccess />} />
              <Route path="/failure" element={<EnachFailure />} />
            </Route>
            <Route path="/agreement" element={<Policy />} />
          </Route>
        ) : (
          <>
            <Route element={<PublicLayout />}>
              {/* Unauthorized guest routes */}
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ForgetPassword />} />
              <Route path="*" element={<Navigate to="/register" />} />
            </Route>
            <Route path="/make-payment/:leadId/:loanId" element={<MakePayment />} />
            <Route path="/payment-info" element={<CallbackUrl />} />
            <Route path="/login" element={<Login />} />
            <Route path="/process" element={<TempKYC />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;