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

function App() {
  const [activeTab, setActiveTab] = useState('doubt');
  const [extractedTopics, setExtractedTopics] = useState([]);

  // Function to handle topics from syllabus uploader
  const handleTopicsExtracted = (topics) => {
    setExtractedTopics(topics);
    // Automatically switch to resources tab when topics are extracted
    setActiveTab('resources');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 py-10 px-2 sm:px-6 md:px-8 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto animate-fade-in-up">
          {activeTab === 'doubt' && <AIDoubtSolver />}
          {activeTab === 'syllabus' && (
            <SyllabusUploader onTopicsExtracted={handleTopicsExtracted} />
          )}
          {activeTab === 'resources' && (
            <ResourceRecommender topics={extractedTopics} />
          )}
          {activeTab === 'tasks' && <TaskPlanner />}
          {activeTab === 'pomodoro' && <PomodoroTimer />}
          {activeTab === 'progress' && <ProgressTracker />}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
