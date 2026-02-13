import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './components/context/AuthContext.jsx'
import { GetDataProvider } from './components/context/GetDataContext.jsx';
import { UserInfoProvider } from './components/context/UserInfoContext.jsx';
import { EmiProvider } from './components/context/EmiContext.jsx';
import { GetDocProvider } from './components/context/GetDocument.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <GetDataProvider>
        <UserInfoProvider>
          <GetDocProvider>
            <EmiProvider>
              <App />
            </EmiProvider>
          </GetDocProvider>
          <ToastContainer />
        </UserInfoProvider>
      </GetDataProvider>
    </AuthProvider>
  </StrictMode>,
)
