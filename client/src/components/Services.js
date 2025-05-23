// src/components/Services.js
import React from 'react';
import { FaRegFileAlt, FaRegNewspaper, FaFilePdf, FaLink } from 'react-icons/fa';

const services = [
  { icon: FaRegFileAlt,   title: 'Extractive Summaries', desc: 'Highlight key points with precision.' },
  { icon: FaRegNewspaper, title: 'Abstractive Summaries', desc: 'Generate natural-language summaries.' },
  { icon: FaFilePdf,      title: 'PDF Support',           desc: 'Upload & summarize documents.' },
  { icon: FaLink,         title: 'URL Summaries',         desc: 'Summarize any web article.' },
];

export default function Services() {
  return (
    <section
      id="services"
      className="
        relative py-20
        bg-gradient-to-r from-indigo-50 via-white to-teal-50
        dark:from-gray-800 dark:via-gray-900 dark:to-black
        overflow-hidden transition-colors duration-300 group
      "
      data-aos="fade-up"
      data-aos-once="false"
    >
      {/* Decorative blobs */}
      <div
        className="
          absolute -top-16 -left-16 w-60 h-60
          bg-indigo-300 opacity-30 mix-blend-multiply blur-3xl
          dark:bg-indigo-700 dark:opacity-20 animate-blob
        "
      />
      <div
        className="
          absolute -bottom-16 -right-16 w-72 h-72
          bg-teal-300 opacity-25 mix-blend-multiply blur-2xl
          dark:bg-teal-700 dark:opacity-15 animate-blob animation-delay-4000
        "
      />

      <div className="container mx-auto px-4">
        <h2
          className="
            text-4xl font-extrabold text-center text-indigo-600 mb-12
            dark:text-indigo-300
            transition-transform duration-300 hover:scale-105 hover:text-indigo-500
          "
          data-aos="fade-down"
          data-aos-once="false"
        >
          Our Services
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="
                  relative p-8 rounded-xl shadow-lg bg-white dark:bg-gray-800
                  hover:shadow-2xl hover:-translate-y-2 transform
                  transition-all duration-300 overflow-hidden group
                "
                data-aos="zoom-in"
                data-aos-delay={i * 150}
                data-aos-once="false"
              >
                <div
                  className="
                    absolute top-0 right-0 w-24 h-24
                    bg-blue-100 opacity-20 mix-blend-multiply blur-xl
                    dark:bg-blue-800 dark:opacity-10
                  "
                />

                <Icon
                  className="
                    mx-auto mb-4 h-12 w-12
                    text-indigo-600 dark:text-indigo-300
                    transition-colors duration-300 animate-pulse
                  "
                />
                <h3
                  className="
                    text-xl font-semibold mb-2
                    text-gray-800 dark:text-gray-100
                    transition-transform duration-300 group-hover:scale-105
                    group-hover:text-indigo-500
                  "
                >
                  {s.title}
                </h3>
                <p
                  className="
                    text-gray-600 dark:text-gray-400
                    transition-colors duration-300 group-hover:text-indigo-500
                  "
                >
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
