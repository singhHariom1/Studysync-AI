import { useState } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import AIDoubtSolver from './components/AIDoubtSolver';
import SyllabusUploader from './components/SyllabusUploader';
import ResourceRecommender from './components/ResourceRecommender';
import TaskPlanner from './components/TaskPlanner';
import PomodoroTimer from './components/PomodoroTimer';
import ProgressTracker from './components/ProgressTracker';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import { ThemeProvider } from './context/ThemeContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState('doubt');
  const [extractedTopics, setExtractedTopics] = useState([]);
  const [pendingTopics, setPendingTopics] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [topicLimitMsg, setTopicLimitMsg] = useState('');
  const { user, loading } = useAuth();

  // Only these tabs require authentication
  const protectedTabs = ['tasks', 'progress'];

  // Function to handle topics from syllabus uploader
  const handleTopicsExtracted = (topics) => {
    setExtractedTopics(topics);
  };

  // Hybrid: send topics to resource recommender, limit to 10
  const handleSendToResourceRecommender = (topics) => {
    if (topics.length > 10) {
      setTopicLimitMsg('Only the first 10 topics will be used for resource recommendations.');
    } else {
      setTopicLimitMsg('');
    }
    setPendingTopics(topics.slice(0, 10));
    setActiveTab('resources');
  };

  // Handle tab change, show auth modal if protected and not logged in
  const handleTabChange = (tab) => {
    if (protectedTabs.includes(tab) && !user) {
      setShowAuth(true);
    } else {
      setActiveTab(tab);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">
      <Header user={user} onAuthClick={() => setShowAuth(true)} onHeaderHomeClick={() => setActiveTab('doubt')} />
      <Navigation activeTab={activeTab} setActiveTab={handleTabChange} />
      <main className="flex-1 py-6 xs:py-8 sm:py-10 px-2 xs:px-3 sm:px-6 md:px-8 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-full sm:max-w-5xl mx-auto animate-fade-in-up">
          {activeTab === 'doubt' && <AIDoubtSolver />}
          {activeTab === 'syllabus' && (
            <SyllabusUploader
              onTopicsExtracted={handleTopicsExtracted}
              onSendToResourceRecommender={handleSendToResourceRecommender}
            />
          )}
          {activeTab === 'resources' && (
            <>
              {topicLimitMsg && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-center animate-fade-in-up">
                  {topicLimitMsg}
                </div>
              )}
              <ResourceRecommender
                topics={pendingTopics.length > 0 ? pendingTopics : extractedTopics}
                onTopicsConsumed={() => setPendingTopics([])}
              />
            </>
          )}
          {activeTab === 'tasks' && user && <TaskPlanner />}
          {activeTab === 'pomodoro' && <PomodoroTimer />}
          {activeTab === 'progress' && user && <ProgressTracker />}
        </div>
      </main>
      <Footer />
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
