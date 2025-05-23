// src/pages/SummarizePage.js
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaSpinner,
  FaFilePdf,
  FaLink,
  FaFont,
  FaPlay,
  FaPause,
  FaStop,
} from 'react-icons/fa';
import api from '../api';

export default function SummarizePage() {
  const location = useLocation();
  const navigate = useNavigate();

  // ─── Welcome toast state ───
  const [showWelcome, setShowWelcome] = useState(false);

  // If we arrived here with state.showWelcome, show the toast once and clear it
  useEffect(() => {
    if (location.state?.showWelcome) {
      setShowWelcome(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Auto-hide after 4s
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  // ─── Summarization state/hooks ───
  const [tab, setTab]         = useState('text');
  const [input, setInput]     = useState('');
  const [file, setFile]       = useState(null);
  const [result, setResult]   = useState('');
  const [loading, setLoading] = useState(false);

  // Advanced options
  const [length, setLength] = useState('medium');
  const [focus,  setFocus]  = useState('');
  const [style,  setStyle]  = useState('abstractive');

  // Text-to-Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused]     = useState(false);
  const utteranceRef = useRef(null);

  // Summarize helper
  const doSummarize = async (endpoint, payload) => {
    setLoading(true);
    setResult('');
    try {
      const { data } = await api.post(endpoint, payload);
      setResult(data.summary);
    } catch (err) {
      alert(`Summarization failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleText = () => {
    if (!input.trim()) return alert('Please paste some text first.');
    doSummarize('/summarize/text', { text: input, length, focus, style });
  };
  const handlePDF = () => {
    if (!file) return alert('Please select a PDF file first.');
    const form = new FormData();
    form.append('file', file);
    form.append('length', length);
    form.append('focus',  focus);
    form.append('style',  style);
    doSummarize('/summarize/pdf', form);
  };
  const handleURL = () => {
    if (!input.trim()) return alert('Please enter a URL first.');
    doSummarize('/summarize/url', { url: input, length, focus, style });
  };

  // TTS handlers
  const handlePlay = () => {
    if (!window.speechSynthesis) {
      return alert('Text-to-speech not supported.');
    }
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }
    if (isSpeaking) return;

    utteranceRef.current = new SpeechSynthesisUtterance(result);
    utteranceRef.current.onend    = () => setIsSpeaking(false);
    utteranceRef.current.onpause  = () => setIsPaused(true);
    utteranceRef.current.onresume = () => setIsPaused(false);

    window.speechSynthesis.speak(utteranceRef.current);
    setIsSpeaking(true);
  };
  const handlePause = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };
  const handleStop = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const tabs = [
    { id: 'text', icon: FaFont,    label: 'Text' },
    { id: 'pdf',  icon: FaFilePdf, label: 'PDF'  },
    { id: 'url',  icon: FaLink,    label: 'URL'  },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4">
      {/* ─── Top-right Welcome Toast ─── */}
      {showWelcome && (
        <div
          className="
            fixed top-4 right-4 z-50
            bg-indigo-100 text-indigo-900
            dark:bg-purple-700 dark:text-white
            px-4 py-2 rounded shadow-lg flex items-center space-x-2
            animate-slide-in
          "
        >
          <span className="font-medium">🎉 Welcome back!</span>
          <button
            onClick={() => setShowWelcome(false)}
            className="opacity-75 hover:opacity-100 transition"
          >
            ✕
          </button>
        </div>
      )}

      <div className="relative w-full max-w-3xl space-y-8">
        {/* Summarize Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex bg-gray-200 dark:bg-gray-700">
            {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => {
                  setTab(id);
                  setResult('');
                  setInput('');
                  setFile(null);
                }}
                className={`
                  flex-1 flex items-center justify-center py-3 space-x-2 font-medium transition-colors
                  ${tab === id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Panel */}
          <div className="p-8 space-y-6">
            {tab === 'text' && (
              <textarea
                rows={6}
                placeholder="Paste your text here."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="
                  w-full p-4 border border-gray-300 dark:border-gray-600
                  rounded-lg bg-gray-50 dark:bg-gray-700
                  focus:outline-none focus:ring-2 focus:ring-blue-400 transition
                "
              />
            )}
            {tab === 'pdf' && (
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setFile(e.target.files[0])}
                className="block w-full text-gray-700 dark:text-gray-300"
              />
            )}
            {tab === 'url' && (
              <input
                type="url"
                placeholder="https://example.com/article"
                value={input}
                onChange={e => setInput(e.target.value)}
                className="
                  w-full p-4 border border-gray-300 dark:border-gray-600
                  rounded-lg bg-gray-50 dark:bg-gray-700
                  focus:outline-none focus:ring-2 focus:ring-blue-400 transition
                "
              />
            )}

            {/* Summarize button */}
            <button
              onClick={
                tab === 'text' ? handleText
                : tab === 'pdf'  ? handlePDF
                                 : handleURL
              }
              disabled={loading}
              className={`
                w-full flex items-center justify-center py-3 rounded-lg
                bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                hover:from-blue-600 hover:to-indigo-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition transform hover:scale-105 duration-200
              `}
            >
              {loading && <FaSpinner className="animate-spin mr-2" />}
              {loading
                ? 'Summarizing…'
                : `Summarize ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
            </button>
          </div>
        </div>

        {/* Result + TTS */}
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
            {/* TTS controls */}
            <div className="flex space-x-4">
              <button
                onClick={handlePlay}
                disabled={!result}
                className="p-2 rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
              >
                {isSpeaking && !isPaused ? <FaPause /> : <FaPlay />}
              </button>
              <button
                onClick={handlePause}
                disabled={!isSpeaking || isPaused}
                className="p-2 rounded bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition"
              >
                <FaPause />
              </button>
              <button
                onClick={handleStop}
                disabled={!isSpeaking}
                className="p-2 rounded bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 transition"
              >
                <FaStop />
              </button>
            </div>

            {/* Summary */}
            <div className="max-h-96 overflow-auto whitespace-pre-wrap text-gray-800 dark:text-gray-200">
              {result}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
//