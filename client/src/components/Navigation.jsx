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
    <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-center space-x-2 overflow-x-auto scrollbar-hide h-20 items-end">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`relative py-5 px-6 font-semibold text-base transition-all duration-300 whitespace-nowrap rounded-t-lg flex flex-col items-center h-full ${
                activeTab === item.key
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
              style={{ minWidth: 140 }}
            >
              <span>{item.label}</span>
              {/* Animated underline */}
              <span
                className={`absolute left-1/2 -translate-x-1/2 bottom-0 h-1 w-10 rounded-full transition-all duration-300 ${
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