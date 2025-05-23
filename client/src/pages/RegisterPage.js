import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, Link }          from 'react-router-dom';
import { FaSpinner, FaArrowLeft, FaMoon, FaSun } from 'react-icons/fa';
import api                            from '../api';
import { ThemeContext }               from '../App';

export default function RegisterPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Theme toggle
  const { theme, setTheme } = useContext(ThemeContext);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Form submit
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1️⃣ Register and store JWT
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);

      // 2️⃣ Fetch profile to get role, then persist it
      const profileRes = await api.get('/auth/profile');
      localStorage.setItem('role', profileRes.data.role);

      // 3️⃣ Navigate into the app
navigate('/summarize', { state: { showWelcome: true } });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  // Inactivity timer (30s)
  const resetTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowToast(true), 30000);
  };

  useEffect(() => {
    resetTimer();
    document.addEventListener('click', resetTimer);
    document.addEventListener('keydown', resetTimer);
    return () => {
      clearTimeout(timerRef.current);
      document.removeEventListener('click', resetTimer);
      document.removeEventListener('keydown', resetTimer);
    };
  }, []);

  return (
    <>
      {/* ─── Minimal Contextual Header ─── */}
      <header className="fixed top-0 left-0 w-full flex items-center justify-between px-4 h-12 bg-white dark:bg-gray-800 shadow-md z-20">
        <button onClick={() => navigate(-1)} className="text-gray-800 dark:text-gray-200">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Create Account
        </h1>
        <button onClick={toggleTheme} className="text-gray-800 dark:text-gray-200">
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button>
      </header>

      {/* ─── Main Form ─── */}
      <section className="relative min-h-screen flex items-center justify-center py-12 pt-16 bg-gradient-to-r from-indigo-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Blobs */}
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-indigo-300 mix-blend-multiply blur-3xl opacity-20 dark:bg-indigo-700 dark:opacity-10 animate-blob" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-300 mix-blend-multiply blur-2xl opacity-20 dark:bg-teal-700 dark:opacity-10 animate-blob animation-delay-4000" />

        <div className="relative z-10 max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 transition">
          <h2 className="text-2xl font-extrabold text-center text-indigo-600 dark:text-indigo-300 mb-6">
            Create Account
          </h2>

          {error && (
            <div className="mb-4 text-red-600 dark:text-red-400 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 transition"
              />
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 font-semibold rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105 duration-300"
              >
                {loading && <FaSpinner className="animate-spin mr-2" />}
                {loading ? 'Registering…' : 'Register'}
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-300 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </section>

      {/* ─── Inactivity Toast ─── */}
      {showToast && (
        <div className="fixed bottom-4 right-4 flex items-center bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-30 transition-opacity duration-300">
          <span>Need to go back?</span>
          <button onClick={() => navigate('/')} className="ml-2 underline font-medium">
            Click here.
          </button>
        </div>
      )}
    </>
  );
}
