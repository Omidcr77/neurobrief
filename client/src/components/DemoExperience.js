import React, { useState } from 'react';
import { FaRobot, FaSpinner } from 'react-icons/fa';
import { getDemoToken } from '../api'; // Import the named export directly

const DemoExperience = ({ onDemoStart }) => {
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const response = await getDemoToken(); // Use the named export directly
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isDemo', 'true'); // Mark session as demo
      onDemoStart();
    } catch (error) {
      console.error('Demo login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
            <FaRobot className="text-3xl text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Try NeuroBrief Demo
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Experience full functionality with sample data. No account required!
          </p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
            </div>
            <p className="ml-3 text-gray-700 dark:text-gray-300">
              Pre-loaded sample summaries
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
            </div>
            <p className="ml-3 text-gray-700 dark:text-gray-300">
              Full AI summarization features
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
            </div>
            <p className="ml-3 text-gray-700 dark:text-gray-300">
              Data resets every hour automatically
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md flex items-center justify-center"
          >
            {loading ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : null}
            {loading ? 'Preparing Demo...' : 'Start Demo'}
          </button>
          <button
            onClick={() => onDemoStart(false)}
            className="py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoExperience;