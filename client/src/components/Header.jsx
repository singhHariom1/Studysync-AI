const Header = () => {
  return (
    <header className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-xl animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col items-center">
        <div className="bg-white/20 backdrop-blur-lg rounded-xl shadow-lg px-8 py-6 w-full md:w-auto flex flex-col items-center border border-blue-100">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 text-center drop-shadow-lg font-display">
            <span className="mr-2">🎓</span> StudySync AI
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-medium text-center mb-2 drop-shadow-sm">
            Your Complete Learning Companion
          </p>
          <div className="flex justify-center items-center mt-2 space-x-2 text-white/80 text-sm">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              AI-Powered
            </span>
            <span className="text-white/60">•</span>
            <span>Smart Learning</span>
            <span className="text-white/60">•</span>
            <span>Productivity Focused</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 