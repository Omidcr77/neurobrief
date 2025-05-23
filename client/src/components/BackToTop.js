// src/components/BackToTop.js
import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`
        fixed bottom-8 right-8 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg
        transition-opacity duration-300 transform
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        hover:scale-100 hover:bg-blue-700
      `}
    >
      <FaArrowUp />
    </button>
  );
}
