// src/pages/AnalyticsPage.jsx
import React, { useEffect, useState } from 'react';
import { FaSpinner }                  from 'react-icons/fa';
import api                            from '../api';

export default function AnalyticsPage() {
  const [userAct, setUserAct]      = useState([]);
  const [summaryTrends, setTrends] = useState([]);
  const [loading, setLoading]      = useState(true);
  const [error, setError]          = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/admin/reports/user-activity'),
      api.get('/admin/reports/summary-trends'),
    ])
      .then(([ua, st]) => {
        setUserAct(ua.data.dailyRegistrations);
        setTrends(st.data.trends);
      })
      .catch(err => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) return (
    <div className="p-6 text-red-600 dark:text-red-400">{error}</div>
  );
  if (loading) return (
    <div className="flex items-center justify-center p-6 text-gray-700 dark:text-gray-300">
      <FaSpinner className="animate-spin mr-2"/> Loading analytics…
    </div>
  );

  return (
    <div className="p-6 space-y-8 dark:bg-gray-900 dark:text-gray-200 min-h-screen">
      <h2 className="text-2xl font-bold">Advanced Analytics</h2>

      {/* Daily Registrations Table */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg overflow-auto">
        <h3 className="text-lg font-semibold mb-4">Daily Registrations (Last 7 Days)</h3>
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="border px-4 py-2 text-left">Date</th>
              <th className="border px-4 py-2 text-right">Registrations</th>
            </tr>
          </thead>
          <tbody>
            {userAct.map(({ _id: date, count }) => (
              <tr key={date} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
                <td className="border px-4 py-2">{date}</td>
                <td className="border px-4 py-2 text-right">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Summary Trends Table */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg overflow-auto">
        <h3 className="text-lg font-semibold mb-4">Summary Trends (Last 7 Days)</h3>
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Length</th>
              <th className="border px-4 py-2">Style</th>
              <th className="border px-4 py-2 text-right">Count</th>
            </tr>
          </thead>
          <tbody>
            {summaryTrends.map(({ _id: { date, length, style }, count }) => (
              <tr key={`${date}-${length}-${style}`} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
                <td className="border px-4 py-2">{date}</td>
                <td className="border px-4 py-2">{length}</td>
                <td className="border px-4 py-2">{style}</td>
                <td className="border px-4 py-2 text-right">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Export Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => window.open('/api/admin/reports/export/users', '_blank')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Download Users CSV
        </button>
        <button
          onClick={() => window.open('/api/admin/reports/export/summaries', '_blank')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Download Summaries CSV
        </button>
      </div>
    </div>
  );
}
