// Footer.js

import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaGithub,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaHeart
} from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Define two arrays: one for “internal” links (use <Link>)
  // and one for “external or anchor” links (use <a>).
  const quickLinks = [
    { label: 'Home',        to: '/' },
    { label: 'About',       to: '#about',      isAnchor: true },
    { label: 'Services',    to: '#services',   isAnchor: true },
    { label: 'Dashboard',   to: '/dashboard' },
    { label: 'History',     to: '/history' },
    { label: 'Contact',     to: '#contact',    isAnchor: true }
  ];

  const resourceLinks = [
    { label: 'Documentation',  href: 'https://github.com/Omidcr77/neurobrief' },
    // { label: "API", href: "#" },
    // { label: "Blog", href: "#" },
    // { label: "Help Center", href: "" },
    // { label: "FAQ", href: "/" },
    { label: 'Privacy Policy', href: '#' }
  ];

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
          {/* Brand Column */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">NeuroBrief</h3>
            <p className="mb-6 max-w-xs">
              AI-powered summarization for busy professionals, students, and lifelong learners.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: <FaGithub />,     url: 'https://github.com/omidcr77' },
                { icon: <FaFacebookF />,  url: 'https://www.facebook.com/omid.ps2' },
                { icon: <FaTwitter />,    url: 'https://x.com/xai' },
                { icon: <FaLinkedinIn />, url: 'https://www.linkedin.com/company/randompy' }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700
                    flex items-center justify-center
                    text-gray-300 hover:text-white
                    transition-all shadow-md
                  "
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  {link.isAnchor ? (
                    // For in-page anchors, still use a normal <a>
                    <a
                      href={link.to}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    // Otherwise, use React Router's <Link>
                    <Link
                      to={link.to}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {resourceLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors"
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            © {currentYear} NeuroBrief. All rights reserved.
          </div>
          <div className="flex items-center text-sm">
            Made with <FaHeart className="text-red-500 mx-1" /> by Omid
          </div>
        </div>
      </div>
    </footer>
  );
}
