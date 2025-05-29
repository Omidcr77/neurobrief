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
  FaBrain, // Example for a new icon if needed
  FaAlignLeft, // For abstractive
  FaListOl, // For extractive (could also use FaQuoteLeft)
  FaTextHeight, // For length
} from 'react-icons/fa';
import api from '../api';

export default function SummarizePage() {
  const location = useLocation();
  const navigate = useNavigate();

  // --- Welcome toast state ---
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (location.state?.showWelcome) {
      setShowWelcome(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  // --- Summarization state/hooks ---
  const [tab, setTab] = useState('text'); // 'text', 'pdf', 'url'
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // --- New Advanced Options State ---
  const [summaryType, setSummaryType] = useState('abstractive'); // 'abstractive', 'extractive'
  const [summaryLength, setSummaryLength] = useState('medium'); // 'short', 'medium', 'detailed' (maps to long)
  const [focus, setFocus] = useState('');

  // Text-to-Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef(null);

  // --- Helper function to create styled radio buttons ---
  const StyledRadio = ({ name, value, checked, onChange, label, icon: Icon }) => (
    <label className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="form-radio h-5 w-5 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-300 border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600"
      />
      {Icon && <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );

  // --- Summarize helper ---
  const doSummarize = async (endpoint, payload) => {
    setLoading(true);
    setResult('');
    // Stop any ongoing speech before starting a new summary
    if (isSpeaking) {
      handleStop();
    }
    try {
      // Add summaryType, summaryLength, and focus to the payload
      const fullPayload =
        payload instanceof FormData
          ? payload // For file uploads, append directly
          : { ...payload, summaryType, summaryLength, focus };

      if (payload instanceof FormData) {
        payload.append('summaryType', summaryType);
        payload.append('summaryLength', summaryLength);
        payload.append('focus', focus);
      }
      
      const { data } = await api.post(endpoint, fullPayload);
      setResult(data.summary);
    } catch (err) {
      // Display a more user-friendly error message
      const errorMessage = err.response?.data?.message || err.message || 'Summarization failed. Please try again.';
      setResult(`Error: ${errorMessage}`); // Show error in the result area
      // Consider using a toast notification for errors instead of alert
      // alert(`Summarization failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleText = () => {
    if (!input.trim()) {
      setResult('Error: Please paste some text first.');
      return;
    }
    doSummarize('/summarize/text', { text: input });
  };

  const handlePDF = () => {
    if (!file) {
      setResult('Error: Please select a PDF file first.');
      return;
    }
    const form = new FormData();
    form.append('file', file);
    // summaryType, summaryLength, focus will be added by doSummarize
    doSummarize('/summarize/pdf', form);
  };

  const handleURL = () => {
    if (!input.trim()) {
      setResult('Error: Please enter a URL first.');
      return;
    }
    // Basic URL validation (optional, but good practice)
    try {
      new URL(input);
    } catch (_) {
      setResult('Error: Please enter a valid URL (e.g., https://example.com).');
      return;
    }
    doSummarize('/summarize/url', { url: input });
  };

  // --- TTS handlers ---
  const handlePlay = () => {
    if (!result || result.startsWith('Error:')) return; // Don't play error messages
    if (!window.speechSynthesis) {
      setResult((prevResult) => prevResult + '\n\n(Text-to-speech not supported in your browser.)');
      return;
    }
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true); // Ensure isSpeaking is true when resuming
      return;
    }
    if (isSpeaking) return;

    // Clean up previous utterance if any
    if (utteranceRef.current) {
        utteranceRef.current.onend = null;
        utteranceRef.current.onpause = null;
        utteranceRef.current.onresume = null;
    }
    window.speechSynthesis.cancel(); // Cancel any previous speech

    utteranceRef.current = new SpeechSynthesisUtterance(result);
    utteranceRef.current.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utteranceRef.current.onpause = () => { // This might not be reliably fired by all browsers on pause()
        // setIsPaused(true); // We set this directly in handlePause
    };
    utteranceRef.current.onresume = () => {
        // setIsPaused(false); // We set this directly in handlePlay when resuming
    };
    utteranceRef.current.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        setResult((prevResult) => prevResult + `\n\n(Speech synthesis error: ${event.error})`);
        setIsSpeaking(false);
        setIsPaused(false);
    };


    window.speechSynthesis.speak(utteranceRef.current);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if (window.speechSynthesis) { // Check if synthesis is available
        window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    if (utteranceRef.current) { // Clean up listeners
        utteranceRef.current.onend = null;
        utteranceRef.current.onpause = null;
        utteranceRef.current.onresume = null;
        utteranceRef.current.onerror = null;
        utteranceRef.current = null;
    }
  };
  
  // Cleanup TTS on component unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);


  const tabsConfig = [
    { id: 'text', icon: FaFont, label: 'Text', placeholder: 'Paste your text here to be summarized...' },
    { id: 'pdf', icon: FaFilePdf, label: 'PDF', placeholder: 'Upload a PDF file to summarize its content.' },
    { id: 'url', icon: FaLink, label: 'URL', placeholder: 'Enter a URL to summarize the web page content...' },
  ];

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900 py-8 px-4 selection:bg-blue-500 selection:text-white">
      {showWelcome && (
        <div className="fixed top-6 right-6 z-50 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center space-x-3 animate-slide-in">
          <FaBrain className="h-6 w-6" />
          <span className="font-semibold">🎉 Welcome back to NeuroBrief!</span>
          <button onClick={() => setShowWelcome(false)} className="opacity-80 hover:opacity-100 transition text-2xl leading-none">&times;</button>
        </div>
      )}

      <div className="w-full max-w-4xl space-y-8">
        {/* Summarize Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-500 ease-in-out">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabsConfig.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => {
                  setTab(id);
                  setResult('');
                  setInput('');
                  setFile(null);
                  handleStop(); // Stop TTS when changing tabs
                }}
                className={`
                  flex-1 flex items-center justify-center py-4 px-2 space-x-2 font-semibold transition-all duration-300 ease-in-out
                  focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800 focus:ring-blue-500
                  ${tab === id
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700'
                    : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Panel */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Input Area */}
            <div>
              {tab === 'text' && (
                <textarea
                  rows={8}
                  placeholder={tabsConfig.find(t => t.id === tab)?.placeholder}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition shadow-sm"
                />
              )}
              {tab === 'pdf' && (
                <div className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:border-blue-500 dark:hover:border-blue-400 transition group">
                  <FaFilePdf className="w-12 h-12 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 mb-3" />
                  <input
                    type="file"
                    id="pdf-upload"
                    accept="application/pdf"
                    onChange={e => setFile(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="pdf-upload" className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium">
                    {file ? file.name : 'Choose a PDF file'}
                  </label>
                  {file && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max 10MB</p>}
                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{tabsConfig.find(t => t.id === tab)?.placeholder}</p>
                </div>
              )}
              {tab === 'url' && (
                <input
                  type="url"
                  placeholder={tabsConfig.find(t => t.id === tab)?.placeholder}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition shadow-sm"
                />
              )}
            </div>

            {/* Advanced Options Section */}
            <div className="pt-4 space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
                Customization Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Summary Type */}
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Summary Type</legend>
                  <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border dark:border-gray-600">
                    <StyledRadio name="summaryType" value="abstractive" checked={summaryType === 'abstractive'} onChange={(e) => setSummaryType(e.target.value)} label="Abstractive (AI rephrased)" icon={FaAlignLeft} />
                    <StyledRadio name="summaryType" value="extractive" checked={summaryType === 'extractive'} onChange={(e) => setSummaryType(e.target.value)} label="Extractive (Key sentences)" icon={FaListOl}/>
                  </div>
                </fieldset>

                {/* Summary Length */}
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Summary Length</legend>
                  <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border dark:border-gray-600">
                    <StyledRadio name="summaryLength" value="short" checked={summaryLength === 'short'} onChange={(e) => setSummaryLength(e.target.value)} label="Short (~50 words)" icon={FaTextHeight} />
                    <StyledRadio name="summaryLength" value="medium" checked={summaryLength === 'medium'} onChange={(e) => setSummaryLength(e.target.value)} label="Medium (~100 words)" icon={FaTextHeight} />
                    <StyledRadio name="summaryLength" value="detailed" checked={summaryLength === 'detailed'} onChange={(e) => setSummaryLength(e.target.value)} label="Long (~200+ words)" icon={FaTextHeight} />
                  </div>
                </fieldset>
              </div>

              {/* Focus (Optional) */}
              <div>
                <label htmlFor="focus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Specific Focus (Optional)
                </label>
                <input
                  type="text"
                  name="focus"
                  id="focus"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="e.g., main arguments, impact on economy"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition shadow-sm"
                />
              </div>
            </div>

            {/* Summarize button */}
            <button
              onClick={
                tab === 'text' ? handleText
                : tab === 'pdf'  ? handlePDF
                                 : handleURL
              }
              disabled={loading}
              className={`
                w-full flex items-center justify-center py-3.5 px-6 rounded-lg text-lg font-semibold
                bg-gradient-to-r from-blue-600 to-indigo-700 text-white
                hover:from-blue-700 hover:to-indigo-800
                focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all transform hover:scale-[1.02] active:scale-[0.98] duration-200 ease-in-out shadow-md hover:shadow-lg
              `}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-3 h-5 w-5" />
                  Summarizing...
                </>
              ) : (
                `✨ Summarize ${tab.charAt(0).toUpperCase() + tab.slice(1)}`
              )}
            </button>
          </div>
        </div>

        {/* Result + TTS */}
        { (result || loading) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 sm:p-8 space-y-4 transition-all duration-500 ease-in-out">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Summary Result</h3>
            {loading && !result && (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
                    <FaSpinner className="animate-spin h-12 w-12 mb-4" />
                    <p className="text-lg">Generating your summary, please wait...</p>
                </div>
            )}
            {result && (
              <>
                {!result.startsWith('Error:') && (
                  <div className="flex items-center space-x-3 border-b dark:border-gray-700 pb-3 mb-3">
                    <button
                      onClick={handlePlay}
                      disabled={isSpeaking && !isPaused}
                      title={isSpeaking && !isPaused ? "Playing" : "Play Summary"}
                      className="p-2.5 rounded-full text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      {isSpeaking && !isPaused ? <FaPause className="h-5 w-5" /> : <FaPlay className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={handlePause}
                      disabled={!isSpeaking || isPaused}
                      title="Pause Summary"
                      className="p-2.5 rounded-full text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-yellow-100 dark:hover:bg-yellow-600 disabled:opacity-50 transition"
                    >
                      <FaPause className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleStop}
                      disabled={!isSpeaking}
                      title="Stop Summary"
                      className="p-2.5 rounded-full text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-600 disabled:opacity-50 transition"
                    >
                      <FaStop className="h-5 w-5" />
                    </button>
                  </div>
                )}
                <div className={`max-h-[60vh] overflow-y-auto whitespace-pre-wrap p-3 rounded-md text-gray-700 dark:text-gray-200 ${result.startsWith('Error:') ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                  {result}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
