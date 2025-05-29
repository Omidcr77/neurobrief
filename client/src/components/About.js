// src/components/About.js
import React, { useEffect, useContext } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ThemeContext } from '../App';
import { FaRocket, FaLightbulb, FaUsers, FaChartLine } from 'react-icons/fa';

export default function About() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, mirror: false });
    AOS.refresh();
  }, []);

  const stats = [
    { icon: <FaRocket className="text-2xl text-blue-500" />, end: 3.5,  suffix: '+', label: 'Years Experience' },
    { icon: <FaLightbulb className="text-2xl text-indigo-500" />, end: 23,   suffix: '',  label: 'Project Challenges' },
    { icon: <FaUsers className="text-2xl text-purple-500" />, end: 830,  suffix: '+', label: 'Positive Reviews' },
    { icon: <FaChartLine className="text-2xl text-pink-500" />, end: 100,  suffix: 'K', label: 'Trusted Students' },
  ];

  return (
    <section
      id="about"
      className="relative py-20 bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900 overflow-hidden"
      data-aos="fade-up"
    >
      {/* Glowing accents */}
      <div className="absolute top-1/4 -left-24 w-72 h-72 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-24 w-72 h-72 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            About <span className="text-blue-600 dark:text-blue-400">NeuroBrief</span>
          </h2>
          <p className="text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
            Revolutionizing how you consume information with AI-powered summarization
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Story Card */}
          <div
            data-aos="fade-right"
            data-aos-delay="150"
            className="lg:w-1/2 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="mb-2">
              <span className="inline-block px-4 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                Our Story
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Transforming Information Consumption
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                NeuroBrief was founded by Robert Anderson, a passionate AI researcher, 
                and Maria Sanchez, a visionary educator. Their shared dream was to create 
                a solution for information overload in our digital age.
              </p>
              <p>
                United by their belief in the power of AI to enhance human cognition, 
                they gathered experts in natural language processing and launched an 
                innovative platform that transforms how we consume information.
              </p>
              <p>
                Today, NeuroBrief connects a global community of professionals, students, 
                and lifelong learners who value efficiency without compromising understanding.
              </p>
            </div>
          </div>

          {/* Image + Stats */}
          <div className="lg:w-1/2 flex flex-col gap-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((s, i) => (
                <div
                  key={i}
                  data-aos="zoom-in"
                  data-aos-delay={200 + i * 100}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center"
                >
                  <div className="mb-4 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-full">
                    {s.icon}
                  </div>
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    {s.end}
                    {s.suffix}
                  </span>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Image Card */}
            <div
              data-aos="fade-left"
              data-aos-delay="150"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-2xl overflow-hidden shadow-lg"
            >
              <div className="p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Our Vision</h3>
                <p className="opacity-90">
                  To create a world where knowledge is accessible, digestible, and 
                  actionable for everyone, regardless of time constraints.
                </p>
              </div>
              <div className="aspect-w-16 aspect-h-9">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Innovation",
              description: "Continuously evolving our AI to deliver cutting-edge summarization",
              icon: <FaLightbulb className="text-3xl text-yellow-500" />
            },
            {
              title: "Accuracy",
              description: "Maintaining the essence and context of original content",
              icon: <FaChartLine className="text-3xl text-green-500" />
            },
            {
              title: "Accessibility",
              description: "Making knowledge accessible to everyone, everywhere",
              icon: <FaUsers className="text-3xl text-blue-500" />
            },
            {
              title: "Efficiency",
              description: "Saving you time without compromising understanding",
              icon: <FaRocket className="text-3xl text-red-500" />
            }
          ].map((item, index) => (
            <div 
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="mb-4">
                <div className="inline-block p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                  {item.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}