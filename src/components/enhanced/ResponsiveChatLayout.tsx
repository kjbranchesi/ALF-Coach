import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Maximize2,
  Minimize2,
  RotateCw,
  Tablet,
  Smartphone,
  Monitor
} from 'lucide-react';

interface ResponsiveChatLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

interface DeviceConfig {
  breakpoint: number;
  columns: 1 | 2 | 3;
  sidebarBehavior: 'overlay' | 'push' | 'hidden' | 'persistent';
  chatLayout: 'stacked' | 'sidebar' | 'full';
  inputPosition: 'bottom' | 'floating' | 'inline';
  headerBehavior: 'sticky' | 'scroll' | 'compact';
}

const deviceConfigs: Record<string, DeviceConfig> = {
  mobile: {
    breakpoint: 768,
    columns: 1,
    sidebarBehavior: 'overlay',
    chatLayout: 'stacked',
    inputPosition: 'bottom',
    headerBehavior: 'compact'
  },
  tablet: {
    breakpoint: 1024,
    columns: 2,
    sidebarBehavior: 'overlay',
    chatLayout: 'sidebar',
    inputPosition: 'floating',
    headerBehavior: 'sticky'
  },
  desktop: {
    breakpoint: Infinity,
    columns: 3,
    sidebarBehavior: 'persistent',
    chatLayout: 'sidebar',
    inputPosition: 'inline',
    headerBehavior: 'sticky'
  }
};

export function ResponsiveChatLayout({
  children,
  sidebar,
  header,
  footer,
  className = ''
}: ResponsiveChatLayoutProps) {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Detect device and orientation
  useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determine device type
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
      
      // Determine orientation
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    updateDevice();
    window.addEventListener('resize', updateDevice);
    window.addEventListener('orientationchange', updateDevice);
    
    return () => {
      window.removeEventListener('resize', updateDevice);
      window.removeEventListener('orientationchange', updateDevice);
    };
  }, []);

  const config = deviceConfigs[deviceType];
  
  // iPad-specific optimizations
  const isIPad = deviceType === 'tablet';
  const isIPadPortrait = isIPad && orientation === 'portrait';
  const isIPadLandscape = isIPad && orientation === 'landscape';

  // Layout classes based on device
  const getLayoutClasses = () => {
    const base = 'min-h-screen bg-gray-50';
    
    if (deviceType === 'mobile') {
      return `${base} flex flex-col`;
    }
    
    if (isIPadPortrait) {
      return `${base} flex flex-col max-w-full`;
    }
    
    if (isIPadLandscape) {
      return `${base} grid grid-cols-12 gap-0`;
    }
    
    // Desktop
    return `${base} grid grid-cols-12 gap-6 p-6`;
  };

  const getChatAreaClasses = () => {
    if (deviceType === 'mobile') {
      return 'flex-1 flex flex-col min-h-0';
    }
    
    if (isIPadPortrait) {
      return 'flex-1 flex flex-col min-h-0 max-h-screen';
    }
    
    if (isIPadLandscape) {
      return `col-span-${sidebarOpen ? '8' : '12'} flex flex-col min-h-screen`;
    }
    
    // Desktop
    return `col-span-${sidebar ? '8' : '12'} flex flex-col min-h-0`;
  };

  const getSidebarClasses = () => {
    if (!sidebar) return '';
    
    if (deviceType === 'mobile' || isIPadPortrait) {
      return `
        fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `;
    }
    
    if (isIPadLandscape) {
      return `
        col-span-4 bg-white border-r border-gray-200 transition-all duration-300
        ${sidebarOpen ? 'block' : 'hidden'}
      `;
    }
    
    // Desktop
    return 'col-span-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6';
  };

  return (
    <div className={`${getLayoutClasses()} ${className}`}>
      {/* Mobile/Tablet Header */}
      {(deviceType === 'mobile' || isIPad) && (
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`
            bg-white border-b border-gray-200 p-4 flex items-center justify-between z-40
            ${config.headerBehavior === 'sticky' ? 'sticky top-0' : ''}
            ${isIPad ? 'px-6' : ''}
          `}
        >
          {sidebar && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
          
          <div className="flex-1 flex justify-center">
            {header}
          </div>
          
          {/* Device indicators and controls */}
          <div className="flex items-center gap-2">
            {isIPad && (
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Toggle fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}
            
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {deviceType === 'mobile' && <Smartphone className="w-4 h-4" />}
              {deviceType === 'tablet' && <Tablet className="w-4 h-4" />}
              {deviceType === 'desktop' && <Monitor className="w-4 h-4" />}
              <span className="capitalize">{orientation}</span>
            </div>
          </div>
        </motion.header>
      )}

      {/* Sidebar */}
      {sidebar && (
        <>
          <div className={getSidebarClasses()}>
            {sidebar}
          </div>
          
          {/* Overlay for mobile/tablet */}
          {(deviceType === 'mobile' || isIPadPortrait) && sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </>
      )}

      {/* Main Chat Area */}
      <main className={getChatAreaClasses()}>
        {/* Desktop Header */}
        {deviceType === 'desktop' && header && (
          <div className="mb-6">
            {header}
          </div>
        )}
        
        {/* Chat Content */}
        <div className={`
          flex-1 flex flex-col min-h-0
          ${deviceType === 'mobile' ? 'px-4' : ''}
          ${isIPad ? 'px-6' : ''}
          ${deviceType === 'desktop' ? 'bg-white rounded-lg shadow-sm border border-gray-200' : ''}
        `}>
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className={`
            mt-auto
            ${deviceType === 'mobile' ? 'p-4 border-t border-gray-200 bg-white' : ''}
            ${isIPad ? 'p-6 border-t border-gray-200 bg-white' : ''}
            ${deviceType === 'desktop' ? 'mt-6' : ''}
          `}>
            {footer}
          </div>
        )}
      </main>

      {/* iPad-specific touch optimizations */}
      {isIPad && (
        <style jsx>{`
          /* Optimize touch targets for iPad */
          button, .touch-target {
            min-height: 44px;
            min-width: 44px;
          }
          
          /* Improve scrolling on iPad */
          .scroll-area {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
          }
          
          /* Prevent zooming on input focus */
          input, textarea, select {
            font-size: 16px;
          }
          
          /* iPad-specific spacing */
          .ipad-spacing {
            padding: ${isIPadPortrait ? '1rem' : '1.5rem'};
          }
          
          /* Landscape optimizations */
          @media screen and (orientation: landscape) and (max-width: 1024px) {
            .chat-messages {
              max-height: calc(100vh - 200px);
            }
          }
          
          /* Portrait optimizations */
          @media screen and (orientation: portrait) and (max-width: 1024px) {
            .chat-messages {
              max-height: calc(100vh - 300px);
            }
          }
        `}</style>
      )}
    </div>
  );
}

// iPad-optimized input component
export function IPadOptimizedInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Share your thoughts...",
  disabled = false
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className={`
      transition-all duration-200
      ${isFocused ? 'transform scale-102' : ''}
    `}>
      <div className="flex items-end gap-3 p-4 bg-white border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none border-none outline-none bg-transparent text-gray-900 placeholder-gray-500"
          style={{
            fontSize: '16px', // Prevents zoom on iPad
            minHeight: '44px'  // Touch-friendly height
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
        
        <button
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Touch-optimized message component for iPad
export function TouchOptimizedMessage({
  message,
  isUser,
  onAction
}: {
  message: any;
  isUser: boolean;
  onAction?: (action: string) => void;
}) {
  return (
    <div className={`
      flex gap-4 mb-6
      ${isUser ? 'justify-end' : 'justify-start'}
    `}>
      <div className={`
        max-w-lg p-4 rounded-xl
        ${isUser ? 
          'bg-blue-600 text-white ml-auto' : 
          'bg-white border border-gray-200'
        }
      `}>
        <div className="prose prose-sm max-w-none">
          {message.content}
        </div>
        
        {/* Touch-friendly action buttons */}
        {message.buttons && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.buttons.map((button: string, i: number) => (
              <button
                key={i}
                onClick={() => onAction?.(button)}
                className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                style={{ minHeight: '44px' }}
              >
                {button}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}