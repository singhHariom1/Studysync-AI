import React from 'react';
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

export default function Header({ user, onAuthClick }) {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between transition-colors duration-300">
      <div className="flex flex-col">
        <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-200 tracking-tight flex items-center">
          <span className="mr-2">🎓</span> StudySync-AI
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium mt-1">
          Your all-in-one AI-powered study companion: solve doubts, get resources, and boost productivity.
        </span>
      </div>
      <div className="flex items-center gap-4">
        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="relative w-11 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span
            className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${theme === 'dark' ? 'translate-x-5' : ''}`}
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
          />
          <span className="absolute left-1.5 top-1.5 text-yellow-400 text-xs transition-opacity duration-300" style={{opacity: theme === 'dark' ? 0 : 1}}>☀️</span>
          <span className="absolute right-1.5 top-1.5 text-gray-500 dark:text-gray-200 text-xs transition-opacity duration-300" style={{opacity: theme === 'dark' ? 1 : 0}}>🌙</span>
        </button>
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg border border-indigo-200">
                {getInitials(user.name, user.email)}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-indigo-800 leading-tight">{user.name || user.email}</span>
                {user.name && (
                  <span className="text-xs text-gray-500 leading-tight">{user.email}</span>
                )}
              </div>
            </div>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-purple-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onClick={logout}
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onAuthClick}>Login / Signup</button>
        )}
      </div>
    </header>
  );
} 