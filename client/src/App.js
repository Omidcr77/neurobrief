// src/App.js
import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Modal from 'react-modal';
import AOS from 'aos';
import 'aos/dist/aos.css';

import NavBar                from './components/NavBar';
import BackToTop             from './components/BackToTop';
import Footer                from './components/Footer';

import LoginPage             from './pages/LoginPage';
import WelcomePage           from './pages/WelcomePage';
import RegisterPage          from './pages/RegisterPage';
import SummarizePage         from './pages/SummarizePage';
import HistoryPage           from './pages/HistoryPage';
import DashboardPage         from './pages/DashboardPage';
import AdminPage             from './pages/AdminPage';
import UsersManagementPage   from './pages/UsersManagementPage';

// Global theme context
export const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {}
});

Modal.setAppElement('#root');

function Main() {
  const location = useLocation();
  const isAuth   = Boolean(localStorage.getItem('token'));
  const hideNav  = location.pathname === '/login'
                 || location.pathname === '/register';

  return (
    <>
      {!hideNav && <NavBar />}

      <div className="pt-16">
        <Routes>
          {/* Public — redirect logged-in users to /summarize */}
          <Route
            path="/"
            element={
              isAuth
                ? <Navigate to="/summarize" replace />
                : <WelcomePage />
            }
          />
          <Route
            path="/login"
            element={
              isAuth
                ? <Navigate to="/summarize" replace />
                : <LoginPage />
            }
          />
          <Route
            path="/register"
            element={
              isAuth
                ? <Navigate to="/summarize" replace />
                : <RegisterPage />
            }
          />

          {/* Protected */}
          <Route
            path="/summarize"
            element={isAuth ? <SummarizePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/history"
            element={isAuth ? <HistoryPage />   : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={isAuth ? <DashboardPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={isAuth ? <AdminPage />     : <Navigate to="/login" />}
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
    </>
  );
}

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );

  // Apply the `dark` class and persist theme choice
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Initialize AOS for scroll animations (replay on each scroll)
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: false,
      mirror: false,
    });
    const refresh = () => AOS.refresh();
    window.addEventListener('resize', refresh);
    window.addEventListener('load',   refresh);
    return () => {
      window.removeEventListener('resize', refresh);
      window.removeEventListener('load',   refresh);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <BrowserRouter>
        <Main />
        <BackToTop />
        <Footer />
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}
