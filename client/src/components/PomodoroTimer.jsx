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
  const { user } = useAuth();

  const WORK_TIME = 25 * 60; // 25 minutes
  const BREAK_TIME = 5 * 60; // 5 minutes

  // Load today's stats on component mount
  useEffect(() => {
    if (user) {
      loadTodayStats();
    }
  }, [user]);

  const loadTodayStats = async () => {
    try {
      const response = await pomodoroAPI.getTodayStats();
      if (response.data.success) {
        setTodayStats(response.data.data);
        setCycles(response.data.data.completedCycles);
      }
    } catch (error) {
      console.error('Failed to load Pomodoro stats:', error);
    }
  };

  // Save session to database
  const saveSession = async (type, duration) => {
    if (!user) return; // Don't save if user is not logged in
    
    try {
      const response = await pomodoroAPI.addSession(type, duration);
      if (response.data.success) {
        // Update local state immediately for better UX
        setTodayStats(response.data.data);
        setCycles(response.data.data.completedCycles);
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
    
    setTimeout(() => setShowNotification(false), 3000);
    
    if (isBreak) {
      // Break finished, start work session
      setTimeLeft(WORK_TIME);
      setIsBreak(false);
    } else {
      // Work finished, start break
      setTimeLeft(BREAK_TIME);
      setIsBreak(true);
    }
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
        
        {/* Today's Statistics */}
        {todayStats && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Today's Progress</h3>
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