import React from 'react';
import { 
  FaGithub, 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn,
  FaHeart
} from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
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
                { icon: <FaGithub />, url: "https://github.com/omidcr77" },
                { icon: <FaFacebookF />, url: "https://www.facebook.com/omid.ps2" },
                { icon: <FaTwitter />, url: "https://x.com/xai" },
                { icon: <FaLinkedinIn />, url: "https://www.linkedin.com/company/randompy" },
              ].map((social, index) => (
                <a
                  key={index}
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
          
          {/* Links Column */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: "Home", url: "/" },
                { label: "About", url: "#about" },
                { label: "Services", url: "#services" },
                { label: "Dashboard", url: "/dashboard" },
                { label: "History", url: "/history" },
                { label: "Contact", url: "#contact" },
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Resources Column */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {[
                { label: "Documentation", url: "https://github.com/Omidcr77/neurobrief" },
                // { label: "API", url: "#" },
                // { label: "Blog", url: "#" },
                // { label: "Help Center", url: "" },
                // { label: "FAQ", url: "/" },
                { label: "Privacy Policy", url: "#" },
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className="hover:text-white transition-colors"
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