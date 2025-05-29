// src/components/Hero.js
import React, { useContext, useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../App';
import AOS from 'aos';
import 'aos/dist/aos.css';
import lightBg from '../assets/1.png';
import darkBg from '../assets/2.png';
import { FaArrowDown, FaBrain } from 'react-icons/fa';

export default function Hero() {
  const { theme } = useContext(ThemeContext);
  const bgUrl = theme === 'dark' ? darkBg : lightBg;
  const [isScrolled, setIsScrolled] = useState(false);

  // Preload both images for instant theme-switch
  useEffect(() => {
    [lightBg, darkBg].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    
    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      {/* Animated particles background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              background: theme === 'dark' 
                ? `rgba(96, 165, 250, ${Math.random() * 0.5 + 0.2})` 
                : `rgba(59, 130, 246, ${Math.random() * 0.5 + 0.2})`,
              animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100/80 to-blue-100/80 dark:from-gray-900/80 dark:to-blue-900/80" />
      
      {/* Glowing accent */}
      <div className="absolute top-1/3 -left-24 w-72 h-72 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-1/2 -right-24 w-72 h-72 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-3xl animate-pulse-slow" />

      {/* content */}
      <div className="relative z-10 max-w-4xl px-6 space-y-8 py-16">
        <div 
          data-aos="fade-down" 
          data-aos-delay="200"
          className="inline-flex items-center justify-center gap-3 mb-4 px-4 py-2 rounded-full bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border border-gray-200 dark:border-gray-700"
        >
          <FaBrain className="text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            AI-Powered Knowledge Summarization
          </span>
        </div>

        <h1
          data-aos="fade-down"
          data-aos-delay="300"
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight"
        >
          <span className="block mb-2">Transform Information</span>
          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 bg-clip-text text-transparent">
            Into Knowledge
          </span>
        </h1>

        <p
          data-aos="fade-up"
          data-aos-delay="500"
          className="text-xl md:text-2xl max-w-2xl mx-auto text-gray-800 dark:text-gray-200"
        >
          <span className="font-semibold text-blue-600 dark:text-blue-400">NeuroBrief</span> distills 
          complex information into clear, actionable insights - saving you hours of reading time.
        </p>

        <div
          data-aos="fade-up"
          data-aos-delay="700"
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
              flex items-center justify-center gap-2
              relative overflow-hidden
            "
          >
            <span className="relative z-10">Get Started Free</span>
            <span className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
          <button
            onClick={() => scrollTo('features')}
            className="
              px-8 py-3.5 rounded-lg text-lg font-semibold 
              text-gray-800 dark:text-gray-200 bg-white/90 dark:bg-gray-800/90
              hover:bg-white dark:hover:bg-gray-700
              focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600
              transition-all transform hover:scale-[1.03] active:scale-[0.97] 
              duration-200 ease-in-out shadow-lg hover:shadow-xl
              flex items-center justify-center gap-2
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            See Demo
          </button>
        </div>

        <div 
          data-aos="fade-up"
          data-aos-delay="900"
          className="pt-8 flex justify-center"
        >
          <div className="inline-flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200"
                  style={{ backgroundImage: `url(https://i.pravatar.cc/150?img=${i+10})`, backgroundSize: 'cover' }}
                />
              ))}
            </div>
            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">850+</span> students trust us daily
            </span>
          </div>
        </div>
      </div>

      {/* bounce arrow */}
      <button
        onClick={() => scrollTo('features')}
        className={`
          absolute bottom-10 z-10 
          p-3 
          bg-white/80 backdrop-blur-sm dark:bg-gray-800/80
          hover:bg-white dark:hover:bg-gray-700
          rounded-full
          transition-all shadow-lg
          ${isScrolled ? 'opacity-0 translate-y-5' : 'opacity-100 translate-y-0'} 
          transition-opacity duration-300
        `}
        aria-label="Scroll down"
      >
        <div className="animate-bounce">
          <FaArrowDown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
      </button>
      
      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .animate-pulse-slow {
          animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}