import React, { useState, useContext, useEffect } from 'react';
import Modal from 'react-modal';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  FaEnvelope,
  FaWhatsapp,
  FaCheckCircle,
  FaPaperPlane,
  FaComments,
  FaHeadset,
  FaQuestionCircle
} from 'react-icons/fa';
import { ThemeContext } from '../App';

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
        relative py-20 overflow-hidden
        bg-gradient-to-br from-gray-100 to-blue-100
        dark:from-gray-900 dark:to-blue-900
      "
    >
      {/* Glowing accents */}
      <div className="absolute top-1/4 -left-24 w-72 h-72 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 -right-24 w-72 h-72 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 
            className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4"
            data-aos="fade-down"
          >
            Contact <span className="text-blue-600 dark:text-blue-400">Us</span>
          </h2>
          <p 
            className="text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Have questions? We're here to help
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
              data-aos="fade-right"
              data-aos-delay="100"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                <FaComments className="text-blue-500 mr-3" />
                Get In Touch
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                    <FaEnvelope className="text-blue-600 dark:text-blue-400 text-xl" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Email</h4>
                    <a 
                      href="mailto:support@neurobrief.ai" 
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      support@neurobrief.ai
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                    <FaWhatsapp className="text-green-600 dark:text-green-400 text-xl" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">WhatsApp</h4>
                    <a 
                      href="https://wa.me/+93786051709" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 dark:text-green-400 hover:underline"
                    >
                      +93786051709
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg p-3">
                    <FaHeadset className="text-indigo-600 dark:text-indigo-400 text-xl" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Support Hours</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Monday-Friday: 9am-5pm (GMT)
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
              data-aos="fade-right"
              data-aos-delay="200"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                <FaQuestionCircle className="text-indigo-500 mr-3" />
                Frequently Asked Questions
              </h3>
              
              <div className="space-y-6">
                {[
                  {
                    question: "How long does summarization take?",
                    answer: "Most summaries are generated in under 10 seconds, even for longer documents."
                  },
                  {
                    question: "Is there a file size limit?",
                    answer: "PDFs up to 10MB and text content up to 50,000 characters are supported."
                  },
                  {
                    question: "Can I summarize multiple documents?",
                    answer: "Yes, our premium plans allow batch processing of multiple documents."
                  }
                ].map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{faq.question}</h4>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </div>
                ))}
                
                <a 
                  href="/faq" 
                  className="
                    inline-flex items-center text-blue-600 dark:text-blue-400
                    hover:text-blue-800 dark:hover:text-blue-300
                    font-medium
                  "
                >
                  View all FAQs
                  <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
            data-aos="fade-left"
            data-aos-delay="100"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Send us a message
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder=" "
                  className="
                    w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm
                    dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    peer
                  "
                />
                <label
                  htmlFor="name"
                  className="
                    absolute left-4 top-3.5 text-gray-500 dark:text-gray-400
                    peer-focus:text-blue-600 dark:peer-focus:text-blue-400
                    peer-focus:top-0 peer-focus:bg-white dark:peer-focus:bg-gray-800
                    peer-focus:px-1 peer-focus:text-sm
                    transition-all duration-200 pointer-events-none
                  "
                >
                  Full Name
                </label>
              </div>
              
              {/* Email */}
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder=" "
                  className="
                    w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm
                    dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    peer
                  "
                />
                <label
                  htmlFor="email"
                  className="
                    absolute left-4 top-3.5 text-gray-500 dark:text-gray-400
                    peer-focus:text-blue-600 dark:peer-focus:text-blue-400
                    peer-focus:top-0 peer-focus:bg-white dark:peer-focus:bg-gray-800
                    peer-focus:px-1 peer-focus:text-sm
                    transition-all duration-200 pointer-events-none
                  "
                >
                  Email Address
                </label>
              </div>
              
              {/* Message */}
              <div className="relative">
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder=" "
                  className="
                    w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm
                    dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    peer
                  "
                />
                <label
                  htmlFor="message"
                  className="
                    absolute left-4 top-3.5 text-gray-500 dark:text-gray-400
                    peer-focus:text-blue-600 dark:peer-focus:text-blue-400
                    peer-focus:top-0 peer-focus:bg-white dark:peer-focus:bg-gray-800
                    peer-focus:px-1 peer-focus:text-sm
                    transition-all duration-200 pointer-events-none
                  "
                >
                  Your Message
                </label>
              </div>
              
              {/* Submit button */}
              <button
                type="submit"
                className="
                  w-full flex items-center justify-center gap-2 py-3.5 font-semibold rounded-xl
                  bg-gradient-to-r from-blue-600 to-indigo-700
                  text-white hover:from-blue-700 hover:to-indigo-800
                  focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 
                  transition-all transform hover:scale-[1.02] active:scale-[0.98] 
                  duration-200 ease-in-out shadow-lg hover:shadow-xl
                "
              >
                <FaPaperPlane className="mr-2" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Thank You"
        className="
          p-0 border-none bg-transparent max-w-md mx-auto mt-24
          flex items-center justify-center
        "
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
      >
        <div 
          className="
            bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center
            transform transition-all duration-300 scale-95
            animate-fade-in
          "
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <FaCheckCircle className="text-green-500 text-3xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Message Sent!
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Thank you for contacting us. We'll get back to you within 24 hours.
          </p>
          <button
            onClick={closeModal}
            className="
              px-8 py-3 rounded-xl font-medium
              bg-blue-600 text-white
              hover:bg-blue-700
              focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 
              transition-all
            "
          >
            Close
          </button>
        </div>
      </Modal>
    </section>
  );
}