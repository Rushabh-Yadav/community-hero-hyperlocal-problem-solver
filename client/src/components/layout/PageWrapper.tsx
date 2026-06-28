import React, { useState, useEffect } from 'react';
import Navbar from './Navbar.js';
import Sidebar from './Sidebar.js';

interface PageWrapperProps {
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  // Desktop screens (>= 1024px) start with sidebar open, mobile screens start closed
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark transition-colors duration-300">
      {/* Navbar always on top */}
      <Navbar onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1 relative">
        {/* Navigation Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Dynamic page content container */}
        <main 
          className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'ml-0'
          }`}
        >
          <div className="max-w-7xl mx-auto w-full animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
export default PageWrapper;
