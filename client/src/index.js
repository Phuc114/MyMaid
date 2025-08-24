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
import { VerifyEmailProvider } from './context/VerifyEmailContext';
import { RegisterProvider } from './context/RegisterContext';
import { OnboardingProvider } from './context/OnboardingContext';
import { UserProvider } from './context/UserContext';
import { ForgotPasswordProvider } from './context/ForgotPasswordContext';

// NEW: Service context (lấy danh mục/phân loại từ server)
import { ServiceProvider } from './context/ServiceContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LoginProvider>
        <UserProvider>
          <ProfileProvider>
            <ChangePasswordProvider>
              <OrderHistoryProvider>
                <VerifyEmailProvider>
                  <RegisterProvider>
                    <OnboardingProvider>
                      <ForgotPasswordProvider>
                        {/* Bọc toàn bộ app bằng ServiceProvider */}
                        <ServiceProvider>
                          <App />
                        </ServiceProvider>
                      </ForgotPasswordProvider>
                    </OnboardingProvider>
                  </RegisterProvider>
                </VerifyEmailProvider>
              </OrderHistoryProvider>
            </ChangePasswordProvider>
          </ProfileProvider>
        </UserProvider>
      </LoginProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
