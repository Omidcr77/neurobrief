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
import { Transition } from '@headlessui/react';

import { 
  FaSpinner, 
  FaUsers, 
  FaFileAlt, 
  FaChartPie,
  FaDownload,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
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
  const [toastMessage, setToastMessage] = useState({ type: '', text: '' });

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
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load admin data'
      });
    });
  }, []);

  // Auto-hide toast message
  useEffect(() => {
    if (toastMessage.text) {
      const timer = setTimeout(() => setToastMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

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
      
      setToastMessage({
        type: 'success',
        text: `${filename} downloaded successfully!`
      });
    } catch (err) {
      console.error(err);
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error downloading CSV'
      });
    }
  };

  if (!metrics) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900 p-4">
      <FaSpinner className="animate-spin text-5xl text-blue-600 dark:text-blue-400 mb-4" />
      <p className="text-lg text-gray-700 dark:text-gray-300">Loading admin dashboard...</p>
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
    <section className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900 py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <header className="text-center sm:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Admin <span className="text-blue-600 dark:text-blue-400">Dashboard</span>
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Monitor platform metrics and user activity
          </p>
        </header>

        {/* ─── Top Stats Cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <FaUsers className="text-indigo-500 text-3xl mr-4" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold">{metrics.userCount}</p>
            </div>
          </div>
          <div className="flex items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <FaFileAlt className="text-green-500 text-3xl mr-4" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Summaries</p>
              <p className="text-2xl font-bold">{metrics.summaryCount}</p>
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
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

        {/* ─── Charts Grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Summaries Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden">
            <p className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
              Daily Summaries (Last 7 Days)
            </p>
            <div className="w-full h-64">
              <Line data={summaryLineData} options={chartOptions} />
            </div>
          </div>

          {/* Daily Registrations Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden">
            <p className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
              Daily Registrations (Last 7 Days)
            </p>
            <div className="w-full h-64">
              <Line data={regLineData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Summary Trends Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden">
          <p className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Summaries by Length (Last 7 Days)
          </p>
          <div className="w-full h-64">
            <Bar data={trendsBarData} options={chartOptions} />
          </div>
        </div>

        {/* ─── Tables Section ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Summaries Table */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-auto">
            <p className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
              Daily Summaries
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="border px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-tl-lg">Date</th>
                    <th className="border px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-tr-lg">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.dailySummaryCounts.map(({ date, count }) => (
                    <tr key={date} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
                      <td className="border px-4 py-3 text-sm">{date}</td>
                      <td className="border px-4 py-3 text-right text-sm font-medium">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Registrations Table */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-auto">
            <p className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
              Daily Registrations
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="border px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-tl-lg">Date</th>
                    <th className="border px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-tr-lg">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {userAct.map(({ date, count }) => (
                    <tr key={date} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
                      <td className="border px-4 py-3 text-sm">{date}</td>
                      <td className="border px-4 py-3 text-right text-sm font-medium">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary Trends Table */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-auto">
          <p className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Summary Trends
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="border px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-tl-lg">Date</th>
                  <th className="border px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Length</th>
                  <th className="border px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-tr-lg">Count</th>
                </tr>
              </thead>
              <tbody>
                {summaryTrends.map(({ date, length, count }) => (
                  <tr key={`${date}-${length}`} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
                    <td className="border px-4 py-3 text-sm">{date}</td>
                    <td className="border px-4 py-3 text-sm">{length}</td>
                    <td className="border px-4 py-3 text-right text-sm font-medium">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── CSV Export Buttons ─────────────────────────────────────────── */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => downloadCsv('/admin/reports/export/users', 'users.csv')}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all transform hover:scale-[1.03] active:scale-[0.97] duration-200 ease-in-out shadow-md hover:shadow-lg"
          >
            <FaDownload className="mr-2" />
            Download Users CSV
          </button>
          <button
            onClick={() => downloadCsv('/admin/reports/export/summaries', 'summaries.csv')}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 transition-all transform hover:scale-[1.03] active:scale-[0.97] duration-200 ease-in-out shadow-md hover:shadow-lg"
          >
            <FaDownload className="mr-2" />
            Download Summaries CSV
          </button>
        </div>
      </div>

      {/* Global Toast Notification */}
      <Transition
        show={!!toastMessage.text}
        as={React.Fragment}
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
          {toastMessage.type === 'success' ? 
            <FaCheckCircle className="h-6 w-6" /> : 
            <FaExclamationTriangle className="h-6 w-6" />}
          <span className="font-medium">{toastMessage.text}</span>
          <button 
            onClick={() => setToastMessage({ type: '', text: '' })} 
            className="opacity-80 hover:opacity-100 text-2xl leading-none"
          >
            &times;
          </button> 
        </div>
      </Transition>
    </section>
  );
}