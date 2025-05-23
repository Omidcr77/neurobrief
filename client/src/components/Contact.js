// src/components/Contact.js
import React, { useState, useContext } from 'react';
import Modal from 'react-modal';
import {
  FaGithub,
  FaFacebookF,
  FaEnvelope,
  FaWhatsapp,
  FaCheckCircle
} from 'react-icons/fa';
import { ThemeContext } from '../App';

Modal.setAppElement('#root');

export default function Contact() {
  const { theme } = useContext(ThemeContext);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    await new Promise(res => setTimeout(res, 1000));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section
      id="contact"
      className="
        py-20 transition-colors duration-300
        bg-gradient-to-r from-indigo-50 via-white to-teal-50
        dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
      "
      data-aos="fade-up"
      data-aos-once="false"
    >
      <div className="container mx-auto px-4 flex flex-col md:flex-row md:space-x-8 space-y-12 md:space-y-0">
        {/* How It Works */}
        <div className="md:w-1/2" data-aos="fade-right" data-aos-once="false">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
            How It Works
          </h3>
          <ol className="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>Go to the <strong>Summarize</strong> page.</li>
            <li>Paste your text or upload a document.</li>
            <li>Choose <em>Extractive</em> or <em>Abstractive</em>.</li>
            <li>Adjust any optional settings.</li>
            <li>Click <strong>Summarize</strong> and wait.</li>
            <li>Review, copy, download, or save your summary.</li>
          </ol>
          <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            <em>Tip:</em> We’ll email you a copy shortly after as well.
          </p>
        </div>

        {/* Contact Form */}
        <div className="md:w-1/2" data-aos="fade-left" data-aos-once="false">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 lg:p-8 transition-colors duration-300">
            <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600 dark:text-indigo-300">
              Get in Touch
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="
                    w-full px-4 py-3 border-2 rounded-lg
                    border-indigo-300 dark:border-indigo-600
                    bg-gray-50 dark:bg-gray-700
                    focus:outline-none focus:ring-2 focus:ring-indigo-400
                    transition
                  "
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="
                    w-full px-4 py-3 border-2 rounded-lg
                    border-teal-300 dark:border-teal-600
                    bg-gray-50 dark:bg-gray-700
                    focus:outline-none focus:ring-2 focus:ring-teal-400
                    transition
                  "
                />
              </div>

              <div>
                <label htmlFor="message" className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="
                    w-full px-4 py-3 border-2 rounded-lg
                    border-purple-300 dark:border-purple-600
                    bg-gray-50 dark:bg-gray-700
                    focus:outline-none focus:ring-2 focus:ring-purple-400
                    transition
                  "
                />
              </div>

              <button
                type="submit"
                className="
                  w-full py-3 font-semibold rounded-lg
                  bg-gradient-to-r from-blue-500 to-indigo-600
                  text-white hover:opacity-90 hover:scale-105
                  transition
                "
              >
                Send Message
              </button>
            </form>

            {/* Social + “Contact Us” */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex space-x-4">
                <a
                  href="https://github.com/omidcr77"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition transform hover:scale-110"
                >
                  <FaGithub />
                </a>
                <a
                  href="https://www.facebook.com/omid.ps2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition transform hover:scale-110"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="mailto:omid.root1@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition transform hover:scale-110"
                >
                  <FaEnvelope />
                </a>
                <a
                  href="https://wa.me/+93786051709"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition transform hover:scale-110"
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

      {/* Confirmation Modal */}
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
          <button onClick={closeModal} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Close
          </button>
        </div>
      </Modal>
    </section>
  );
}
