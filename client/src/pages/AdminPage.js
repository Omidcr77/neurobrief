import React, { useEffect, useState } from 'react';
import { FaSpinner }          from 'react-icons/fa';
import api                    from '../api';

export default function AdminPage() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError]     = useState(null);

  useEffect(() => {
    api.get('/admin/metrics')
      .then(res => setMetrics(res.data))
      .catch(err => setError(err.response?.data?.message || err.message));
  }, []);

  if (error) return (
    <div className="p-6 text-red-600 dark:text-red-400">Error: {error}</div>
  );
  if (!metrics) return (
    <div className="flex items-center justify-center p-6 text-gray-700 dark:text-gray-300">
      <FaSpinner className="animate-spin mr-2"/> Loading metrics…
    </div>
  );

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900 dark:text-gray-200 min-h-screen">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>

      {/* Counts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Users',      value: metrics.userCount },
          { label: 'Total Summaries',  value: metrics.summaryCount },
          { label: 'By Input Type',    value: null }
        ].map((item,i) => (
          <div
            key={i}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-2">{item.label}</h3>
            {item.value !== null ? (
              <p className="text-3xl">{item.value}</p>
            ) : (
              <ul className="space-y-1">
                <li>Text: {metrics.summariesByType.text}</li>
                <li>PDF: {metrics.summariesByType.pdf}</li>
                <li>URL: {metrics.summariesByType.url}</li>
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Daily Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg overflow-auto">
        <h3 className="text-lg font-semibold mb-4">Daily Summaries (Last 7 Days)</h3>
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="border px-4 py-2 text-left">Date</th>
              <th className="border px-4 py-2 text-right">Count</th>
            </tr>
          </thead>
          <tbody>
            {metrics.dailySummaryCounts.map(({ date, count }) => (
              <tr key={date} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
                <td className="border px-4 py-2">{date}</td>
                <td className="border px-4 py-2 text-right">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
