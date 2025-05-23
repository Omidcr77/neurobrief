import React, { useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import api           from '../api';

export default function DashboardPage() {
  const [profile, setProfile]     = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // ── Edit Profile state ──
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData]   = useState({ name: '', email: '' });
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    // Load profile + summaries
    Promise.all([
      api.get('/auth/profile'),
      api.get('/summaries')
    ])
      .then(([pRes, sRes]) => {
        setProfile(pRes.data);
        setSummaries(sRes.data);
      })
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  // Seed form when entering edit mode
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
      // PUT to /auth/profile
      const { data } = await api.put('/auth/profile', formData);
      setProfile(data);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
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
      {/* Profile */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">My Profile</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Edit Profile
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1 rounded bg-green-500 text-white disabled:opacity-50"
              >
                {saving
                  ? <FaSpinner className="inline-block animate-spin mr-1" />
                  : 'Save'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-1 rounded bg-gray-300 dark:bg-gray-600 text-gray-800"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <div className="space-y-2">
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role:</strong> {profile.role}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {saveError && (
              <div className="text-red-600 dark:text-red-400">{saveError}</div>
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

      {/* Summaries */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">My Summaries</h2>
        {summaries.length === 0 ? (
          <p>No summaries yet. Head to Summarize!</p>
        ) : (
          <ul className="space-y-4">
            {summaries.map(item => (
              <li
                key={item._id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(item.createdAt).toLocaleString()} • {item.inputType.toUpperCase()}
                  </span>
                  <button
                    onClick={() => window.alert(item.summary)}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View
                  </button>
                </div>
                <p className="text-gray-800 dark:text-gray-200 line-clamp-3">
                  {item.summary}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
