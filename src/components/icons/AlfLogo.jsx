// Shared ALF logo component - Blue stacked papers icon
import React from 'react';

export const AlfLogo = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Back layer */}
    <rect x="12" y="14" width="28" height="30" rx="2" fill="#60A5FA" opacity="0.5"/>
    {/* Middle layer */}
    <rect x="10" y="10" width="28" height="30" rx="2" fill="#3B82F6" opacity="0.7"/>
    {/* Front layer */}
    <rect x="8" y="6" width="28" height="30" rx="2" fill="#2563EB"/>
    {/* Document lines */}
    <line x1="12" y1="12" x2="32" y2="12" stroke="white" strokeWidth="2" opacity="0.9"/>
    <line x1="12" y1="17" x2="28" y2="17" stroke="white" strokeWidth="2" opacity="0.9"/>
    <line x1="12" y1="22" x2="30" y2="22" stroke="white" strokeWidth="2" opacity="0.9"/>
    <line x1="12" y1="27" x2="26" y2="27" stroke="white" strokeWidth="2" opacity="0.9"/>
  </svg>
);

export default AlfLogo;