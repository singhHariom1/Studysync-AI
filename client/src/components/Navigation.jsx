const navItems = [
  { key: 'doubt', label: '🤔 AI Doubt Solver' },
  { key: 'syllabus', label: '📚 Syllabus Analyzer' },
  { key: 'resources', label: '🎓 AI Resource Recommender' },
  { key: 'tasks', label: '📋 Task Planner' },
  { key: 'pomodoro', label: '🍅 Pomodoro Timer' },
  { key: 'progress', label: '📊 Progress Tracker' },
];

const Navigation = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-center space-x-2 overflow-x-auto scrollbar-hide h-20 items-end">
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