import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Contact from '../components/Contact';

export default function WelcomePage() {
  useEffect(() => {
    AOS.init({ once: true, duration: 800 });
  }, []);

  return (
    <div className="overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300">
      <Hero />
      <About />
      <Services />
      <Contact />
    </div>
  );
}
