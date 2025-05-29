// src/components/BackToTop.js
import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`
        fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-xl
        transition-all duration-300 transform
        bg-gradient-to-r from-blue-600 to-indigo-700
        hover:from-blue-700 hover:to-indigo-800
        focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        hover:scale-[1.05] active:scale-95
      `}
    >
      <FaArrowUp className="text-white text-lg" />
    </button>
  );
}