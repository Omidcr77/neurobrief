import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Contact from '../components/Contact';

export default function WelcomePage({ setShowDemoExperience }) {
  useEffect(() => {
    AOS.init({ once: true, duration: 800 });
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      <div className="flex-1">
        <Hero setShowDemoExperience={setShowDemoExperience} />
      </div>
      <About />
      <Services />
      <Contact />
    </div>
  );
}