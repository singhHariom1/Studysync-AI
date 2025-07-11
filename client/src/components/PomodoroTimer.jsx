import { useState, useEffect, useCallback } from 'react';
import { pomodoroAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [todayStats, setTodayStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [showWeeklyStats, setShowWeeklyStats] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const { user } = useAuth();

  const WORK_TIME = 25 * 60; // 25 minutes
  const BREAK_TIME = 5 * 60; // 5 minutes

  // Load today's stats on component mount
  const loadTodayStats = useCallback(async () => {
    try {
      console.log('Loading today stats for user:', user?.email);
      const response = await pomodoroAPI.getTodayStats();
      if (response.data.success) {
        console.log('Today stats received:', response.data.data);
        setTodayStats(response.data.data);
        setCycles(response.data.data.completedCycles);
      }
    } catch (error) {
      console.error('Failed to load Pomodoro stats:', error);
    }
  }, [user]);

  // Load weekly stats
  const loadWeeklyStats = useCallback(async () => {
    if (!user) return;
    
    setLoadingStats(true);
    try {
      console.log('Loading weekly stats for user:', user?.email);
      const response = await pomodoroAPI.getWeeklyStats();
      if (response.data.success) {
        console.log('Weekly stats received:', response.data.data);
        setWeeklyStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load weekly stats:', error);
    } finally {
      setLoadingStats(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadTodayStats();
      loadWeeklyStats();
    } else {
      // Clear stats when user logs out
      setTodayStats(null);
      setWeeklyStats([]);
      setCycles(0);
    }
  }, [user, loadTodayStats, loadWeeklyStats]);

  // Save session to database
  const saveSession = async (type, duration) => {
    if (!user) return; // Don't save if user is not logged in
    
    try {
      const response = await pomodoroAPI.addSession(type, duration);
      if (response.data.success) {
        // Update local state immediately for better UX
        setTodayStats(response.data.data);
        setCycles(response.data.data.completedCycles);
        // Reload weekly stats to keep them updated
        loadWeeklyStats();
      }
    } catch (error) {
      console.error('Failed to save Pomodoro session:', error);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const getProgress = () => {
    const totalTime = isBreak ? BREAK_TIME : WORK_TIME;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  // Get day name from date string
  const getDayName = (dateString) => {
    try {
      console.log('Processing date:', dateString);
      const date = new Date(dateString);
      console.log('Parsed date:', date);
      
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid Date';
      }
      
      // Convert to Indian timezone (UTC+5:30) for display
      const indiaOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
      const indiaTime = new Date(date.getTime() + indiaOffset);
      
      return indiaTime.toLocaleDateString('en-US', { weekday: 'short' });
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return 'Error';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      // Convert to Indian timezone (UTC+5:30) for display
      const indiaOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
      const indiaTime = new Date(date.getTime() + indiaOffset);
      
      return indiaTime.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Error';
    }
  };

  // Play notification sound
  const playNotification = useCallback(() => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.play();
    } catch (error) {
      console.log('Audio notification not supported');
    }
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = isBreak ? 'Break Finished!' : 'Work Session Finished!';
      const body = isBreak 
        ? 'Break time is over! Time to get back to work.' 
        : 'Great job! Take a 5-minute break to refresh.';
      
      new Notification(title, { body });
    }
  }, [isBreak]);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    playNotification();
    showBrowserNotification();
    setShowNotification(true);
    
    // Save the completed session
    const sessionType = isBreak ? 'break' : 'work';
    const sessionDuration = isBreak ? 5 : 25; // in minutes
    saveSession(sessionType, sessionDuration);
    
    // Stop the timer
    setIsRunning(false);
    
    // Set up the next session type but don't start it
    if (isBreak) {
      // Break finished, prepare work session
      setTimeLeft(WORK_TIME);
      setIsBreak(false);
    } else {
      // Work finished, prepare break session
      setTimeLeft(BREAK_TIME);
      setIsBreak(true);
    }
    
    setTimeout(() => setShowNotification(false), 3000);
  }, [isBreak, playNotification, showBrowserNotification]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleTimerComplete]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME);
  };

  const skipTimer = () => {
    handleTimerComplete();
  };

  return (
    <div className="max-w-md mx-auto p-6 animate-fade-in-up">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-purple-100 card-main">
        <h2 className="heading-main text-center mb-6">
          <span className="text-4xl align-middle mr-2">🍅</span> Pomodoro Timer
        </h2>
        
        {/* Statistics Toggle */}
        {user && (
          <div className="mb-4 flex justify-center">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setShowWeeklyStats(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !showWeeklyStats 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setShowWeeklyStats(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showWeeklyStats 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Weekly
              </button>
            </div>
          </div>
        )}
        
        {/* Today's Statistics */}
        {!showWeeklyStats && todayStats && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-blue-800">Today's Progress</h3>
              <button 
                onClick={loadTodayStats}
                className="text-blue-600 hover:text-blue-800 text-sm"
                title="Refresh stats"
              >
                🔄
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{todayStats.completedCycles}</div>
                <div className="text-sm text-blue-700">Cycles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{todayStats.totalWorkTime}</div>
                <div className="text-sm text-green-700">Work (min)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{todayStats.totalBreakTime}</div>
                <div className="text-sm text-orange-700">Break (min)</div>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Statistics */}
        {showWeeklyStats && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-purple-800">Weekly Progress</h3>
              <button 
                onClick={loadWeeklyStats}
                disabled={loadingStats}
                className="text-purple-600 hover:text-purple-800 text-sm disabled:opacity-50"
                title="Refresh weekly stats"
              >
                {loadingStats ? '⏳' : '🔄'}
              </button>
            </div>
            
            {weeklyStats.length > 0 ? (
              <div className="space-y-3">
                {weeklyStats.map((day, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">
                        {getDayName(day.date)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(day.date)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{day.completedCycles}</div>
                        <div className="text-xs text-blue-700">Cycles</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{day.totalWorkTime}</div>
                        <div className="text-xs text-green-700">Work (min)</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-600">{day.totalBreakTime}</div>
                        <div className="text-xs text-orange-700">Break (min)</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>No weekly data available yet</p>
                <p className="text-sm">Complete some Pomodoro sessions to see your weekly progress!</p>
              </div>
            )}
          </div>
        )}
        
        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className="relative w-48 h-48 mx-auto mb-6">
            {/* Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={isBreak ? "#10b981" : "#3b82f6"}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            {/* Timer Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <div className="text-4xl font-bold text-gray-800">
                  {formatTime(timeLeft)}
                </div>
                <div className={`text-lg font-medium ${isBreak ? 'text-green-600' : 'text-blue-600'}`}>
                  {isBreak ? 'Break Time' : 'Work Time'}
                </div>
              </div>
            </div>
          </div>
          {/* Cycles Counter */}
          <div className="text-sm text-gray-500">
            Completed Cycles: {cycles}
          </div>
        </div>
        {/* Controls */}
        <div className="flex gap-3 justify-center mb-6">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="btn-primary"
            >
              ▶️ Start
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="btn-secondary"
            >
              ⏸️ Pause
            </button>
          )}
          <button
            onClick={resetTimer}
            className="btn-secondary"
          >
            🔄 Reset
          </button>
          <button
            onClick={skipTimer}
            className="btn-primary"
          >
            ⏭️ Skip
          </button>
        </div>
        {/* Timer Info */}
        <div className="text-center text-sm text-gray-600">
          <p>⏱️ Work: 25 minutes | ☕ Break: 5 minutes</p>
          <p className="mt-2">
            {isBreak 
              ? 'Take a short break to refresh your mind!' 
              : 'Focus on your task. You can do it! 💪'
            }
          </p>
        </div>
        {/* Notification */}
        {showNotification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <span>{isBreak ? 'Break finished! Time to work!' : 'Work session finished! Take a break!'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer; 