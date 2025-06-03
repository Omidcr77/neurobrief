// src/pages/HistoryPage.jsx
import React, { useState, useEffect, Fragment, useCallback } from "react";
import {
  FaSpinner,
  FaTrash,
  FaFileAlt,
  FaFilePdf,
  FaEye,
  FaClipboard,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaHistory,
  FaFilter,
} from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../api";

export default function HistoryPage() {
  const [summaries, setSummaries] = useState([]);
  const [filteredSummaries, setFilteredSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [summaryToDelete, setSummaryToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [downloadingId, setDownloadingId] = useState(null);

  // Format summary length
  const formatLength = useCallback((length) => {
    if (!length) return "medium";
    return length === "long" ? "detailed" : length;
  }, []);

  // Fetch history with error handling
  const fetchSummaries = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/summaries");
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setSummaries(sorted);
      setFilteredSummaries(sorted);
    } catch (err) {
      console.error("Could not load history:", err);
      setToastMessage({
        type: "error",
        text: "Failed to load history. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  // Auto-hide toast message
  useEffect(() => {
    if (toastMessage.text) {
      const timer = setTimeout(
        () => setToastMessage({ type: "", text: "" }),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Filter and search functionality
  useEffect(() => {
    let result = [...summaries];

    // Apply type filter
    if (filterType !== "all") {
      result = result.filter((item) => item.inputType === filterType);
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          (item.summary && item.summary.toLowerCase().includes(term)) ||
          (item.summaryOptions?.focus &&
            item.summaryOptions.focus.toLowerCase().includes(term)) ||
          (item.input && item.input.toLowerCase().includes(term)) ||
          (item.inputFileName &&
            item.inputFileName.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    if (sortOption === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    setFilteredSummaries(result);
  }, [summaries, searchTerm, filterType, sortOption]);

  // Delete summary
  const handleConfirmDelete = async () => {
    if (!summaryToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/summaries/${summaryToDelete._id}`);
      setSummaries((prev) =>
        prev.filter((s) => s._id !== summaryToDelete._id)
      );
      setToastMessage({
        type: "success",
        text: "Summary deleted successfully!",
      });
    } catch (err) {
      console.error("Delete failed:", err);
      setToastMessage({
        type: "error",
        text: "Failed to delete summary. Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setSummaryToDelete(null);
    }
  };

  // Download helpers
  const downloadFile = useCallback((content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const downloadTxt = useCallback(
    async (item) => {
      try {
        setDownloadingId(item._id);
        downloadFile(
          item.summary,
          `NeuroBrief_Summary_${item._id.slice(-6)}.txt`,
          "text/plain;charset=utf-8"
        );
        setToastMessage({
          type: "success",
          text: "Text download started!",
        });
      } catch (error) {
        console.error("Text download failed:", error);
        setToastMessage({
          type: "error",
          text: "Failed to download text. Please try again.",
        });
      } finally {
        setTimeout(() => setDownloadingId(null), 1000);
      }
    },
    [downloadFile]
  );

const downloadPdf = useCallback(
  async (item) => {
    try {
      // Set a loading state so the UI can show a spinner on this item
      setDownloadingId(item._id);

      // Create a new jsPDF instance
      const doc = new jsPDF();
      const margin = 15;
      let y = margin;

      // 1) Document header
      doc.setFontSize(20);
      doc.setTextColor(41, 128, 185);
      doc.text("NeuroBrief Summary", margin, y);
      y += 12;

      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(
        `Generated: ${new Date(item.createdAt).toLocaleString()}`,
        margin,
        y
      );
      y += 8;

      // 2) Metadata section (Type, Summary Type, Length, etc.)
      const metadata = [
        { label: "Type", value: item.inputType.toUpperCase() },
        {
          label: "Summary Type",
          value: item.summaryOptions?.type || "general",
        },
        {
          label: "Length",
          value: formatLength(item.summaryOptions?.length),
        },
      ];

      if (item.summaryOptions?.focus) {
        metadata.push({ label: "Focus", value: item.summaryOptions.focus });
      }

      if (item.input && item.inputType !== "text") {
        const sourceType = item.inputType === "pdf" ? "File" : "Source";
        metadata.push({
          label: sourceType,
          value: item.inputFileName || item.input,
        });
      }

      // 3) Render the metadata table using autoTable
      autoTable(doc, {
        startY: y,
        head: [["Attribute", "Value"]],
        body: metadata.map((m) => [m.label, m.value]),
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: { fontSize: 10, cellPadding: 3 },
        margin: { left: margin, right: margin },
      });

      // After autoTable finishes, grab the final Y position
      y = doc.lastAutoTable.finalY + 12;

      // 4) Summary content header
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text("Summary Content", margin, y);
      y += 10;

      // 5) Split and render summary text
      doc.setFontSize(12);
      doc.setTextColor(40);
      const splitSummary = doc.splitTextToSize(
        item.summary,
        doc.internal.pageSize.width - margin * 2
      );
      doc.text(splitSummary, margin, y);

      // 6) Trigger download
      doc.save(`NeuroBrief_Summary_${item._id.slice(-6)}.pdf`);

      // Optional: show a success toast/notification
      setToastMessage({
        type: "success",
        text: "PDF download started!",
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
      setToastMessage({
        type: "error",
        text: "Failed to generate PDF. Please try again.",
      });
    } finally {
      // Clear loading state after a short delay so the spinner disappears
      setTimeout(() => setDownloadingId(null), 1000);
    }
  },
  [formatLength]
);

  // Copy to clipboard
  const handleCopyToClipboard = useCallback((text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setToastMessage({
          type: "success",
          text: "Summary copied to clipboard!",
        });
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        setToastMessage({
          type: "error",
          text: "Failed to copy. Please try again.",
        });
      });
  }, []);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setSortOption("newest");
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-4">
        <FaSpinner className="animate-spin text-5xl text-blue-600 dark:text-blue-400 mb-4" />
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Loading your summary history...
        </p>
      </div>
    );
  }

  // Empty State
  if (!summaries.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-6 text-center">
        <FaInfoCircle className="text-6xl text-blue-500 dark:text-blue-400 mb-6" />
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          No Summaries Yet
        </h2>
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

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Your Summary{" "}
                <span className="text-blue-600 dark:text-blue-400">History</span>
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                Review, manage, and download your past summaries
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-lg">
              {filteredSummaries.length} of {summaries.length} item
              {summaries.length === 1 ? "" : "s"} shown
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search input */}
              <div className="md:col-span-2">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Search summaries
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by content, focus, or source..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow hover:shadow-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Type filter */}
              <div>
                <label
                  htmlFor="type-filter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Filter by type
                </label>
                <select
                  id="type-filter"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow hover:shadow-sm"
                >
                  <option value="all">All Types</option>
                  <option value="text">Text</option>
                  <option value="pdf">PDF</option>
                  <option value="url">URL</option>
                </select>
              </div>

              {/* Sort option */}
              <div>
                <label
                  htmlFor="sort"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Sort by
                </label>
                <select
                  id="sort"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow hover:shadow-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Clear filters */}
            {(searchTerm || filterType !== "all" || sortOption !== "newest") && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm hover:shadow-md"
                >
                  <FaTimes className="mr-1.5 h-4 w-4" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Summary Cards Grid */}
        <div className="grid gap-6 md:gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredSummaries.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="p-5 sm:p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        item.inputType === "text"
                          ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200"
                          : item.inputType === "pdf"
                          ? "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200"
                      } transition-colors`}
                  >
                    {item.inputType && typeof item.inputType === "string"
                      ? item.inputType.toUpperCase()
                      : ""}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <h3
                  className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 truncate"
                  title={
                    item.summaryOptions?.focus ||
                    `Summary (${formatLength(item.summaryOptions?.length)})`
                  }
                >
                  {item.summaryOptions?.focus
                    ? `Focus: ${item.summaryOptions.focus}`
                    : `Summary (${formatLength(item.summaryOptions?.length)})`}
                </h3>

                {item.input && item.inputType !== "text" && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
                    {item.inputFileName || item.input}
                  </p>
                )}

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
                    aria-label="View summary details"
                  >
                    <FaEye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => downloadTxt(item)}
                    title="Download .txt"
                    className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    disabled={downloadingId === item._id}
                    aria-label="Download as text file"
                  >
                    {downloadingId === item._id ? (
                      <FaSpinner className="h-5 w-5 animate-spin" />
                    ) : (
                      <FaFileAlt className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => downloadPdf(item)}
                    title="Download .pdf"
                    className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    disabled={downloadingId === item._id}
                    aria-label="Download as PDF"
                  >
                    {downloadingId === item._id ? (
                      <FaSpinner className="h-5 w-5 animate-spin" />
                    ) : (
                      <FaFilePdf className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => setSummaryToDelete(item)}
                    title="Delete Summary"
                    className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-800/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    aria-label="Delete summary"
                  >
                    <FaTrash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty filtered state */}
        {!filteredSummaries.length && summaries.length > 0 && (
          <div className="text-center py-16">
            <FaFilter className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
              No summaries match your filters
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 transition-colors shadow-sm"
            >
              <FaHistory className="mr-2 h-4 w-4" />
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* View Summary Modal */}
      <Transition appear show={!!selectedSummary} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setSelectedSummary(null)}
        >
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
                  <div className="flex justify-between items-start">
                    <Dialog.Title
                      as="h3"
                      className="text-xl sm:text-2xl font-semibold leading-tight text-gray-900 dark:text-white mb-1"
                    >
                      Summary Details
                    </Dialog.Title>
                    <button
                      onClick={() => setSelectedSummary(null)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                      aria-label="Close modal"
                    >
                      <FaTimes className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Type:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {selectedSummary?.inputType?.toUpperCase()}
                    </span>{" "}
                    | Date:{" "}
                    {new Date(selectedSummary?.createdAt).toLocaleString()}
                  </p>

                  {selectedSummary?.input &&
                    (selectedSummary.inputType === "url" ||
                      selectedSummary.inputType === "pdf") && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Original Source:
                        </h4>
                        <p className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md text-xs text-gray-600 dark:text-gray-300 break-all">
                          {selectedSummary?.inputFileName ||
                            selectedSummary?.input}
                        </p>
                      </div>
                    )}

                  {selectedSummary?.summaryOptions && (
                    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          SUMMARY OPTIONS
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">
                              Type:
                            </span>
                            <span className="font-medium text-gray-800 dark:text-gray-100 capitalize">
                              {selectedSummary.summaryOptions.type}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">
                              Length:
                            </span>
                            <span className="font-medium text-gray-800 dark:text-gray-100 capitalize">
                              {formatLength(selectedSummary.summaryOptions.length)}
                            </span>
                          </div>
                          {selectedSummary.summaryOptions.focus && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">
                                Focus:
                              </span>
                              <span className="font-medium text-gray-800 dark:text-gray-100">
                                {selectedSummary.summaryOptions.focus}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          ACTIONS
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => downloadTxt(selectedSummary)}
                            className="flex items-center px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors shadow-sm hover:shadow-md"
                            disabled={downloadingId === selectedSummary._id}
                          >
                            {downloadingId === selectedSummary._id ? (
                              <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <FaFileAlt className="mr-2 h-4 w-4" />
                            )}
                            TXT
                          </button>
                          <button
                            onClick={() => downloadPdf(selectedSummary)}
                            className="flex items-center px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors shadow-sm hover:shadow-md"
                            disabled={downloadingId === selectedSummary._id}
                          >
                            {downloadingId === selectedSummary._id ? (
                              <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <FaFilePdf className="mr-2 h-4 w-4" />
                            )}
                            PDF
                          </button>
                          <button
                            onClick={() =>
                              handleCopyToClipboard(selectedSummary.summary)
                            }
                            className="flex items-center px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors shadow-sm hover:shadow-md"
                          >
                            <FaClipboard className="mr-2 h-4 w-4" />
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Generated Summary:
                    </h4>
                    <div className="max-h-[50vh] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed shadow-inner">
                      {selectedSummary?.summary}
                    </div>
                  </div>

                  {/* Footer with Close + Copy */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() =>
                        handleCopyToClipboard(selectedSummary.summary)
                      }
                      className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
                    >
                      <FaClipboard className="mr-2 h-4 w-4" />
                      Copy Summary
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSummary(null)}
                      className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800 transition-colors"
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
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => !isDeleting && setSummaryToDelete(null)}
        >
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
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900 dark:text-white flex items-center"
                  >
                    <FaExclamationTriangle className="text-red-500 mr-3 h-6 w-6" />
                    Confirm Deletion
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Are you sure you want to permanently delete this summary?
                      This action cannot be undone.
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
                      {isDeleting ? (
                        <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                      ) : (
                        <FaTrash className="mr-2 h-4 w-4" />
                      )}
                      {isDeleting ? "Deleting..." : "Delete"}
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
            ${
              toastMessage.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
        >
          {toastMessage.type === "success" ? (
            <FaCheckCircle className="h-6 w-6" />
          ) : (
            <FaExclamationTriangle className="h-6 w-6" />
          )}
          <span className="font-medium">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage({ type: "", text: "" })}
            className="opacity-80 hover:opacity-100 text-2xl leading-none"
            aria-label="Dismiss notification"
          >
            &times;
          </button>
        </div>
      </Transition>
    </section>
  );
}
