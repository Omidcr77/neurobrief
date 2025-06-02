// src/pages/RegisterPage.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaSpinner,
  FaArrowLeft,
  FaMoon,
  FaSun,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { ThemeContext } from '../App';

export default function RegisterPage() {
  // ─── BASIC FIELDS ──────────────────────────────────────
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  
  // ─── NEW: verificationCode & UI step ───────────────────
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState('enterDetails'); 
    // 'enterDetails' | 'enterCode'
  
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const nameInputRef = useRef(null);

  const navigate = useNavigate();
  const timerRef = useRef(null);

  // ─── Theme toggle (unchanged) ─────────────────────────
  const { theme, setTheme } = useContext(ThemeContext);
  const toggleTheme = () =>
    setTheme(theme === 'dark' ? 'light' : 'dark');

  // ─── Auto-focus & inactivity toast (unchanged) ────────
  useEffect(() => {
    if (nameInputRef.current) nameInputRef.current.focus();
  }, []);

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

  // ────────────────────────────────────────────────────────


  // ─── STEP 1: send registration & email verification code ─
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { name, email, password };
      const { data } = await api.post('/auth/register', payload);
      // If we get here, the server responded with:
      // { message: 'Verification code sent to email. Please check your inbox.', email: '…' }
      // → switch to step 'enterCode'
      setStep('enterCode');
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Registration failed'
      );
      setLoading(false);
    }
  };


  // ─── STEP 2: verify code & actually get token ──────────
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/verify-email', {
        email,
        code: verificationCode
      });
      // data should be: { message, token, user: { … } }
      const { token } = data;
      localStorage.setItem('token', token);

      // Optionally fetch profile or store role directly
      const profile = await api.get('/auth/profile');
      localStorage.setItem('role', profile.data.role);

      setLoading(false);
      navigate('/summarize', { state: { showWelcome: true } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Verification failed'
      );
      setLoading(false);
    }
  };


  return (
    <>
      {/* Header (unchanged) */}
      <header className="fixed top-0 left-0 w-full flex items-center justify-between px-6 h-14 bg-white dark:bg-gray-800 shadow-md z-20">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Go back"
        >
          <FaArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Create Account
        </h1>
        <button
          onClick={toggleTheme}
          className="text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>
      </header>

      {/* Main container (unchanged) */}
      <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900">
        <section className="h-full flex flex-col pt-14">
          <div className="flex-1 flex items-center justify-center overflow-auto py-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 mx-4"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200">
                  {step === 'enterDetails'
                    ? 'Create Account'
                    : 'Verify Your Email'}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {step === 'enterDetails'
                    ? 'Join our community to start summarizing content'
                    : `We sent a code to ${email}. Enter it below:`}
                </p>
              </div>

              {step === 'enterDetails' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Full Name
                    </label>
                    <input
                      ref={nameInputRef}
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="
                        w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200
                        transition
                      "
                      placeholder="John Doe"
                      aria-invalid={!!error}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="username"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="
                        w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200
                        transition
                      "
                      placeholder="your@email.com"
                      aria-invalid={!!error}
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="
                          w-full pr-10 px-4 py-3 border border-gray-300 rounded-lg shadow-sm
                          focus:outline-none focus:ring-2 focus:ring-blue-500
                          bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200
                          transition
                        "
                        placeholder="••••••••"
                        aria-describedby="password-error"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 focus:outline-none"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div
                      id="password-error"
                      role="alert"
                      aria-live="assertive"
                      className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200"
                    >
                      <FaExclamationTriangle className="mr-2 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      w-full flex items-center justify-center px-6 py-3.5 text-sm font-medium
                      bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg
                      hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-4
                      focus:ring-blue-300 dark:focus:ring-blue-800 transition-all transform
                      hover:scale-[1.03] active:scale-[0.97] duration-200 ease-in-out shadow-md
                      hover:shadow-lg disabled:opacity-70
                    "
                  >
                    {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
                    {loading ? 'Sending code...' : 'Register'}
                  </button>
                </form>
              )}

              {step === 'enterCode' && (
                <form onSubmit={handleVerifyCode} className="space-y-6">
                  {/* Code input */}
                  <div className="space-y-2">
                    <label
                      htmlFor="code"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Verification Code
                    </label>
                    <input
                      id="code"
                      type="text"
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="
                        w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200
                        transition
                      "
                      placeholder="Enter 6-digit code"
                      aria-invalid={!!error}
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200"
                    >
                      <FaExclamationTriangle className="mr-2 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* Verify button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      w-full flex items-center justify-center px-6 py-3.5 text-sm font-medium
                      bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg
                      hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4
                      focus:ring-green-300 dark:focus:ring-green-800 transition-all transform
                      hover:scale-[1.03] active:scale-[0.97] duration-200 ease-in-out shadow-md
                      hover:shadow-lg disabled:opacity-70
                    "
                  >
                    {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </form>
              )}

              {step === 'enterCode' && (
                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Didn’t receive code?{' '}
                  <button
                    onClick={async () => {
                      // Optionally allow “Resend code” by re‐calling /auth/register
                      setError('');
                      setLoading(true);
                      try {
                        await api.post('/auth/register', { name, email, password });
                        setLoading(false);
                      } catch (resendErr) {
                        setError(resendErr.response?.data?.message || resendErr.message);
                        setLoading(false);
                      }
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Resend code
                  </button>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Inactivity Toast (unchanged) */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="
              fixed bottom-6 right-6 z-[100] flex items-center space-x-3 px-5 py-3 rounded-xl shadow-2xl text-white bg-blue-500
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
              className="underline font-medium"
            >
              Go home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
