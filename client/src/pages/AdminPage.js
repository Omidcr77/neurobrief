// src/pages/AdminPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { FaSpinner, FaUsers, FaFileAlt, FaChartPie } from 'react-icons/fa';
import api from '../api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminPage() {
  const [metrics, setMetrics]           = useState(null);
  const [userAct, setUserAct]           = useState([]);
  const [summaryTrends, setSummaryTrends] = useState([]);
  const [error, setError]               = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/admin/metrics'),
      api.get('/admin/reports/user-activity'),
      api.get('/admin/reports/summary-trends'),
    ])
    .then(([mRes, uaRes, stRes]) => {
      setMetrics(mRes.data);
      setUserAct(
        uaRes.data.dailyRegistrations.map(({ _id: date, count }) => ({ date, count }))
      );
      setSummaryTrends(
        stRes.data.trends.map(({ _id: { date, length }, count }) => ({
          date,
          length,
          count
        }))
      );
    })
    .catch(err => {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    });
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
    <div className="p-6 text-red-600 dark:text-red-400">Error: {error}</div>
  );
  if (!metrics) return (
    <div className="flex items-center justify-center p-6 text-gray-700 dark:text-gray-300">
      <FaSpinner className="animate-spin mr-2"/> Loading admin dashboard…
    </div>
  );

  // --- Common chart scales/colors ---
  const commonScales = {
    x: { ticks: { color: '#9CA3AF' }, grid: { color: '#374151' } },
    y: { ticks: { color: '#9CA3AF' }, grid: { color: '#374151' } },
  };
  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#E5E7EB' } },
      title: { display: false },
    },
    scales: commonScales,
  };

  // --- Pie: summaries by input type ---
  const typeData = {
    labels: ['Text','PDF','URL'],
    datasets: [{
      data: [
        metrics.summariesByType.text,
        metrics.summariesByType.pdf,
        metrics.summariesByType.url
      ],
      backgroundColor: ['#6366F1','#10B981','#F59E0B'],
      hoverOffset: 8
    }]
  };

  // --- Line: daily summaries ---
  const summaryLineData = {
    labels: metrics.dailySummaryCounts.map(d => d.date),
    datasets: [{
      label: 'Summaries',
      data: metrics.dailySummaryCounts.map(d => d.count),
      borderColor: '#6366F1',
      backgroundColor: 'rgba(99,102,241,0.2)',
      tension: 0.3,
      fill: true,
      pointRadius: 3
    }]
  };

  // --- Line: daily registrations ---
  const regLineData = {
    labels: userAct.map(d => d.date),
    datasets: [{
      label: 'Registrations',
      data: userAct.map(d => d.count),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59,130,246,0.2)',
      tension: 0.3,
      fill: true,
      pointRadius: 3
    }]
  };

  // --- Bar: summary trends by length ---
  const trendsBarData = {
    labels: summaryTrends.map(d => d.date),
    datasets: [{
      label: 'Count',
      data: summaryTrends.map(d => d.count),
      backgroundColor: '#10B981',
      borderRadius: 6,
      barThickness: 'flex',
    }]
  };

  return (
    <div className="p-6 space-y-8 dark:bg-gray-900 dark:text-gray-200 min-h-screen">

      <h2 className="text-3xl font-bold text-indigo-400">Admin Dashboard</h2>

      {/* ─── Top Stats Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <FaUsers className="text-indigo-500 text-3xl mr-4" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
            <p className="text-2xl font-bold">{metrics.userCount}</p>
          </div>
        </div>
        <div className="flex items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <FaFileAlt className="text-green-500 text-3xl mr-4" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Summaries</p>
            <p className="text-2xl font-bold">{metrics.summaryCount}</p>
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="flex items-center mb-4">
            <FaChartPie className="text-yellow-500 text-3xl mr-3" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">By Input Type</p>
          </div>
          <div className="w-full h-48">
            <Pie 
              data={typeData} 
              options={{
                ...chartOptions,
                plugins: { legend: { position:'bottom', labels:{color:'#9CA3AF'} } }
              }} 
            />
          </div>
        </div>
      </div>

      {/* ─── Daily Summaries ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg overflow-hidden">
        <p className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Daily Summaries (Last 7 Days)
        </p>
        <div className="w-full h-64">
          <Line data={summaryLineData} options={chartOptions} />
        </div>
      </div>

      {/* ─── Summaries Table ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg overflow-auto">
        <p className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Daily Summaries Table
        </p>
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

      {/* ─── Daily Registrations ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg overflow-hidden">
        <p className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Daily Registrations (Last 7 Days)
        </p>
        <div className="w-full h-64">
          <Line data={regLineData} options={chartOptions} />
        </div>
      </div>

      {/* ─── Registrations Table ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg overflow-auto">
        <p className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Daily Registrations Table
        </p>
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="border px-4 py-2 text-left">Date</th>
              <th className="border px-4 py-2 text-right">Count</th>
            </tr>
          </thead>
          <tbody>
            {userAct.map(({ date, count }) => (
              <tr key={date} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
                <td className="border px-4 py-2">{date}</td>
                <td className="border px-4 py-2 text-right">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Summary Trends by Length ───────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg overflow-hidden">
        <p className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Summaries by Length (Last 7 Days)
        </p>
        <div className="w-full h-64">
          <Bar data={trendsBarData} options={chartOptions} />
        </div>
      </div>

      {/* ─── Summary Trends Table ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg overflow-auto">
        <p className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Summary Trends Table
        </p>
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Length</th>
              <th className="border px-4 py-2 text-right">Count</th>
            </tr>
          </thead>
          <tbody>
            {summaryTrends.map(({ date, length, count }) => (
              <tr key={`${date}-${length}`} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
                <td className="border px-4 py-2">{date}</td>
                <td className="border px-4 py-2">{length}</td>
                <td className="border px-4 py-2 text-right">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── CSV Export Buttons ─────────────────────────────────────────── */}
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
