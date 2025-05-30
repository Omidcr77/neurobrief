// src/pages/DashboardPage.jsx
import React, {
  useEffect,
  useState,
  Fragment,
} from 'react';

import { useNavigate } from 'react-router-dom';
import {
  FaSpinner,
  FaEdit,
  FaSave,
  FaTimes,
  FaEye,
  FaClipboard,
  FaLock,
  FaCheckCircle, // Added for toast notification success
  FaExclamationTriangle, // Added for toast notification error/warning
  FaUserCircle // New icon for empty profile state
} from 'react-icons/fa';
import { Dialog, Transition } from '@headlessui/react';
import api from '../api';

export default function DashboardPage() {


const navigate = useNavigate();
const isDemo = localStorage.getItem('isDemo') === 'true';


  // --- Core data ---
  const [profile, setProfile] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // This will be replaced by toast

  // --- Edit Profile state ---
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  // const [saveError, setSaveError] = useState(''); // Replaced by toast

  // --- Change Password state ---
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  // const [pwdError, setPwdError] = useState(''); // Replaced by toast
  // const [pwdSuccess, setPwdSuccess] = useState(''); // Replaced by toast

  // --- View Summary Modal ---
  const [selected, setSelected] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  // --- Global Toast Notification State ---
  const [toastMessage, setToastMessage] = useState({ type: '', text: '' }); // { type: 'success'/'error', text: 'Message' }

  // Fetch profile + summaries on mount
  useEffect(() => {
    Promise.all([
      api.get('/auth/profile'),
      api.get('/summaries'),
    ])
      .then(([pRes, sRes]) => {
        setProfile(pRes.data);
        // Sort summaries by date, newest first, similar to HistoryPage
        const sortedSummaries = sRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSummaries(sortedSummaries);
      })
      .catch(() => {
        setToastMessage({ type: 'error', text: 'Failed to load dashboard. Please try again.' });
        // setError('Failed to load dashboard.'); // Replaced by toast
      })
      .finally(() => setLoading(false));
  }, []);

  // Pre-fill edit form
  useEffect(() => {
    if (profile && isEditing) {
      setFormData({
        name: profile.name,
        email: profile.email,
      });
      // setSaveError(''); // Replaced by toast
    }
  }, [profile, isEditing]);

  // Auto-hide toast message
  useEffect(() => {
    if (toastMessage.text) {
      const timer = setTimeout(() => setToastMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Helper: get 2-letter initials
  function getInitials(nameOrEmail = '') {
    const parts = nameOrEmail.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    // fallback: take first two chars
    return nameOrEmail.slice(0, 2).toUpperCase();
  }

  // --- Handlers ---
  const handleChange = (e) =>
    setFormData((fd) => ({
      ...fd,
      [e.target.name]: e.target.value,
    }));

  const handleSaveProfile = async () => {
    setSaving(true);
    // setSaveError(''); // Replaced by toast
    setToastMessage({ type: '', text: '' }); // Clear previous toast
    try {
      const { data } = await api.put(
        '/auth/profile',
        formData
      );
      setProfile(data);
      setIsEditing(false);
      setToastMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save profile.',
      });
      // setSaveError(err.response?.data?.message || 'Save failed.'); // Replaced by toast
    } finally {
      setSaving(false);
    }
  };

  const handlePwdChange = async () => {
    const { currentPassword, newPassword, confirmPassword } =
      pwdForm;
    // setPwdError(''); // Replaced by toast
    // setPwdSuccess(''); // Replaced by toast
    setToastMessage({ type: '', text: '' }); // Clear previous toast

    if (newPassword !== confirmPassword) {
      setToastMessage({ type: 'error', text: 'Passwords do not match.' });
      // setPwdError('Passwords do not match.'); // Replaced by toast
      return;
    }
    setPwdLoading(true);
    try {
      // Adjust endpoint / body to your backend
      await api.put('/auth/password', {
        currentPassword,
        newPassword,
      });
      setToastMessage({ type: 'success', text: 'Password changed successfully!' });
      // setPwdSuccess('Password changed!'); // Replaced by toast
      setTimeout(() => {
        setPwdModalOpen(false);
        // setPwdSuccess(''); // Handled by toast auto-hide
        setPwdForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }, 1500);
    } catch (err) {
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password.',
      });
      // setPwdError(err.response?.data?.message || 'Change password failed.'); // Replaced by toast
    } finally {
      setPwdLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }).catch(() => {
      setCopySuccess('Failed to copy');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900 p-4">
        <FaSpinner className="animate-spin text-5xl text-blue-600 dark:text-blue-400 mb-4" />
        <p className="text-lg text-gray-700 dark:text-gray-300">Loading your dashboard...</p>
      </div>
    );
  }

  // No separate error state, handled by toast
  // if (error) {
  //   return (
  //     <div className="p-6 text-red-600 dark:text-red-400">
  //       {error}
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900 py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <header className="text-center sm:text-left mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome, <span className="text-blue-600 dark:text-blue-400">{profile?.name || profile?.email}</span>
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Manage your profile and review your recent summaries.
          </p>
        </header>

        {/* Profile Section */} 
{isDemo && (
  <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/50">
    <p className="text-yellow-700 dark:text-yellow-300 text-center">
      <span className="font-semibold">Demo Mode:</span> You're exploring with sample data. 
      <button 
        onClick={() => navigate('/register')}
        className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
      >
        Create an account
      </button> 
      to save your work.
    </p>
  </div>
)}

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 max-w-2xl mx-auto p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* Avatar Placeholder */}
              <div className="
                w-16 h-16 rounded-full bg-indigo-600 text-white
                flex items-center justify-center text-2xl font-bold
                shadow-md
              ">
                {getInitials(profile.name || profile.email)}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Profile
              </h2>
            </div>

            {/* Edit / Change-Password buttons */}
            <div className="space-x-2 flex">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-700/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors shadow-sm"
                  >
                    <FaEdit className="inline mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => setPwdModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800 transition-colors shadow-sm"
                  >
                    <FaLock className="inline mr-2" />
                    Change Password
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <FaSpinner className="inline-block animate-spin mr-2" />
                    ) : (
                      <FaSave className="inline-block mr-2" />
                    )}
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {!isEditing ? (
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="text-lg">
                <span className="font-semibold text-gray-900 dark:text-white">Name:</span>{' '}
                {profile.name}
              </p>
              <p className="text-lg">
                <span className="font-semibold text-gray-900 dark:text-white">Email:</span>{' '}
                {profile.email}
              </p>
              <p className="text-lg">
                <span className="font-semibold text-gray-900 dark:text-white">Role:</span>{' '}
                <span className="capitalize">{profile.role}</span>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* saveError handled by global toast */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="
                    w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
                    dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200
                    focus:ring-blue-500 focus:border-blue-500 outline-none
                  "
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="
                    w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
                    dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200
                    focus:ring-blue-500 focus:border-blue-500 outline-none
                  "
                />
              </div>
            </div>
          )}
        </section>

        {/* Summaries Section */}
        <section className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Recent Summaries
            </h2>
            <span className="
              bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md
            ">
              {summaries.length}{' '}
              {summaries.length === 1 ? 'Summary' : 'Summaries'}
            </span>
          </div>

          {summaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
              <FaUserCircle className="text-6xl text-blue-500 dark:text-blue-400 mb-6" />
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                No summaries yet.
              </p>
              <a
                href="/summarize"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all transform hover:scale-[1.03] active:scale-[0.97] duration-200 ease-in-out shadow-md hover:shadow-lg"
              >
                Start Summarizing Now
              </a>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {summaries.slice(0, 3).map((item) => ( // Display only recent 3 for dashboard
                <article
                  key={item._id}
                  className="
                    relative bg-white dark:bg-gray-800 p-5 sm:p-6
                    rounded-xl shadow-lg hover:shadow-2xl
                    transition-all duration-300 ease-in-out transform hover:-translate-y-1
                    flex flex-col
                  "
                >
                  <span className="
                    absolute top-4 right-4
                    inline-block px-3 py-1 text-xs font-semibold rounded-full
                    ${item.inputType === 'text' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' :
                      item.inputType === 'pdf' ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100'}
                  ">
                    {item.inputType.toUpperCase()}
                  </span>

                  <h3 className="
                    mt-6 text-sm text-gray-500
                    dark:text-gray-400
                  ">
                    {new Date(
                      item.createdAt
                    ).toLocaleString()}
                  </h3>
                  <p className="
                    mt-1 text-gray-800 dark:text-gray-200
                    line-clamp-3 text-base flex-grow
                  ">
                    {item.summary}
                  </p>

                  <button
                    onClick={() => setSelected(item)}
                    className="
                      mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-medium
                      text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-700/30 rounded-lg
                      hover:bg-blue-200 dark:hover:bg-blue-600 focus:outline-none focus:ring-2
                      focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors
                      self-end
                    "
                  >
                    <FaEye className="mr-1" />
                    View Details
                  </button>
                </article>
              ))}
            </div>
          )}

          {summaries.length > 0 && (
            <div className="text-center mt-8">
              <a
                href="/history"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all transform hover:scale-[1.03] active:scale-[0.97] duration-200 ease-in-out shadow-md hover:shadow-lg"
              >
                View All Summaries
              </a>
            </div>
          )}
        </section>
      </div>

      {/* View Summary Modal (Refined) */}
      <Transition
        appear
        show={!!selected}
        as={Fragment}
      >
        <Dialog
          as="div"
          className="relative z-50" // Changed from fixed inset-0 to relative for better stacking context
          onClose={() => setSelected(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="
                  w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 sm:p-8 text-left align-middle shadow-xl transition-all
                ">
                  <Dialog.Title
                    as="h3"
                    className="text-xl sm:text-2xl font-semibold leading-tight text-gray-900 dark:text-white mb-1"
                  >
                    Full Summary
                  </Dialog.Title>
                   <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Type: <span className="font-medium text-gray-700 dark:text-gray-300">{selected?.inputType?.toUpperCase()}</span> | Date: {new Date(selected?.createdAt).toLocaleString()}
                  </p>

                  {selected?.input && (selected.inputType === 'url' || selected.inputType === 'pdf') && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Original Source:</h4>
                      <p className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md text-xs text-gray-600 dark:text-gray-300 break-all">
                        {selected?.inputFileName || selected?.input}
                      </p>
                    </div>
                  )}

                  {selected?.summaryOptions && (
                    <div className="mb-4 grid grid-cols-2 gap-x-4 text-sm">
                        <div><strong className="text-gray-600 dark:text-gray-400">Type:</strong> <span className="text-gray-800 dark:text-gray-200 capitalize">{selected.summaryOptions.type}</span></div>
                        <div><strong className="text-gray-600 dark:text-gray-400">Length:</strong> <span className="text-gray-800 dark:text-gray-200 capitalize">{selected.summaryOptions.length}</span></div>
                        {selected.summaryOptions.focus && <div><strong className="text-gray-600 dark:text-gray-400">Focus:</strong> <span className="text-gray-800 dark:text-gray-200">{selected.summaryOptions.focus}</span></div>}
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Generated Summary:</h4>
                    <div className="max-h-[50vh] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {selected?.summary}
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                      type="button"
                      onClick={() => handleCopy(selected.summary)}
                      className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
                      disabled={!!copySuccess}
                    >
                      <FaClipboard className="mr-2 h-4 w-4" />
                      {copySuccess || 'Copy Summary'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Change Password Modal (Refined) */}
      <Transition
        appear
        show={pwdModalOpen}
        as={Fragment}
      >
        <Dialog
          as="div"
          className="relative z-50" // Changed from fixed inset-0 to relative for better stacking context
          onClose={() => !pwdLoading && setPwdModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="
                  w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all
                ">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
                  >
                    Change Password
                  </Dialog.Title>
                  <div className="mt-4 space-y-4">
                    {/* pwdError and pwdSuccess handled by global toast */}
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        value={pwdForm.currentPassword}
                        onChange={(e) =>
                          setPwdForm((f) => ({
                            ...f,
                            currentPassword:
                              e.target.value,
                          }))
                        }
                        className="
                          w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
                          dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200
                          focus:ring-blue-500 focus:border-blue-500 outline-none
                        "
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        value={pwdForm.newPassword}
                        onChange={(e) =>
                          setPwdForm((f) => ({
                            ...f,
                            newPassword: e.target.value,
                          }))
                        }
                        className="
                          w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
                          dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200
                          focus:ring-blue-500 focus:border-blue-500 outline-none
                        "
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={pwdForm.confirmPassword}
                        onChange={(e) =>
                          setPwdForm((f) => ({
                            ...f,
                            confirmPassword:
                              e.target.value,
                          }))
                        }
                        className="
                          w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
                          dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200
                          focus:ring-blue-500 focus:border-blue-500 outline-none
                        "
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                      type="button"
                      onClick={() =>
                        !pwdLoading &&
                        setPwdModalOpen(false)
                      }
                      disabled={pwdLoading}
                      className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handlePwdChange}
                      disabled={pwdLoading}
                      className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
                    >
                      {pwdLoading && (
                        <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                      )}
                      Change
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Global Toast Notification (from HistoryPage) */}
      <Transition
        show={!!toastMessage.text}
        as={Fragment}
        enter="transition ease-out duration-300 transform"
        enterFrom="opacity-0 translate-y-10 sm:translate-y-0 sm:scale-95"
        enterTo="opacity-100 translate-y-0 sm:scale-100"
        leave="transition ease-in duration-200 transform"
        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
        leaveTo="opacity-0 translate-y-10 sm:translate-y-0 sm:scale-95"
      >
        <div
          className={`fixed bottom-6 right-6 z-[100] flex items-center space-x-3 px-5 py-3 rounded-xl shadow-2xl text-white
            ${toastMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
        >
          {toastMessage.type === 'success' ? <FaCheckCircle className="h-6 w-6" /> : <FaExclamationTriangle className="h-6 w-6" />}
          <span className="font-medium">{toastMessage.text}</span>
          <button onClick={() => setToastMessage({ type: '', text: '' })} className="opacity-80 hover:opacity-100 text-2xl leading-none">&times;</button>
        </div>
      </Transition>
    </div>
  );
} 