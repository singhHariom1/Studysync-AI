import React, { useState } from 'react';

const navItems = [
  { key: 'doubt', label: '🤔 AI Doubt Solver' },
  { key: 'syllabus', label: '📚 Syllabus Analyzer' },
  { key: 'resources', label: '🎓 AI Resource Recommender' },
  { key: 'tasks', label: '📋 Task Planner' },
  { key: 'pomodoro', label: '🍅 Pomodoro Timer' },
  { key: 'progress', label: '📊 Progress Tracker' },
];

const Navigation = ({ activeTab, setActiveTab }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-0 sm:px-6">
        {/* Hamburger for mobile */}
        <div className="flex items-center justify-between sm:hidden h-14">
          <button
            className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 absolute right-4"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
            )}
          </button>
        </div>
        {/* Mobile menu overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-30 bg-black/40 flex flex-col items-end sm:hidden">
            <div className="bg-white dark:bg-gray-900 w-64 h-full shadow-lg p-6 flex flex-col gap-2 animate-fade-in-up">
              <button
                className="self-end mb-4 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { setActiveTab(item.key); setMobileOpen(false); }}
                  className={`w-full text-left py-3 px-4 font-semibold text-base rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    activeTab === item.key
                      ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-gray-800'
                      : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <div className="flex-1 w-full" onClick={() => setMobileOpen(false)} />
          </div>
        )}
        {/* Desktop nav */}
        <div className="hidden sm:flex justify-center space-x-2 overflow-x-auto scrollbar-hide h-20 items-end">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`relative py-3 sm:py-5 px-4 sm:px-6 font-semibold text-base transition-all duration-300 whitespace-nowrap rounded-t-lg flex flex-col items-center h-full ${
                activeTab === item.key
                  ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-gray-800'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              style={{ minWidth: 100, minHeight: 48 }}
            >
              <span>{item.label}</span>
              {/* Animated underline */}
              <span
                className={`absolute left-0 bottom-0 h-1 w-full rounded-full transition-all duration-300 ${
                  activeTab === item.key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-x-100 opacity-100'
                    : 'scale-x-0 opacity-0'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 