// src/components/Footer.jsx

import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full mt-16 py-6 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} ALF Coach. Research-validated project learning for measurable student outcomes.</p>
        {/* We can add links to terms of service, privacy policy, etc. here later */}
      </div>
    </footer>
  );
}
