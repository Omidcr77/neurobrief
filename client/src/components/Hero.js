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
      className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* gradient overlay */}
      <div className="absolute inset-0 bg-black/40 dark:bg-gray-900/60 transition-colors duration-500" />

      {/* content */}
      <div className="relative z-10 max-w-3xl px-6 space-y-6">
        <h1
          data-aos="fade-down"
          data-aos-delay="200"
          className="text-4xl md:text-6xl font-extrabold"
        >
          Welcome to{' '}
          <span className="text-blue-400 dark:text-blue-300">
            NeuroBrief
          </span>
        </h1>

        <p
          data-aos="fade-up"
          data-aos-delay="400"
          className="text-lg md:text-2xl"
        >
          Your{' '}
          <span className="font-semibold text-blue-300 dark:text-blue-400">
            AI-powered
          </span>{' '}
          news summarizer — get concise updates in seconds.
        </p>

        <div
          data-aos="fade-up"
          data-aos-delay="600"
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/register"
            className="
              px-6 py-3 
              bg-blue-600 hover:bg-blue-700 
              rounded-lg
              focus:outline-none focus:ring-4 focus:ring-blue-300
              dark:focus:ring-blue-600
              transition
            "
          >
            Get Started
          </Link>
          <button
            onClick={() => scrollTo('about')}
            className="
              px-6 py-3
              bg-white/80 text-gray-900 hover:bg-white/90
              rounded-lg
              focus:outline-none focus:ring-4 focus:ring-gray-200
              dark:focus:ring-gray-600
              transition
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
          absolute bottom-8 z-10 
          animate-bounce p-2 
          bg-white/30 backdrop-blur-sm 
          hover:bg-white/50 
          rounded-full
          transition
        "
        aria-label="Scroll down"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-gray-900 dark:text-gray-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* — bottom wave has been removed per your request — */}
    </section>
  );
}
