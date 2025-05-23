// src/components/Footer.js
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6">
      <div className="container mx-auto text-center">
        © {new Date().getFullYear()} NeuroBrief. All rights reserved.
      </div>
    </footer>
  );
}
