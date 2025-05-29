// src/pages/HistoryPage.jsx
import React, { useState, useEffect, Fragment } from 'react';
import {
  FaSpinner,
  FaTrash,
  FaFileAlt, // TXT download
  FaFilePdf, // PDF download
  FaEye,     // View details
  FaClipboard, // Copy
  FaCheckCircle, // Success
  FaExclamationTriangle, // Error/Warning
  FaInfoCircle, // Empty state icon
  FaDownload, // Generic download
} from 'react-icons/fa';
import { Dialog, Transition } from '@headlessui/react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // For better PDF table formatting if needed in future
import api from '../api';

export default function HistoryPage() {
  const [summaries, setSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null); // For view modal
  const [summaryToDelete, setSummaryToDelete] = useState(null); // For delete confirmation
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copyStatus, setCopyStatus] = useState(''); // 'Copied!' or ''
  const [toastMessage, setToastMessage] = useState({ type: '', text: '' }); // { type: 'success'/'error', text: 'Message' }

  // --- Fetch history ---
  useEffect(() => {
    setIsLoading(true);
    api.get('/summaries')
      .then(res => {
        // Sort summaries by date, newest first
        const sortedSummaries = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSummaries(sortedSummaries);
      })
      .catch(err => {
        console.error('Could not load history:', err);
        setToastMessage({ type: 'error', text: 'Failed to load history. Please try again.' });
      })
      .finally(() => setIsLoading(false));
  }, []);

  // --- Auto-hide toast message ---
  useEffect(() => {
    if (toastMessage.text) {
      const timer = setTimeout(() => setToastMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // --- Delete summary ---
  const handleConfirmDelete = async () => {
    if (!summaryToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/summaries/${summaryToDelete._id}`);
      setSummaries(prevSummaries => prevSummaries.filter(s => s._id !== summaryToDelete._id));
      setToastMessage({ type: 'success', text: 'Summary deleted successfully!' });
    } catch (err) {
      console.error('Delete failed:', err);
      setToastMessage({ type: 'error', text: 'Failed to delete summary.' });
    } finally {
      setIsDeleting(false);
      setSummaryToDelete(null); // Close delete modal
    }
  };

  // --- Download helpers ---
  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTxt = item => {
    downloadFile(item.summary, `summary-${item._id}.txt`, 'text/plain;charset=utf-8');
  };

  const downloadPdf = item => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let y = margin;

    doc.setFontSize(18);
    doc.text(`Summary: ${item.inputType}`, margin, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(item.createdAt).toLocaleString()}`, margin, y);
    y += 10;
    
    if (item.input && item.inputType !== 'text') { // Show original input URL/filename
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Original ${item.inputType === 'pdf' ? 'File' : 'Source'}: ${item.inputFileName || item.input}`, margin, y);
        y += 10;
    }
    
    doc.setLineWidth(0.5);
    doc.line(margin, y, doc.internal.pageSize.width - margin, y); // Horizontal line
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(40);
    const splitSummary = doc.splitTextToSize(item.summary, doc.internal.pageSize.width - margin * 2);

    splitSummary.forEach(line => {
      if (y + 10 > pageHeight - margin) { // Check for page break
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 7; // Line height
    });

    doc.save(`NeuroBrief_Summary_${item._id}.pdf`);
  };

  // --- Copy to clipboard ---
  const handleCopyToClipboard = text => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus(''), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      setCopyStatus('Failed to copy');
      setTimeout(() => setCopyStatus(''), 2000);
    });
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900 p-4">
        <FaSpinner className="animate-spin text-5xl text-blue-600 dark:text-blue-400 mb-4" />
        <p className="text-lg text-gray-700 dark:text-gray-300">Loading your summary history...</p>
      </div>
    );
  }

  // --- Empty State ---
  if (!summaries.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900 p-6 text-center">
        <FaInfoCircle className="text-6xl text-blue-500 dark:text-blue-400 mb-6" />
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-3">No Summaries Yet</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          It looks like you haven't created any summaries. <br />
          Start by summarizing text, a PDF, or a URL.
        </p>
        <a
          href="/summarize"
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all transform hover:scale-[1.03] active:scale-[0.97] duration-200 ease-in-out shadow-md hover:shadow-lg"
        >
          Create Your First Summary
        </a>
      </div>
    );
  }

  // --- Main History Page Content ---
  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900 py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center sm:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Your Summary <span className="text-blue-600 dark:text-blue-400">History</span>
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Review, manage, and download your past summaries. ({summaries.length} item{summaries.length === 1 ? '' : 's'})
          </p>
        </header>

        <div className="grid gap-6 md:gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {summaries.map(item => (
            <div
              key={item._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col overflow-hidden"
            >
              <div className="p-5 sm:p-6 flex-grow">
                <div className="flex justify-between items-center mb-3">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full
                    ${item.inputType === 'text' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' :
                      item.inputType === 'pdf' ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100'}`}>
                    {item.inputType.toUpperCase()}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 truncate" title={item.summaryOptions?.focus || 'Summary'}>
                  {item.summaryOptions?.focus ? `Focus: ${item.summaryOptions.focus}` : `Summary (${item.summaryOptions?.length || 'medium'})`}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4 flex-grow">
                  {item.summary}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-end items-center space-x-2">
                  <button
                    onClick={() => setSelectedSummary(item)}
                    title="View Details"
                    className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <FaEye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => downloadTxt(item)}
                    title="Download .txt"
                    className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    <FaFileAlt className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => downloadPdf(item)}
                    title="Download .pdf"
                    className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <FaFilePdf className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSummaryToDelete(item)}
                    title="Delete Summary"
                    className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-700 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <FaTrash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Summary Modal */}
      <Transition appear show={!!selectedSummary} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedSummary(null)}>
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 sm:p-8 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-xl sm:text-2xl font-semibold leading-tight text-gray-900 dark:text-white mb-1">
                    Summary Details
                  </Dialog.Title>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Type: <span className="font-medium text-gray-700 dark:text-gray-300">{selectedSummary?.inputType?.toUpperCase()}</span> | Date: {new Date(selectedSummary?.createdAt).toLocaleString()}
                  </p>

                  {selectedSummary?.input && (selectedSummary.inputType === 'url' || selectedSummary.inputType === 'pdf') && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Original Source:</h4>
                      <p className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md text-xs text-gray-600 dark:text-gray-300 break-all">
                        {selectedSummary?.inputFileName || selectedSummary?.input}
                      </p>
                    </div>
                  )}
                  
                  {selectedSummary?.summaryOptions && (
                    <div className="mb-4 grid grid-cols-2 gap-x-4 text-sm">
                        <div><strong className="text-gray-600 dark:text-gray-400">Type:</strong> <span className="text-gray-800 dark:text-gray-200 capitalize">{selectedSummary.summaryOptions.type}</span></div>
                        <div><strong className="text-gray-600 dark:text-gray-400">Length:</strong> <span className="text-gray-800 dark:text-gray-200 capitalize">{selectedSummary.summaryOptions.length}</span></div>
                        {selectedSummary.summaryOptions.focus && <div><strong className="text-gray-600 dark:text-gray-400">Focus:</strong> <span className="text-gray-800 dark:text-gray-200">{selectedSummary.summaryOptions.focus}</span></div>}
                    </div>
                  )}


                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Generated Summary:</h4>
                    <div className="max-h-[50vh] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {selectedSummary?.summary}
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard(selectedSummary.summary)}
                      className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
                      disabled={!!copyStatus}
                    >
                      <FaClipboard className="mr-2 h-4 w-4" />
                      {copyStatus || 'Copy Summary'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSummary(null)}
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

      {/* Delete Confirmation Modal */}
      <Transition appear show={!!summaryToDelete} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => !isDeleting && setSummaryToDelete(null)}>
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white flex items-center">
                    <FaExclamationTriangle className="text-red-500 mr-3 h-6 w-6" />
                    Confirm Deletion
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Are you sure you want to permanently delete this summary? This action cannot be undone.
                    </p>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                      type="button"
                      onClick={() => setSummaryToDelete(null)}
                      disabled={isDeleting}
                      className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      disabled={isDeleting}
                      className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? <FaSpinner className="animate-spin mr-2 h-4 w-4" /> : <FaTrash className="mr-2 h-4 w-4" />}
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Global Toast Notification */}
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
    </section>
  );
}
