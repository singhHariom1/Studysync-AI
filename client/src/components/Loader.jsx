import React from 'react';

const Loader = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <div className="relative w-16 h-16">
      <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-blue-400 to-cyan-300 opacity-30 blur-lg"></span>
      <svg className="w-16 h-16 animate-spin" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="spinner-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle
          cx="32"
          cy="32"
          r="24"
          stroke="url(#spinner-gradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="120 60"
        />
      </svg>
    </div>
    <span className="mt-4 text-lg font-semibold text-indigo-600 dark:text-indigo-300 animate-pulse">Loading...</span>
  </div>
);

export default Loader; 