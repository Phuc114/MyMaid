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

// NEW
import { ServiceProvider } from './context/ServiceContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* QUAN TRỌNG: UserProvider phải bọc ngoài LoginProvider */}
      <UserProvider>
        <LoginProvider>
          <VerifyEmailProvider>
            <RegisterProvider>
              {/* Onboarding có dùng useUser => phải nằm trong UserProvider */}
              <OnboardingProvider>
                {/* Các context còn lại có thể dùng token/user nên để bên trong */}
                <ProfileProvider>
                  <ChangePasswordProvider>
                    <OrderHistoryProvider>
                      <ForgotPasswordProvider>
                        <ServiceProvider>
                          <App />
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
