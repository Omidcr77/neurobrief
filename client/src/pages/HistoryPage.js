// src/pages/HistoryPage.jsx
import React, { useState, useEffect, Fragment } from 'react';
import {
  FaSpinner,
  FaTrash,
  FaFileAlt,
  FaFilePdf,
  FaEye,
  FaClipboard
} from 'react-icons/fa';
import { Dialog, Transition } from '@headlessui/react';
import { jsPDF } from 'jspdf';
import api from '../api';

export default function HistoryPage() {
  const [summaries, setSummaries] = useState([]);
  const [selected, setSelected]   = useState(null);
  const [toDelete, setToDelete]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [copyMsg, setCopyMsg]     = useState('');

  useEffect(() => {
    api.get('/summaries')
      .then(res => setSummaries(res.data))
      .catch(err => {
        console.error('Could not load history:', err);
        alert('Failed to load history.');
      })
      .finally(() => setLoading(false));
  }, []);

  // hard delete once confirmed
  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await api.delete(`/summaries/${toDelete._id}`);
      setSummaries(s => s.filter(x => x._id !== toDelete._id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete.');
    } finally {
      setToDelete(null);
    }
  };

  const downloadTxt = item => {
    const blob = new Blob([item.summary], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `summary-${item._id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = item => {
    const doc = new jsPDF();
    const margin = 10;
    let y = margin;
    doc.setFontSize(12);
    item.summary.split('\n').forEach(line => {
      doc.text(line, margin, y);
      y += 7;
      if (y > 280) {
        doc.addPage();
        y = margin;
      }
    });
    doc.save(`summary-${item._id}.pdf`);
  };

  const handleCopy = text => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyMsg('Copied!');
      setTimeout(() => setCopyMsg(''), 2000);
    });
  };

  if (loading) {
    return (
      <div className="pt-16 flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-2xl text-gray-600 dark:text-gray-400" />
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="pt-16 flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
        <p className="text-gray-700 dark:text-gray-300 text-xl mb-4">No summaries yet.</p>
        <a
          href="/summarize"
          className="px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Create your first summary
        </a>
      </div>
    );
  }

  return (
    <section className="pt-16 pb-12 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Your History ({summaries.length})
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map(item => (
            <div
              key={item._id}
              className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow hover:shadow-lg transition-transform transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                  <span className="inline-block mt-1 text-xs uppercase text-gray-600 dark:text-gray-500">
                    {item.inputType}
                  </span>
                </div>
                <div className="flex space-x-3 text-gray-500 dark:text-gray-400">
                  <button onClick={() => setSelected(item)} title="View">
                    <FaEye />
                  </button>
                  <button onClick={() => downloadTxt(item)} title="Download TXT">
                    <FaFileAlt />
                  </button>
                  <button onClick={() => downloadPdf(item)} title="Download PDF">
                    <FaFilePdf />
                  </button>
                  {/* now opens modal instead of instant delete */}
                  <button
                    onClick={() => setToDelete(item)}
                    title="Delete"
                  >
                    <FaTrash className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                {item.summary}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* View Modal (unchanged) */}
      <Transition appear show={!!selected} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={() => setSelected(null)}>
          <div className="min-h-screen px-4 text-center bg-black bg-opacity-40">
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-2xl p-6 my-8 overflow-auto text-left align-middle bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium text-gray-900 dark:text-gray-100"
                >
                  Summary Details
                </Dialog.Title>
                <div className="mt-4 space-y-4 text-gray-700 dark:text-gray-300 text-sm">
                  <p><strong>Type:</strong> {selected?.inputType}</p>
                  <p><strong>Date:</strong>{' '}
                    {new Date(selected?.createdAt).toLocaleString()}
                  </p>
                  <div>
                    <strong>Original:</strong>
                    <pre className="mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs whitespace-pre-wrap max-h-32 overflow-auto">
                      {selected?.input}
                    </pre>
                  </div>
                  <div>
                    <strong>Summary:</strong>
                    <pre className="mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm whitespace-pre-wrap max-h-64 overflow-auto">
                      {selected?.summary}
                    </pre>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => handleCopy(selected.summary)}
                    className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    <FaClipboard className="mr-2" />
                    {copyMsg || 'Copy'}
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="inline-flex items-center px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={!!toDelete} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={() => setToDelete(null)}>
          <div className="min-h-screen px-4 text-center bg-black bg-opacity-40">
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium text-gray-900 dark:text-gray-100"
                >
                  Confirm Deletion
                </Dialog.Title>
                <div className="mt-4 text-gray-700 dark:text-gray-300">
                  Are you sure you want to permanently delete this summary?
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setToDelete(null)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </section>
  );
}
