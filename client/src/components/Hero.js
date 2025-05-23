// src/components/Hero.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../App';

// point to wherever you actually put them:
import lightBg from '../assets/1.png'; 
import darkBg  from '../assets/2.png';

export default function Hero() {
  const { theme } = useContext(ThemeContext);

  const bgUrl = theme === 'dark' ? darkBg : lightBg;

  return ( 
    <section
      id="hero"
      style={{
        backgroundImage: `url(${bgUrl})`,
      }}
      className="
        h-screen bg-cover bg-center relative
        transition-colors duration-300
      "
    >
      {/* overlays */}
      <div
        className="
          absolute inset-0
          bg-black bg-opacity-50 
          dark:bg-gray-900 dark:bg-opacity-70
          transition-colors duration-300
        "
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1
          className="
            text-4xl md:text-6xl font-bold text-white mb-4
            transition-colors duration-300
          "
        >
          Welcome to NeuroBrief
        </h1>
        <p
          className="
            text-lg md:text-2xl text-gray-200 mb-6
            dark:text-gray-300
            transition-colors duration-300
          "
        >
          Your AI-powered news summarizer
        </p>
        <Link
          to="/register"
          className="
            px-6 py-3 rounded-lg transition-colors duration-300
            bg-blue-600 text-white hover:bg-blue-700
            dark:bg-blue-500 dark:hover:bg-blue-600
          "
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}
