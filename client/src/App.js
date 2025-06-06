// App.js

import React, { useState, useEffect, createContext } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom';
import Modal from 'react-modal';
import AOS from 'aos';
import 'aos/dist/aos.css';

import NavBar from './components/NavBar';
import BackToTop from './components/BackToTop';
import Footer from './components/Footer';
import DemoExperience from './components/DemoExperience';

import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import RegisterPage from './pages/RegisterPage';
import SummarizePage from './pages/SummarizePage';
import HistoryPage from './pages/HistoryPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import UsersManagementPage from './pages/UsersManagementPage';

// Global theme context
export const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {}
});

Modal.setAppElement('#root');

function Main() {
  const [showDemoExperience, setShowDemoExperience] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: '', text: '' });
  const location = useLocation();
  const navigate = useNavigate();
  const isAuth = Boolean(localStorage.getItem('token'));

  // Hide Navbar on these paths:
  const hideNav =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname.startsWith('/reset-password');

  // Hide Footer on these paths:
  const hideFooter =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname === '/summarize' ||
    location.pathname === '/history' ||
    location.pathname === '/dashboard' ||
    location.pathname === '/admin' ||
    location.pathname === '/admin/users';

  // Auto-hide toast message after 3 seconds
  useEffect(() => {
    if (toastMessage.text) {
      const timer = setTimeout(() => setToastMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <>
      {showDemoExperience && (
        <DemoExperience
          onDemoStart={(start) => {
            setShowDemoExperience(false);
            if (start) {
              navigate('/dashboard');
              setToastMessage({
                type: 'info',
                text: 'You are in demo mode. Data will reset periodically.'
              });
            }
          }}
        />
      )}

      {/* Navbar (hidden on login/register/forgot/reset) */}
      {!hideNav && <NavBar setShowDemoExperience={setShowDemoExperience} />}

      {/* Toast Notification */}
      {toastMessage.text && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-5 py-3 rounded-xl shadow-2xl text-white ${
            toastMessage.type === 'success'
              ? 'bg-green-500'
              : toastMessage.type === 'error'
              ? 'bg-red-500'
              : 'bg-blue-500'
          }`}
        >
          <span className="font-medium">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage({ type: '', text: '' })}
            className="opacity-80 hover:opacity-100"
          >
            &times;
          </button>
        </div>
      )}

      <div className="pt-16">
        <Routes>
          {/* Public — redirect logged-in users to /summarize */}
          <Route
            path="/"
            element={
              isAuth ? (
                <Navigate to="/summarize" replace />
              ) : (
                <WelcomePage setShowDemoExperience={setShowDemoExperience} />
              )
            }
          />
          <Route
            path="/login"
            element={isAuth ? <Navigate to="/summarize" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={isAuth ? <Navigate to="/summarize" replace /> : <RegisterPage />}
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected */}
          <Route
            path="/summarize"
            element={isAuth ? <SummarizePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/history"
            element={isAuth ? <HistoryPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={
              isAuth ? (
                <DashboardPage setToastMessage={setToastMessage} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/admin"
            element={isAuth ? <AdminPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/users"
            element={isAuth ? <UsersManagementPage /> : <Navigate to="/login" />}
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to={isAuth ? '/summarize' : '/'} replace />}
          />
        </Routes>
      </div>

      {/* Footer: only render when hideFooter is false */}
      {!hideFooter && <Footer />}
    </>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Apply the `dark` class and persist theme choice
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Initialize AOS for scroll animations
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: false,
      mirror: false
    });
    const refresh = () => AOS.refresh();
    window.addEventListener('resize', refresh);
    window.addEventListener('load', refresh);
    return () => {
      window.removeEventListener('resize', refresh);
      window.removeEventListener('load', refresh);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <BrowserRouter>
        <Main />
        <BackToTop />
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}
