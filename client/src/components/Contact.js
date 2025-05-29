// src/components/Contact.js
import React, { useState, useContext, useEffect } from 'react';
import Modal from 'react-modal';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  FaGithub,
  FaFacebookF,
  FaEnvelope,
  FaWhatsapp,
  FaCheckCircle,
  FaPaperPlane
} from 'react-icons/fa';
import { ThemeContext } from '../App';
import circuitBg from '../assets/circuit-board.png';

Modal.setAppElement('#root');

export default function Contact() {
  const { theme } = useContext(ThemeContext);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize AOS once
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    AOS.refresh();
  }, []);

  const handleChange = e =>
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

const handleSubmit = e => {
  e.preventDefault();

  const { name, email, message } = formData;

  const subject = encodeURIComponent(`Contact Form Message from ${name}`);

  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  );

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=omid.root1@gmail.com&su=${subject}&body=${body}`;

  // Open Gmail compose in a new tab
  window.open(gmailUrl, '_blank');
};




  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="relative py-20 overflow-hidden">
      {/* 1) Circuit-board bg */}
      <div
        className="absolute inset-0 bg-fixed bg-cover mix-blend-overlay"
        style={{ backgroundImage: `url(${circuitBg})` }}
      />
      {/* 2) Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 opacity-90" />

      {/* 3) Top wave */}
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

      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:space-x-8 space-y-12 md:space-y-0">
          {/* How It Works */}
          <div className="md:w-1/2 space-y-6">
            <h3
              data-aos="fade-right"
              data-aos-delay="100"
              className="text-3xl font-semibold text-gray-800 dark:text-gray-200"
            >
              How It Works
            </h3>
            <ol className="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              <li data-aos="fade-right" data-aos-delay="200">
                Go to the <strong>Summarize</strong> page.
              </li>
              <li data-aos="fade-right" data-aos-delay="300">
                Paste your text or upload a document.
              </li>
              <li data-aos="fade-right" data-aos-delay="400">
                Choose <em>Extractive</em> or <em>Abstractive</em>.
              </li>
              <li data-aos="fade-right" data-aos-delay="500">
                Adjust any optional settings.
              </li>
              <li data-aos="fade-right" data-aos-delay="600">
                Click <strong>Summarize</strong> and wait.
              </li>
              <li data-aos="fade-right" data-aos-delay="700">
                Review, copy, download, or save your summary.
              </li>
            </ol>
            <p
              data-aos="fade-right"
              data-aos-delay="800"
              className="mt-4 text-sm italic text-gray-600 dark:text-gray-400"
            >
              Tip: We’ll email you a copy shortly after as well.
            </p>
          </div>

          {/* Contact Form */}
          <div className="md:w-1/2">
            <div
              data-aos="fade-left"
              data-aos-delay="100"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 lg:p-8 transition-colors duration-300"
            >
              <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600 dark:text-indigo-300">
                Get in Touch
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div
                  data-aos="fade-left"
                  data-aos-delay="200"
                  className="relative"
                >
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder=" "
                    value={formData.name}
                    onChange={handleChange}
                    className="
                      peer w-full px-4 py-3 border-2 rounded-lg
                      border-indigo-300 dark:border-indigo-600
                      bg-gray-50 dark:bg-gray-700
                      focus:outline-none focus:ring-2 focus:ring-indigo-400
                      transition
                    "
                  />
                  <label
                    htmlFor="name"
                    className="
                      absolute left-4 top-3 pointer-events-none
                      peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
                      peer-focus:-top-3 peer-focus:text-sm
                      text-gray-500 dark:text-gray-400
                      transition-all
                    "
                  >
                    Name
                  </label>
                </div>

                {/* Email */}
                <div
                  data-aos="fade-left"
                  data-aos-delay="300"
                  className="relative"
                >
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder=" "
                    value={formData.email}
                    onChange={handleChange}
                    className="
                      peer w-full px-4 py-3 border-2 rounded-lg
                      border-teal-300 dark:border-teal-600
                      bg-gray-50 dark:bg-gray-700
                      focus:outline-none focus:ring-2 focus:ring-teal-400
                      transition
                    "
                  />
                  <label
                    htmlFor="email"
                    className="
                      absolute left-4 top-3 pointer-events-none
                      peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
                      peer-focus:-top-3 peer-focus:text-sm
                      text-gray-500 dark:text-gray-400
                      transition-all
                    "
                  >
                    Email
                  </label>
                </div>

                {/* Message */}
                <div
                  data-aos="fade-left"
                  data-aos-delay="400"
                  className="relative"
                >
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    required
                    placeholder=" "
                    value={formData.message}
                    onChange={handleChange}
                    className="
                      peer w-full px-4 py-3 border-2 rounded-lg
                      border-purple-300 dark:border-purple-600
                      bg-gray-50 dark:bg-gray-700
                      focus:outline-none focus:ring-2 focus:ring-purple-400
                      transition
                    "
                  />
                  <label
                    htmlFor="message"
                    className="
                      absolute left-4 top-3 pointer-events-none
                      peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
                      peer-focus:-top-3 peer-focus:text-sm
                      text-gray-500 dark:text-gray-400
                      transition-all
                    "
                  >
                    Message
                  </label>
                </div>

                {/* Send button */}
                <button
                  type="submit"
                  data-aos="zoom-in"
                  data-aos-delay="500"
                  className="
                    w-full flex items-center justify-center gap-2 py-3 font-semibold rounded-lg
                    bg-gradient-to-r from-blue-500 to-indigo-600
                    text-white hover:opacity-90 hover:scale-105
                    transition
                  "
                >
                  <FaPaperPlane /> Send Message
                </button>
              </form>

              {/* Social + “Contact Us” */}
              <div
                data-aos="fade-up"
                data-aos-delay="600"
                className="flex items-center justify-between mt-8"
              >
                <div className="flex space-x-4">
                  <a
                    href="https://github.com/omidcr77"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl text-gray-600 dark:text-gray-300 hover:text-indigo-500 transform hover:scale-110 transition"
                  >
                    <FaGithub />
                  </a>
                  <a
                    href="https://www.facebook.com/omid.ps2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl text-gray-600 dark:text-gray-300 hover:text-indigo-500 transform hover:scale-110 transition"
                  >
                    <FaFacebookF />
                  </a>
                  <a
                    href="mailto:omid.root1@gmail.com"
                    className="text-2xl text-gray-600 dark:text-gray-300 hover:text-indigo-500 transform hover:scale-110 transition"
                  >
                    <FaEnvelope />
                  </a>
                  <a
                    href="https://wa.me/+93786051709"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl text-gray-600 dark:text-gray-300 hover:text-indigo-500 transform hover:scale-110 transition"
                  >
                    <FaWhatsapp />
                  </a>
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contact Us
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4) Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Thank You"
        className="p-6 bg-white rounded-lg max-w-sm mx-auto mt-24 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <div className="text-center space-y-4">
          <FaCheckCircle className="text-green-500 text-4xl mx-auto" />
          <h3 className="text-xl font-semibold">Thanks, your message is on its way!</h3>
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </Modal>
    </section>
  );
}
