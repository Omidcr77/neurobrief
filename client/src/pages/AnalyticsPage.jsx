// src/pages/AnalyticsPage.jsx
import React, { useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import api from '../api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
        setUserAct(
          ua.data.dailyRegistrations.map(({ _id: date, count }) => ({ date, count }))
        );
        setTrends(
          st.data.trends.map(({ _id: { date, length }, count }) => ({
            date,
            length,
            count
          }))
        );
      })
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.message || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const downloadCsv = async (endpoint, filename) => {
    try {
      const res  = await api.get(endpoint, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href        = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error downloading CSV');
    }
  };

  if (error) return (
    <div className="p-6 text-red-600 dark:text-red-400">{error}</div>
  );
  if (loading) return (
    <div className="flex items-center justify-center p-6 text-gray-700 dark:text-gray-300">
      <FaSpinner className="animate-spin mr-2"/> Loading analytics…
    </div>
  );

  // Chart.js configurations
  const commonScales = {
    x: {
      ticks: { color: '#9CA3AF' },
      grid: { color: '#374151' }
    },
    y: {
      ticks: { color: '#9CA3AF' },
      grid: { color: '#374151' }
    }
  };

  const regData = {
    labels: userAct.map(d => d.date),
    datasets: [{
      label: 'Registrations',
      data: userAct.map(d => d.count),
      borderColor: '#6366F1',
      backgroundColor: 'rgba(99,102,241,0.2)',
      tension: 0.4,
      fill: true,
      pointRadius: 2,
      borderWidth: 2,
    }]
  };
  const regOpts = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#E5E7EB' }, 
        position: 'top'
      },
      title: {
        display: true,
        text: 'Daily Registrations',
        color: '#F3F4F6',
        font: { size: 18 }
      },
      subtitle: {
        display: true,
        text: '(Last 7 Days)',
        color: '#9CA3AF',
        font: { size: 12 }
      }
    },
    scales: commonScales,
    elements: {
      line: { borderJoinStyle: 'round' },
    }
  };

  const sumData = {
    labels: summaryTrends.map(d => d.date),
    datasets: [{
      label: 'Summaries',
      data: summaryTrends.map(d => d.count),
      backgroundColor: '#10B981',
      borderRadius: 6,
      barThickness: 'flex',
    }]
  };
  const sumOpts = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#E5E7EB' },
        position: 'top'
      },
      title: {
        display: true,
        text: 'Summaries by Length',
        color: '#F3F4F6',
        font: { size: 18 }
      },
      subtitle: {
        display: true,
        text: '(Last 7 Days)',
        color: '#9CA3AF',
        font: { size: 12 }
      }
    },
    scales: commonScales
  };

  return (
    <div className="p-6 space-y-8 dark:bg-gray-900 dark:text-gray-200 min-h-screen">
      <h2 className="text-3xl font-bold text-indigo-400">Advanced Analytics</h2>

      {/* Line Chart Card */}
      <div className="bg-gray-800 p-4 rounded-xl shadow-lg max-w-3xl mx-auto">
        <div className="w-full h-64">
          <Line data={regData} options={regOpts} />
        </div>
      </div>

      {/* Bar Chart Card */}
      <div className="bg-gray-800 p-4 rounded-xl shadow-lg max-w-3xl mx-auto">
        <div className="w-full h-64">
          <Bar data={sumData} options={sumOpts} />
        </div>
      </div>

      {/* Tables */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg overflow-auto">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Registrations</h3>
          <table className="w-full border-collapse text-gray-300">
            <thead className="bg-gray-700">
              <tr>
                <th className="border px-3 py-1 text-left text-sm">Date</th>
                <th className="border px-3 py-1 text-right text-sm">Count</th>
              </tr>
            </thead>
            <tbody>
              {userAct.map(({ date, count }) => (
                <tr key={date} className="odd:bg-gray-800 even:bg-gray-700">
                  <td className="border px-3 py-1 text-sm">{date}</td>
                  <td className="border px-3 py-1 text-right text-sm">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg overflow-auto">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Summaries</h3>
          <table className="w-full border-collapse text-gray-300">
            <thead className="bg-gray-700">
              <tr>
                <th className="border px-3 py-1 text-left text-sm">Date</th>
                <th className="border px-3 py-1 text-left text-sm">Length</th>
                <th className="border px-3 py-1 text-right text-sm">Count</th>
              </tr>
            </thead>
            <tbody>
              {summaryTrends.map(({ date, length, count }) => (
                <tr key={`${date}-${length}`} className="odd:bg-gray-800 even:bg-gray-700">
                  <td className="border px-3 py-1 text-sm">{date}</td>
                  <td className="border px-3 py-1 text-sm">{length}</td>
                  <td className="border px-3 py-1 text-right text-sm">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Export Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => downloadCsv('/admin/reports/export/users', 'users.csv')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
        >
          Download Users CSV
        </button>
        <button
          onClick={() => downloadCsv('/admin/reports/export/summaries', 'summaries.csv')}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
        >
          Download Summaries CSV
        </button>
      </div>
    </div>
  );
}
