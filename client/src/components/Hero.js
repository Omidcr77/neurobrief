// src/components/Hero.js
import React, { useContext, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../App';
import AOS from 'aos';
import 'aos/dist/aos.css';
import lightBg from '../assets/1.png';
import darkBg  from '../assets/2.png';

export default function Hero() {
  const { theme } = useContext(ThemeContext);
  const bgUrl = theme === 'dark' ? darkBg : lightBg;

  // Preload both images for instant theme-switch
  useEffect(() => {
    [lightBg, darkBg].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 800, once: false, mirror: true });
    AOS.refresh();
  }, []);

  // Smooth-scroll helper
  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section
      id="hero"
      data-aos="fade-up"
      className="relative min-h-screen flex items-center justify-center text-center overflow-hidden"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Gradient overlay - matches dashboard gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100/70 to-blue-100/70 dark:from-gray-900/70 dark:to-blue-900/70" />
      
      {/* Glowing accent */}
      <div className="absolute top-1/3 -left-24 w-72 h-72 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-24 w-72 h-72 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-3xl" />

      {/* content */}
      <div className="relative z-10 max-w-4xl px-6 space-y-8 py-16">
        <h1
          data-aos="fade-down"
          data-aos-delay="200"
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight"
        >
          Welcome to{' '}
          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 bg-clip-text text-transparent">
            NeuroBrief
          </span>
        </h1>

        <p
          data-aos="fade-up"
          data-aos-delay="400"
          className="text-xl md:text-2xl max-w-2xl mx-auto text-gray-800 dark:text-gray-200"
        >
          Your <span className="font-semibold text-blue-600 dark:text-blue-400">AI-powered</span> news summarizer — 
          get concise updates in seconds.
        </p>

        <div
          data-aos="fade-up"
          data-aos-delay="600"
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/register"
            className="
              px-8 py-3.5 rounded-lg text-lg font-semibold 
              bg-gradient-to-r from-blue-600 to-indigo-700 text-white 
              hover:from-blue-700 hover:to-indigo-800 
              focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 
              transition-all transform hover:scale-[1.03] active:scale-[0.97] 
              duration-200 ease-in-out shadow-lg hover:shadow-xl
            "
          >
            Get Started
          </Link>
          <button
            onClick={() => scrollTo('about')}
            className="
              px-8 py-3.5 rounded-lg text-lg font-semibold 
              text-gray-800 dark:text-gray-200 bg-white/90 dark:bg-gray-800/90
              hover:bg-white dark:hover:bg-gray-700
              focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600
              transition-all transform hover:scale-[1.03] active:scale-[0.97] 
              duration-200 ease-in-out shadow-lg hover:shadow-xl
            "
          >
            Learn More
          </button>
        </div>
      </div>

      {/* bounce arrow */}
      <button
        onClick={() => scrollTo('about')}
        className="
          absolute bottom-10 z-10 
          animate-bounce p-3 
          bg-white/80 backdrop-blur-sm dark:bg-gray-800/80
          hover:bg-white dark:hover:bg-gray-700
          rounded-full
          transition-all shadow-lg
        "
        aria-label="Scroll down"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-blue-600 dark:text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </section>
  );
}