import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ open, onClose }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { signup, login, error, loading } = useAuth();
  const [localError, setLocalError] = useState(null);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (mode === 'signup' && !form.name) {
      setLocalError('Name is required');
      return;
    }
    if (!form.email || !form.password) {
      setLocalError('Email and password are required');
      return;
    }
    const fn = mode === 'signup' ? signup : login;
    const result = await fn(form);
    if (result.success) {
      onClose();
      setForm({ name: '', email: '', password: '' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 bg-opacity-80">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in-up border border-indigo-100 dark:border-gray-800">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-indigo-600 text-2xl font-bold dark:text-gray-300" onClick={onClose}>&times;</button>
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 dark:from-indigo-700 dark:to-purple-900 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-2">
            {mode === 'login' ? <span>🔐</span> : <span>📝</span>}
          </div>
          <h2 className="text-2xl font-extrabold text-indigo-700 mb-1 tracking-tight">
            {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="text-gray-500 text-sm mb-2 dark:text-gray-300">
            {mode === 'login' ? 'Login to your StudySync-AI account' : 'Sign up to get started'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition"
            value={form.password}
            onChange={handleChange}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          {(localError || error) && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-lg py-2 px-3 animate-fade-in-up">{localError || error}</div>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-700 dark:to-purple-900 text-white font-bold shadow hover:from-indigo-600 hover:to-purple-600 dark:hover:from-indigo-800 dark:hover:to-purple-950 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg mt-4"
            disabled={loading}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-700 dark:text-gray-300">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button className="text-indigo-600 font-semibold hover:underline" onClick={() => setMode('signup')}>Sign Up</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="text-indigo-600 font-semibold hover:underline" onClick={() => setMode('login')}>Login</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 