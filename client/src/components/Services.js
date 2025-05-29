// src/components/Services.js
import React from 'react';
import { FaRegFileAlt, FaRegNewspaper, FaFilePdf, FaLink, FaBrain, FaRocket } from 'react-icons/fa';

const services = [
  { 
    icon: FaRegFileAlt,   
    title: 'Extractive Summaries', 
    desc: 'Highlight key points with precision using advanced NLP techniques.',
    color: 'text-blue-500'
  },
  { 
    icon: FaRegNewspaper, 
    title: 'Abstractive Summaries', 
    desc: 'Generate natural-language summaries that capture the essence.',
    color: 'text-indigo-500'
  },
  { 
    icon: FaFilePdf,      
    title: 'PDF Support',           
    desc: 'Upload & summarize documents with intelligent text extraction.',
    color: 'text-purple-500'
  },
  { 
    icon: FaLink,         
    title: 'URL Summaries',         
    desc: 'Summarize any web article with accurate content parsing.',
    color: 'text-pink-500'
  },
  { 
    icon: FaBrain,        
    title: 'AI-Powered Insights',   
    desc: 'Get key takeaways and themes identified by our AI.',
    color: 'text-teal-500'
  },
  { 
    icon: FaRocket,       
    title: 'Rapid Processing',      
    desc: 'Generate summaries in seconds with our optimized engine.',
    color: 'text-orange-500'
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="
        relative py-20 overflow-hidden
        bg-gradient-to-br from-gray-100 to-blue-100
        dark:from-gray-900 dark:to-blue-900
      "
      data-aos="fade-up"
    >
      {/* Glowing accents */}
      <div className="absolute top-1/4 -left-24 w-72 h-72 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 -right-24 w-72 h-72 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="
              text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white
              mb-4
            "
            data-aos="fade-down"
          >
            Our <span className="text-blue-600 dark:text-blue-400">Services</span>
          </h2>
          <p
            className="text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Powerful AI tools to transform how you consume information
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="
                  relative bg-white dark:bg-gray-800 rounded-2xl p-8
                  shadow-lg hover:shadow-xl transition-all duration-300
                  transform hover:-translate-y-2 group
                "
                data-aos="zoom-in"
                data-aos-delay={i * 100}
              >
                <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-blue-100/30 dark:bg-blue-900/20 blur-xl" />
                
                <div className="mb-6">
                  <div className="inline-block p-4 rounded-xl bg-gray-100 dark:bg-gray-700/50">
                    <Icon className={`h-8 w-8 ${s.color}`} />
                  </div>
                </div>
                
                <h3
                  className="
                    text-xl font-bold mb-3
                    text-gray-900 dark:text-gray-100
                    group-hover:text-blue-600 dark:group-hover:text-blue-400
                    transition-colors
                  "
                >
                  {s.title}
                </h3>
                <p
                  className="
                    text-gray-600 dark:text-gray-400
                    group-hover:text-gray-800 dark:group-hover:text-gray-300
                    transition-colors
                  "
                >
                  {s.desc}
                </p>
                
                <div className="mt-6">
                  <button
                    className="
                      inline-flex items-center text-sm font-medium
                      text-blue-600 dark:text-blue-400
                      hover:text-blue-800 dark:hover:text-blue-300
                      transition-colors
                    "
                  >
                    Learn more
                    <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to action */}
        <div 
          className="mt-16 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-2xl p-8 shadow-lg"
          data-aos="fade-up"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to transform how you consume information?
            </h3>
            <p className="text-blue-100 mb-6">
              Join thousands of users who save hours every week with NeuroBrief
            </p>
            <div className="flex justify-center">
              <a
                href="/register"
                className="
                  px-8 py-3.5 rounded-lg text-lg font-semibold 
                  bg-white text-blue-600
                  hover:bg-gray-100 hover:text-blue-700
                  focus:outline-none focus:ring-4 focus:ring-blue-300 
                  transition-all transform hover:scale-[1.03] active:scale-[0.97] 
                  duration-200 ease-in-out shadow-lg hover:shadow-xl
                "
              >
                Get Started Free
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}