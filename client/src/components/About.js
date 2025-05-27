// src/components/About.js
import React, { useEffect, useContext } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ThemeContext } from '../App';

export default function About() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, mirror: false });
    AOS.refresh();
  }, []);

  const stats = [
    { end: 3.5,  suffix: '+', label: 'Years Experience' },
    { end: 23,   suffix: '',  label: 'Project Challenges' },
    { end: 830,  suffix: '+', label: 'Positive Reviews' },
    { end: 100,  suffix: 'K', label: 'Trusted Students' },
  ];

  return (
    <section
      id="about"
      className="relative py-20 bg-white dark:bg-gray-900 overflow-hidden"
      data-aos="fade-up"
    >
      {/* Top SVG Wave */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
        <svg
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
          className="w-full h-20"
          aria-hidden="true"
        >
          <path
            d="M0,0 C400,100 800,0 1200,100 L1200,00 L0,0 Z"
            className="fill-white dark:fill-gray-900"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* Story Card */}
        <div
          data-aos="fade-right"
          data-aos-delay="150"
          className="md:w-1/2 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
        >
          <p className="text-indigo-600 font-medium mb-2">How It Started</p>
          <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            Our Dream is Global Learning Transformation
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            NeuroBrief was founded by Robert Anderson, a passionate lifelong
            learner, and Maria Sanchez, a visionary educator. Their shared
            dream was to create a digital haven of knowledge accessible to all.
            United by their belief in the transformational power of education,
            they gathered experts, launched an innovative platform, and
            connected a global community of eager learners.
          </p>
        </div>

        {/* Image + Stats */}
        <div className="md:w-1/2 flex flex-col gap-8">
          {/* Image Card */}
          <div
            data-aos="fade-left"
            data-aos-delay="150"
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg"
          >
            <img
              src="/images/news2.png"
              alt="Team collaborating"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((s, i) => (
              <div
                key={i}
                data-aos="zoom-in"
                data-aos-delay={200 + i * 100}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow"
              >
                <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                  {s.end}
                  {s.suffix}
                </span>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom SVG Wave */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
          className="w-full h-20"
          aria-hidden="true"
        >
          <path
            d="M0,0 C400,100 800,0 1200,100 L1200,00 L0,0 Z"
            className="fill-white dark:fill-gray-900"
          />
        </svg>
      </div>
    </section>
  );
}
