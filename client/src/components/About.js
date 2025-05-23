// src/components/About.js
import React from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function About() {
  React.useEffect(() => {
    AOS.refresh(); // replay on scroll
  }, []);

  const stats = [
    { value: '3.5',  label: 'Years Experience' },
    { value: '23',   label: 'Project Challenges' },
    { value: '830+', label: 'Positive Reviews' },
    { value: '100K', label: 'Trusted Students' },
  ];

  return (
    <section
      id="about"
      className="
        py-20 transition-colors duration-300
        bg-gradient-to-r from-indigo-50 via-white to-teal-50
        dark:from-gray-800 dark:via-gray-900 dark:to-black
      "
      data-aos="fade-up"
      data-aos-once="false"
    >
      <div className="container mx-auto px-4 flex flex-col md:flex-row md:space-x-8">
        {/* Left Card */}
        <div
          className="
            md:w-1/2 bg-white dark:bg-gray-800
            rounded-2xl p-8 md:p-12 mb-8 md:mb-0
            shadow-lg transition-colors duration-300
          "
          data-aos="fade-right"
          data-aos-once="false"
        >
          <p className="text-orange-500 font-medium mb-2">How It Started</p>
          <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            Our Dream is Global Learning Transformation
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            NeuroBrief was founded by Robert Anderson, a passionate lifelong learner, and Maria
            Sanchez, a visionary educator. Their shared dream was to create a digital haven of
            knowledge accessible to all. United by belief in the transformational power of
            education, they embarked on a journey to build NeuroBrief. With relentless dedication,
            they gathered experts to launch this innovative platform—creating a global community
            of eager learners, all connected by the desire to explore, learn, and grow.
          </p>
        </div>

        {/* Right Side: Image + Stats */}
        <div className="md:w-1/2 flex flex-col space-y-8">
          <div
            className="
              bg-white dark:bg-gray-800
              rounded-2xl overflow-hidden
              shadow-lg transition-colors duration-300
            "
            data-aos="fade-left"
            data-aos-once="false"
          >
            <img
              src="/images/news2.png"
              alt="Team collaborating"
              className="w-full h-auto object-cover"
            />
          </div>

          <div
            className="grid grid-cols-2 gap-6"
            data-aos="fade-up"
            data-aos-once="false"
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="
                  bg-white dark:bg-gray-800
                  rounded-xl p-6 flex flex-col items-center
                  shadow transition-colors duration-300
                "
                data-aos="zoom-in"
                data-aos-delay={i * 100}
                data-aos-once="false"
              >
                <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </span>
                <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
