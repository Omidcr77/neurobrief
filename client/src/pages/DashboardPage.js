// src/pages/DashboardPage.jsx
import React, { useEffect, useState, Fragment } from 'react';
import { FaSpinner, FaEdit, FaSave, FaTimes, FaClipboard } from 'react-icons/fa';
import { Dialog, Transition } from '@headlessui/react';
import api from '../api';

export default function DashboardPage() {
  const [profile, setProfile]       = useState(null);
  const [summaries, setSummaries]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // Edit Profile
  const [isEditing, setIsEditing]   = useState(false);
  const [formData, setFormData]     = useState({ name: '', email: '' });
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState('');

  // View Summary Modal
  const [selected, setSelected]     = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    Promise.all([api.get('/auth/profile'), api.get('/summaries')])
      .then(([pRes, sRes]) => {
        setProfile(pRes.data);
        setSummaries(sRes.data);
      })
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  // fill form when entering edit mode
  useEffect(() => {
    if (profile && isEditing) {
      setFormData({ name: profile.name, email: profile.email });
      setSaveError('');
    }
  }, [isEditing, profile]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const { data } = await api.put('/auth/profile', formData);
      setProfile(data);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = text => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center p-6 dark:text-gray-300">
      <FaSpinner className="animate-spin mr-2" /> Loading dashboard…
    </div>
  );
  if (error) return (
    <div className="p-6 text-red-600 dark:text-red-400">{error}</div>
  );

  return (
    <div className="p-6 space-y-8 dark:bg-gray-900 dark:text-gray-200 min-h-screen">

      {/* Profile Section */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">My Profile</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              <FaEdit className="inline-block mr-1" /> Edit
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {saving
                  ? <FaSpinner className="inline-block animate-spin mr-1" />
                  : <FaSave className="inline-block mr-1" />}
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p><span className="font-medium">Name:</span> {profile.name}</p>
            <p><span className="font-medium">Email:</span> {profile.email}</p>
            <p><span className="font-medium">Role:</span> {profile.role}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {saveError && (
              <p className="text-red-600 dark:text-red-400">{saveError}</p>
            )}
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        )}
      </section>

      {/* Summaries Section */}
      <section className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Summaries</h2>
          <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
            {summaries.length} {summaries.length === 1 ? 'Summary' : 'Summaries'}
          </span>
        </div>

        {summaries.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No summaries yet. Head over to <a href="/summarize" className="text-indigo-500 hover:underline">Summarize</a>!
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {summaries.map(item => (
              <article
                key={item._id}
                className="relative bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-xl transition"
              >
                {/* Type Badge */}
                <span className="absolute top-4 right-4 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full dark:bg-indigo-800 dark:text-indigo-100">
                  {item.inputType.toUpperCase()}
                </span>

                <h3 className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                </h3>
                <p className="mt-1 text-gray-800 dark:text-gray-200 line-clamp-3">
                  {item.summary}
                </p>

                <button
                  onClick={() => setSelected(item)}
                  className="mt-4 text-indigo-600 hover:underline inline-flex items-center text-sm"
                >
                  View
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* View Summary Modal */}
      <Transition appear show={!!selected} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={() => setSelected(null)}>
          <div className="min-h-screen px-4 text-center bg-black bg-opacity-50">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
              leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0"/>
            </Transition.Child>

            {/* Trick to center */}
            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                  Full Summary
                </Dialog.Title>
                <div className="mt-4">
                  <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                    {selected?.summary}
                  </p>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={() => handleCopy(selected.summary)}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    <FaClipboard className="mr-1" /> {copySuccess ? copySuccess : 'Copy'}
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium bg-gray-300 dark:bg-gray-600 text-gray-800 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                  >
                    <FaTimes className="mr-1" /> Close
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
