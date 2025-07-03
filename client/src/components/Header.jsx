import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function getInitials(name, email) {
  if (name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return '?';
}

const navItems = [
  { key: 'doubt', label: '🤔 AI Doubt Solver' },
  { key: 'syllabus', label: '📚 Syllabus Analyzer' },
  { key: 'resources', label: '🎓 AI Resource Recommender' },
  { key: 'tasks', label: '📋 Task Planner' },
  { key: 'pomodoro', label: '🍅 Pomodoro Timer' },
  { key: 'progress', label: '📊 Progress Tracker' },
];

export default function Header({ user, onAuthClick, onHeaderHomeClick, activeTab, setActiveTab }) {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const profileBtnRef = useRef(null);

  // Close dropdown on logout
  const handleLogout = () => {
    logout();
    setDetailsOpen(false);
  };

  // Close dropdown if clicking outside
  React.useEffect(() => {
    if (!detailsOpen) return;
    function handleClick(e) {
      if (
        profileBtnRef.current &&
        !profileBtnRef.current.contains(e.target) &&
        !document.getElementById('user-details-dropdown')?.contains(e.target)
      ) {
        setDetailsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [detailsOpen]);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm transition-colors duration-300 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 flex items-center justify-between h-16 relative">
        {/* Left: App name (clickable) */}
        <button
          className="text-lg sm:text-2xl font-bold text-indigo-700 dark:text-indigo-200 tracking-tight flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          onClick={onHeaderHomeClick}
          aria-label="Go to Home"
        >
          <span className="mr-2 hidden sm:inline">🎓</span> StudySync-AI
        </button>
        {/* Right: Toggle + Profile */}
        <div className="flex items-center gap-2 relative">
          {/* Dark/Light mode toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <span className="text-yellow-400 text-xl">☀️</span>
            ) : (
              <span className="text-gray-700 dark:text-gray-200 text-xl">🌙</span>
            )}
          </button>
          {/* Profile button */}
          <button
            ref={profileBtnRef}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg shadow hover:from-indigo-600 hover:to-purple-600 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            onClick={() => setDetailsOpen((v) => !v)}
            aria-label="Show user details"
          >
            {user ? (
              <span>{getInitials(user.name, user.email)}</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
          {/* User Details Dropdown */}
          {detailsOpen && (
            <div
              id="user-details-dropdown"
              className="absolute right-0 top-12 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 flex flex-col items-center gap-4 z-50 border border-gray-100 dark:border-gray-800 animate-fade-in-up"
              style={{ minWidth: 220 }}
            >
              <div className="absolute -top-2 right-6 w-4 h-4 bg-white dark:bg-gray-900 border-l border-t border-gray-100 dark:border-gray-800 rotate-45 z-10" />
              {user ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl border border-indigo-200 mb-2">
                    {getInitials(user.name, user.email)}
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-indigo-800 dark:text-indigo-200 text-lg">{user.name || user.email}</div>
                    {user.name && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    )}
                  </div>
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-purple-600 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 mt-2"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button className="btn btn-primary w-full" onClick={onAuthClick}>Login / Signup</button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 