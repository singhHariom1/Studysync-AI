import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Pomodoro session tracking functions
export const pomodoroAPI = {
  // Get today's statistics
  getTodayStats: () => api.get('/pomodoro/stats/today'),
  
  // Add a completed session
  addSession: (type, duration) => api.post('/pomodoro/session', { type, duration }),
  
  // Get weekly statistics
  getWeeklyStats: () => api.get('/pomodoro/stats/weekly')
};

export default api; 