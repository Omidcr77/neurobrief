// src/pages/HistoryPage.js
import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { jsPDF }     from 'jspdf';
import api           from '../api';

export default function HistoryPage() {
  const [summaries, setSummaries] = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    api.get('/summaries')
      .then(res => setSummaries(res.data))
      .catch(err => {
        console.error('Could not load history:', err);
        alert('Failed to load history.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async id => {
    if (!window.confirm('Delete this summary?')) return;
    await api.delete(`/summaries/${id}`);
    setSummaries(list => list.filter(x => x._id !== id));
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
    const lineHeight = 7;
    let cursorY = margin;
    doc.setFontSize(12);

    item.summary.split('\n').forEach(line => {
      const textLines = doc.splitTextToSize(line, 180);
      textLines.forEach(tl => {
        if (cursorY > 280) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(tl, margin, cursorY);
        cursorY += lineHeight;
      });
    });

    doc.save(`summary-${item._id}.pdf`);
  };

  if (loading) {
    return (
      <div className="pt-16 flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
        <FaSpinner className="animate-spin mr-2" /> Loading history…
      </div>
    );
  }

  return (
    <section
      className="
        pt-16 pb-12 min-h-screen
        bg-gradient-to-r from-indigo-50 via-white to-teal-50
        dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
        relative overflow-hidden
      "
    >
      {/* Animated blobs */}
      <div className="
        absolute -top-16 -left-16 w-72 h-72
        bg-indigo-300 opacity-20 mix-blend-multiply blur-3xl
        dark:bg-indigo-700 dark:opacity-10
        animate-blob
      " />
      <div className="
        absolute -bottom-16 -right-16 w-64 h-64
        bg-teal-300 opacity-20 mix-blend-multiply blur-2xl
        dark:bg-teal-700 dark:opacity-10
        animate-blob animation-delay-4000
      " />

      <div className="relative z-10 max-w-3xl mx-auto px-4 space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Your History
        </h2>

        {summaries.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No summaries yet.</p>
        ) : (
          <ul className="space-y-6">
            {summaries.map(item => (
              <li
                key={item._id}
                className="
                  bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg
                  transition-transform hover:-translate-y-1
                "
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                    <span className="ml-2 text-sm uppercase text-gray-500 dark:text-gray-400">
                      • {item.inputType}
                    </span>
                  </div>
                  <div className="space-x-3 text-sm">
                    <button
                      onClick={() => setSelected(item)}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => downloadTxt(item)}
                      className="text-green-600 dark:text-green-400 hover:underline"
                    >
                      TXT
                    </button>
                    <button
                      onClick={() => downloadPdf(item)}
                      className="text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 dark:text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-3">
                <p className="mt-4 text-gray-800 dark:text-gray-100 whitespace-pre-wrap line-clamp-3">
                  {item.summary}
                </p> 
                </p>
              </li>
            ))}
          </ul>
        )}

        {/* Modal */}
        {selected && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-6 overflow-auto"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                Summary Details
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <strong>Type:</strong> {selected.inputType.toUpperCase()}<br/>
                <strong>Date:</strong> {new Date(selected.createdAt).toLocaleString()}
              </p>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Original Input
                </h4>
                <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-700 p-3 rounded max-h-40 overflow-auto text-gray-800 dark:text-gray-200">
                  {selected.input}
                </pre>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Summary
                </h4>
                <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-700 p-3 rounded max-h-64 overflow-auto text-gray-800 dark:text-gray-200">
                  {selected.summary}
                </pre>
              </div>

              <div className="mt-6 text-right">
                <button
                  onClick={() => setSelected(null)}
                  className="
                    px-5 py-2 bg-gray-200 dark:bg-gray-700 
                    text-gray-800 dark:text-gray-200 
                    rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600
                    transition
                  "
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
