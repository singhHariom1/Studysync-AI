import { useState, useEffect } from 'react';
import api from '../utils/api';

const ProgressTracker = () => {
  const [progress, setProgress] = useState({
    todayCompleted: 0,
    totalTasks: 0,
    percentage: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch progress data
  const fetchProgress = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get('/tasks/progress');
      setProgress(response.data);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  // Load progress on component mount
  useEffect(() => {
    fetchProgress();
  }, []);

  // Get motivational message based on progress
  const getMotivationalMessage = () => {
    const { percentage, todayCompleted } = progress;
    
    if (percentage === 0) {
      return {
        message: "Ready to start your productive day? Let's get those tasks done! 💪",
        emoji: "🚀",
        color: "text-blue-600"
      };
    } else if (percentage < 25) {
      return {
        message: "Great start! Every completed task brings you closer to your goals! 🌟",
        emoji: "🌟",
        color: "text-green-600"
      };
    } else if (percentage < 50) {
      return {
        message: "You're making excellent progress! Keep up the momentum! 🔥",
        emoji: "🔥",
        color: "text-orange-600"
      };
    } else if (percentage < 75) {
      return {
        message: "You're more than halfway there! You're doing amazing! ⭐",
        emoji: "⭐",
        color: "text-purple-600"
      };
    } else if (percentage < 100) {
      return {
        message: "Almost there! You're so close to completing all your tasks! 🎯",
        emoji: "🎯",
        color: "text-indigo-600"
      };
    } else {
      return {
        message: "Incredible! You've completed all your tasks for today! 🎉",
        emoji: "🎉",
        color: "text-green-600"
      };
    }
  };

  // Get progress color based on percentage
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    if (percentage >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get progress bar color
  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const motivational = getMotivationalMessage();

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in-up">
      <div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-purple-100 dark:border-gray-800 card-main">
        <h2 className="heading-main text-center mb-6 text-gray-800 dark:text-indigo-200">
          <span className="text-3xl mr-2">📈</span> Daily Progress Tracker
        </h2>
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in-up">
            <p className="text-red-600 flex items-center">
              <span className="text-xl mr-2">⚠️</span> {error}
            </p>
          </div>
        )}
        {loading ? (
          <div className="text-center py-8">
            <div className="spinner w-8 h-8 border-purple-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading progress...</p>
          </div>
        ) : (
          <>
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Today's Completed Tasks */}
              <div className="bg-green-50 dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">✅</div>
                <div className="text-2xl font-bold text-green-600">
                  {progress.todayCompleted}
                </div>
                <div className="text-sm text-green-700">
                  Tasks Completed Today
                </div>
              </div>
              {/* Total Tasks */}
              <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">📋</div>
                <div className="text-2xl font-bold text-blue-600">
                  {progress.totalTasks}
                </div>
                <div className="text-sm text-blue-700">
                  Total Tasks
                </div>
              </div>
              {/* Completion Rate */}
              <div className="bg-purple-50 dark:bg-gray-800 border border-purple-200 dark:border-purple-800 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">📈</div>
                <div className={`text-2xl font-bold ${getProgressColor(progress.percentage)}`}>
                  {progress.percentage}%
                </div>
                <div className="text-sm text-purple-700">
                  Completion Rate
                </div>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Today's Progress</span>
                <span className={`text-sm font-bold ${getProgressColor(progress.percentage)}`}>
                  {progress.percentage}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(progress.percentage)}`}
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
            </div>
            {/* Motivational Message */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{motivational.emoji}</div>
              <p className={`text-xl font-medium ${motivational.color}`}>
                {motivational.message}
              </p>
            </div>
            {/* Progress Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Today's Achievement */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="heading-section text-blue-800 dark:text-indigo-200 mb-3">
                  🎯 Today's Achievement
                </h3>
                {progress.todayCompleted > 0 ? (
                  <div>
                    <p className="text-blue-700 mb-2">
                      You've completed <strong>{progress.todayCompleted}</strong> task{progress.todayCompleted !== 1 ? 's' : ''} today!
                    </p>
                    {progress.todayCompleted >= 3 && (
                      <p className="text-sm text-blue-600">
                        🌟 That's an excellent productivity streak!
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-blue-700">
                    Ready to start your productive journey? Create your first task and begin achieving your goals!
                  </p>
                )}
              </div>
              {/* Tips for Success */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h3 className="heading-section text-green-800 dark:text-indigo-200 mb-3">
                  💡 Tips for Success
                </h3>
                <ul className="text-green-700 text-sm space-y-2">
                  <li>• Break large tasks into smaller, manageable chunks</li>
                  <li>• Use the Pomodoro Timer for focused work sessions</li>
                  <li>• Prioritize tasks by importance and urgency</li>
                  <li>• Celebrate small wins to stay motivated</li>
                </ul>
              </div>
            </div>
            {/* Refresh Button */}
            <div className="text-center mt-8">
              <button
                onClick={fetchProgress}
                className="btn-primary"
              >
                🔄 Refresh Progress
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker; 