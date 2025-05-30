// src/pages/ForgotPasswordPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import api from '../api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset instructions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full flex items-center px-6 h-14 bg-white dark:bg-gray-800 shadow-md z-20">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-700 dark:text-gray-200 focus:outline-none rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Go back"
        >
          <FaArrowLeft size={18} />
        </button>
      </header>

      {/* Main Content */}
      <section className="pt-20 pb-10 px-4 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8"
        >
          {success ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                <FaCheckCircle className="text-green-500 text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Instructions Sent!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                We've sent password reset instructions to your email. Please check your inbox.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                  <FaEnvelope className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Forgot Password
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Enter your email to reset your password
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    placeholder="your@email.com"
                  />
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200">
                    {error}
                  </div>
                )}

{loading && !success && (
  <div className="p-3 text-sm text-blue-700 bg-blue-50 rounded-lg dark:bg-blue-900/30 dark:text-blue-200">
    Sending reset instructions...
  </div>
)}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-3.5 font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-70"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : null}
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </section>
    </div>
  );
}