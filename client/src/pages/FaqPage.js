import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaHeadset, FaQuestionCircle, FaLightbulb } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/NavBar'; // Assuming you have a Navbar component

export default function FaqPage() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqCategories = [
    {
      title: "Getting Started",
      icon: <FaLightbulb className="text-yellow-500" />,
      questions: [
        {
          question: "How do I create an account?",
          answer: "Click the 'Get Started Free' button on our homepage. You can sign up using your email or Google account. No credit card required."
        },
        {
          question: "Is there a free trial?",
          answer: "Yes! All new users get 7 days of premium access with no limitations. After that, you can continue with our free plan or upgrade to premium."
        },
        {
          question: "What browsers are supported?",
          answer: "NeuroBrief works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest browser versions."
        }
      ]
    },
    {
      title: "Summarization",
      icon: <FaQuestionCircle className="text-blue-500" />,
      questions: [
        {
          question: "What types of documents can I summarize?",
          answer: "We support PDFs, Word documents, plain text, and web URLs. Our AI can process academic papers, articles, reports, and more."
        },
        {
          question: "How long does summarization take?",
          answer: "Most summaries are generated in 5-10 seconds. For very long documents (50+ pages), it may take up to 30 seconds."
        },
        {
          question: "Is there a file size limit?",
          answer: "PDFs up to 10MB and text content up to 50,000 characters are supported in our free plan. Premium users can process larger files."
        },
        {
          question: "Can I summarize multiple documents at once?",
          answer: "We're currently working on multi-document summarization. For now, please summarize one document at a time."
        }
      ]
    },
    {
      title: "Account & Billing",
      icon: <FaHeadset className="text-green-500" />,
      questions: [
        {
          question: "How do I upgrade to premium?",
          answer: "Go to your Dashboard > Account Settings > Subscription. Choose your plan and complete the payment process."
        },
        {
          question: "Can I cancel my subscription?",
          answer: "Yes, you can cancel anytime from your account settings. Your premium features will remain active until the end of your billing period."
        },
        {
          question: "Do you offer student discounts?",
          answer: "Yes! Students get 50% off premium plans. Verify your student status through our education portal."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, PayPal, and cryptocurrency payments."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300 mb-10">
              Find answers to common questions about NeuroBrief and how to get the most out of our AI summarization tools.
            </p>
            
            <div className="flex justify-center">
              <div className="relative w-full max-w-2xl">
                <input
                  type="text"
                  placeholder="Search questions..."
                  className="w-full px-6 py-4 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="absolute right-3 top-3.5 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-10 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="space-y-12">
            {faqCategories.map((category, catIndex) => (
              <div 
                key={catIndex}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 p-6">
                  <div className="flex items-center">
                    <div className="mr-4 text-2xl">
                      {category.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {category.title}
                    </h2>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {category.questions.map((faq, faqIndex) => (
                    <div 
                      key={faqIndex}
                      className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                      onClick={() => toggleAccordion(`${catIndex}-${faqIndex}`)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {faq.question}
                        </h3>
                        {activeIndex === `${catIndex}-${faqIndex}` ? (
                          <FaChevronUp className="text-blue-500" />
                        ) : (
                          <FaChevronDown className="text-blue-500" />
                        )}
                      </div>
                      
                      {activeIndex === `${catIndex}-${faqIndex}` && (
                        <div className="mt-4 text-gray-600 dark:text-gray-300">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Support CTA */}
          <div className="mt-16 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-2xl p-8 shadow-lg">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Still have questions?
              </h3>
              <p className="text-blue-100 mb-6">
                Our support team is ready to help you
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  to="/contact"
                  className="
                    px-6 py-3 rounded-lg font-medium
                    bg-white text-blue-600
                    hover:bg-gray-100
                    focus:outline-none focus:ring-4 focus:ring-blue-300 
                    transition-all transform hover:scale-[1.03] active:scale-[0.97] 
                    duration-200 ease-in-out shadow-lg hover:shadow-xl
                  "
                >
                  Contact Support
                </Link>
                <a
                  href="https://wa.me/+93786051709"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    px-6 py-3 rounded-lg font-medium
                    bg-green-500 text-white
                    hover:bg-green-600
                    focus:outline-none focus:ring-4 focus:ring-green-300 
                    transition-all transform hover:scale-[1.03] active:scale-[0.97] 
                    duration-200 ease-in-out shadow-lg hover:shadow-xl
                  "
                >
                  WhatsApp Chat
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}