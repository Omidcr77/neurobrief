// src/pages/LoginPage.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaSpinner,
  FaArrowLeft,
  FaMoon,
  FaSun,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { ThemeContext } from '../App';

export default function LoginPage() {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [showToast, setShowToast]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Theme toggle
  const { theme, setTheme } = useContext(ThemeContext);
  const toggleTheme = () =>
    setTheme(theme === 'dark' ? 'light' : 'dark');

  // Inactivity toast
  const resetTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowToast(true), 30000);
  };
  useEffect(() => {
    resetTimer();
    window.addEventListener('click', resetTimer);
    window.addEventListener('keydown', resetTimer);
    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, []);

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      const profile = await api.get('/auth/profile');
      localStorage.setItem('role', profile.data.role);
      navigate('/summarize', { state: { showWelcome: true } });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Unexpected error';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full flex items-center justify-between px-4 h-12 bg-white dark:bg-gray-800 shadow z-20">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
          aria-label="Go back"
        >
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Login
        </h1>
        <button
          onClick={toggleTheme}
          className="text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button>
      </header>

      {/* Main */}
      <section className="relative flex items-center justify-center min-h-screen pt-12 bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-300 mix-blend-multiply blur-3xl opacity-20 animate-blob dark:bg-indigo-700 dark:opacity-10" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-300 mix-blend-multiply blur-2xl opacity-20 animate-blob animation-delay-4000 dark:bg-teal-700 dark:opacity-10" />

        {/* Animated Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-extrabold text-center text-indigo-600 dark:text-indigo-300 mb-6">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  peer w-full px-4 py-3 border-2 rounded-lg
                  border-gray-200 dark:border-gray-600
                  bg-white dark:bg-gray-700
                  focus:outline-none focus:ring-2 focus:ring-indigo-400
                  transition
                "
                placeholder=" "
                aria-invalid={!!error}
                aria-describedby="email-error"
              />
              <label
                htmlFor="email"
                className="
                  absolute left-4 top-3 text-gray-500 dark:text-gray-400
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
                  peer-focus:-top-2 peer-focus:text-sm peer-focus:text-indigo-600
                  transition-all
                "
              >
                Email Address
              </label>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  peer w-full pr-10 px-4 py-3 border-2 rounded-lg
                  border-gray-200 dark:border-gray-600
                  bg-white dark:bg-gray-700
                  focus:outline-none focus:ring-2 focus:ring-indigo-400
                  transition
                "
                placeholder=" "
                aria-describedby="password-error"
              />
              <label
                htmlFor="password"
                className="
                  absolute left-4 top-3 text-gray-500 dark:text-gray-400
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
                  peer-focus:-top-2 peer-focus:text-sm peer-focus:text-indigo-600
                  transition-all
                "
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Error message */}
            <div
              id="email-error"
              role="alert"
              aria-live="assertive"
              className="text-center text-red-600 dark:text-red-400 text-sm h-5"
            >
              {error}
            </div>

            {/* Forgot & Submit */}
            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 dark:text-indigo-300 hover:underline"
              >
                Forgot password?
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="
                  flex items-center gap-2 px-6 py-3 font-semibold rounded-lg
                  bg-gradient-to-r from-blue-500 to-indigo-600
                  text-white hover:scale-105 active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-indigo-400
                  transition
                "
              >
                {loading && <FaSpinner className="animate-spin" />}
                {loading ? 'Logging in…' : 'Login'}
              </button>
            </div>
          </form>

          {/* Signup link */}
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Don’t have an account?{' '}
            <Link
              to="/register"
              className="text-indigo-600 dark:text-indigo-300 hover:underline"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </section>

      {/* Inactivity Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="
              fixed bottom-4 right-4 bg-gray-800 text-white
              px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-30
            "
            role="alert"
            aria-live="polite"
          >
            <span>Still there?</span>
            <button
              onClick={() => {
                setShowToast(false);
                navigate('/');
              }}
              className="underline"
            >
              Go home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
