// src/components/ui/Toaster.jsx

import React from 'react';
import { Toaster as Sonner } from 'sonner';

// This component provides a clean, minimalist toast notification system.
// It uses the 'sonner' library, which is highly customizable and integrates well with Tailwind CSS.

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-neutral-900 group-[.toaster]:border-neutral-200 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-neutral-500',
          actionButton:
            'group-[.toast]:bg-primary-600 group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-500',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
