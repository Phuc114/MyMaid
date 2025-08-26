// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Context
import { UserProvider } from './context/UserContext';
import { LoginProvider } from './context/LoginContext';
import { VerifyEmailProvider } from './context/VerifyEmailContext';
import { RegisterProvider } from './context/RegisterContext';
import { OnboardingProvider } from './context/OnboardingContext';
import { ProfileProvider } from './context/ProfileContext';
import { ChangePasswordProvider } from './context/ChangePasswordContext';
import { OrderHistoryProvider } from './context/OrderHistoryContext';
import { ForgotPasswordProvider } from './context/ForgotPasswordContext';
import { ServiceProvider } from './context/ServiceContext';

// NEW
import { HomeProvider } from './context/HomeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <LoginProvider>
          <VerifyEmailProvider>
            <RegisterProvider>
              <OnboardingProvider>
                <ProfileProvider>
                  <ChangePasswordProvider>
                    <OrderHistoryProvider>
                      <ForgotPasswordProvider>
                        <ServiceProvider>
                          {/* NEW: dữ liệu trang chủ */}
                          <HomeProvider>
                            <App />
                          </HomeProvider>
                        </ServiceProvider>
                      </ForgotPasswordProvider>
                    </OrderHistoryProvider>
                  </ChangePasswordProvider>
                </ProfileProvider>
              </OnboardingProvider>
            </RegisterProvider>
          </VerifyEmailProvider>
        </LoginProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
