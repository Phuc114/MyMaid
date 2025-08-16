// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Context
import { LoginProvider } from './context/LoginContext';
import { ProfileProvider } from './context/ProfileContext';
import { ChangePasswordProvider } from './context/ChangePasswordContext';
import { OrderHistoryProvider } from './context/OrderHistoryContext';
import { VerifyEmailProvider } from './context/VerifyEmailContext'; // <- THÊM
import { RegisterProvider } from './context/RegisterContext';
import { OnboardingProvider } from './context/OnboardingContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LoginProvider>
        <ProfileProvider>
          <ChangePasswordProvider>
            <OrderHistoryProvider>
              <VerifyEmailProvider>
                <RegisterProvider>
                  <OnboardingProvider>
                      <App />
                  </OnboardingProvider>
               </RegisterProvider>
              </VerifyEmailProvider>
            </OrderHistoryProvider>
          </ChangePasswordProvider>
        </ProfileProvider>
      </LoginProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
