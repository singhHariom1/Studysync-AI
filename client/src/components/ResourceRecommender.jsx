import { useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

const ResourceRecommender = ({ topics = [] }) => {
  const [resources, setResources] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedTopics, setGeneratedTopics] = useState([]);

  const handleGenerateResources = async () => {
    if (!topics || topics.length === 0) {
      setError('No topics available. Please extract topics from a syllabus first.');
      return;
    }
    setLoading(true);
    setError('');
    setResources({});
    try {
      const response = await axios.post(`${API}/api/resources/suggest`, { topics });
      setResources(response.data.resources);
      setGeneratedTopics(topics);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate learning resources');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResources({});
    setError('');
    setGeneratedTopics([]);
  };

  // Function to convert markdown links to clickable HTML
  const formatResourceLink = (resource) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
    const match = resource.match(linkRegex);
    if (match) {
      const [, title, url] = match;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline transition-colors"
        >
          {title}
        </a>
      );
    }
    return resource;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in-up">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-green-100 card-main">
        <h2 className="heading-main text-center mb-2">
          <span className="text-4xl mr-2">🎓</span> AI Resource Recommender
        </h2>
        <p className="text-gray-500 text-center mb-8 text-lg">
          Get personalized learning resources for your extracted study topics
        </p>
        {/* Topics Summary */}
        {topics.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center animate-fade-in-up">
            <p className="text-green-800 font-medium">
              📚 {topics.length} topics available for resource generation
            </p>
          </div>
        )}
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in-up">
            <p className="text-red-600 flex items-center">
              <span className="text-xl mr-2">⚠️</span> {error}
            </p>
          </div>
        )}
        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={handleGenerateResources}
            disabled={!topics.length || loading}
            className={`btn-primary ${!topics.length || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Generate Learning Resources"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="spinner w-4 h-4"></div>
                Generating Resources...
              </span>
            ) : (
              <span className="flex items-center gap-2">🎯 Generate Learning Resources</span>
            )}
          </button>
          {Object.keys(resources).length > 0 && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="btn-secondary"
              aria-label="Reset"
            >
              Reset
            </button>
          )}
        </div>
        {/* Resources Display */}
        {Object.keys(resources).length > 0 && (
          <div className="mt-8 animate-fade-in-up">
            <h3 className="heading-section text-center mb-6">
              📖 Recommended Learning Resources
            </h3>
            <div className="grid gap-6">
              {generatedTopics.map((topic, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">
                        {topic.replace(/^\d+\.\s*/, '')}
                      </h4>
                    </div>
                  </div>
                  {/* Resources for this topic */}
                  <div className="ml-14">
                    <div className="grid gap-3">
                      {resources[topic] && resources[topic].map((resource, resourceIndex) => (
                        <div
                          key={resourceIndex}
                          className="bg-white border border-green-100 rounded-lg p-4 hover:border-green-300 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 text-xl">
                              {resource.includes('YouTube') ? '🎥' : '📘'}
                            </div>
                            <div className="flex-1">
                              {formatResourceLink(resource)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                ✨ Generated {Object.keys(resources).length} sets of resources using AI
              </p>
            </div>
          </div>
        )}
        {/* Empty State */}
        {topics.length === 0 && Object.keys(resources).length === 0 && (
          <div className="text-center py-12 animate-fade-in-up">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No Topics Available
            </h3>
            <p className="text-gray-500">
              Upload a syllabus first to extract topics and generate learning resources
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceRecommender; 