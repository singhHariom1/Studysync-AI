import { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

function cleanTopic(topic) {
  // Remove leading numbers, dots, whitespace, markdown, and trailing colons
  let cleaned = topic.replace(/^\d+\.\s*/, '');
  cleaned = cleaned.replace(/[*_]+/g, '').replace(/:$/, '').trim();
  return cleaned;
}

const ResourceRecommender = ({ topics = [], onTopicsConsumed }) => {
  const [resources, setResources] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedTopics, setGeneratedTopics] = useState([]);
  const [input, setInput] = useState('');
  const [hasPrefilled, setHasPrefilled] = useState(false);

  // Only pre-fill if input is empty and topics are new
  useEffect(() => {
    if (topics && topics.length > 0 && !input.trim() && !hasPrefilled) {
      setInput(topics.join('\n'));
      setHasPrefilled(true);
      if (onTopicsConsumed) onTopicsConsumed();
    }
    // eslint-disable-next-line
  }, [topics]);

  const handleGenerateResources = async () => {
    const topicList = input
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean);
    if (!topicList.length) {
      setError('Please enter at least one topic.');
      return;
    }
    if (topicList.length > 10) {
      setError('You can only request resources for up to 10 topics at a time.');
      return;
    }
    setLoading(true);
    setError('');
    setResources({});
    try {
      const response = await axios.post(`${API}/resources/suggest`, { topics: topicList });
      setResources(response.data.resources);
      setGeneratedTopics(topicList);
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
    setInput('');
    setHasPrefilled(false);
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
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
        >
          {title}
        </a>
      );
    }
    return resource;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in-up">
      <div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-green-100 dark:border-gray-800 card-main">
        <h2 className="heading-main text-center mb-2 text-gray-800 dark:text-gray-100">
          <span className="text-4xl mr-2">🎓</span> AI Resource Recommender
        </h2>
        <p className="text-gray-500 dark:text-gray-200 text-center mb-8 text-lg">
          Get personalized learning resources for your study topics
        </p>
        {/* Topics Input */}
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-100 font-medium mb-2 text-center">Enter topics (one per line or comma separated):</label>
          <textarea
            className="w-full min-h-[90px] max-h-40 p-3 rounded-lg border border-green-200 dark:border-green-800 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none bg-green-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition resize-y"
            placeholder={`e.g.\n• Operating Systems\n• DBMS\n• Machine Learning`}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in-up">
            <p className="text-red-600 flex items-center">
              <span className="text-xl mr-2">⚠️</span> {error}
            </p>
          </div>
        )}
        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={handleGenerateResources}
            disabled={!input.trim() || loading}
            className={`btn-primary ${!input.trim() || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          {(input.trim() || Object.keys(resources).length > 0) && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="btn-secondary"
              aria-label="Reset"
            >
              🔄 Reset
            </button>
          )}
        </div>
        {/* Resources Display */}
        {Object.keys(resources).length > 0 && (
          <div className="mt-8 animate-fade-in-up">
            <h3 className="heading-section text-center mb-6 text-gray-800 dark:text-indigo-200">
              📚 Recommended Learning Resources
            </h3>
            <div className="grid gap-6">
              {generatedTopics.map((topic, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 border border-green-200 dark:border-green-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                        {cleanTopic(topic)}
                      </h4>
                    </div>
                  </div>
                  {/* Resources for this topic */}
                  <div className="ml-14">
                    <div className="grid gap-3">
                      {resources[topic] && resources[topic].map((resource, resourceIndex) => (
                        <div
                          key={resourceIndex}
                          className="bg-white dark:bg-gray-800 border border-green-100 dark:border-green-800 rounded-lg p-4 hover:border-green-300 dark:hover:border-green-500 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 text-xl">
                              {resource.includes('YouTube') ? '🎥' : '📘'}
                            </div>
                            <div className="flex-1">
                              {/* Clean fallback resource display */}
                              {resource.includes('Fallback Resource') ? (
                                <a
                                  href={`https://youtube.com/results?search_query=${encodeURIComponent(cleanTopic(topic))}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
                                >
                                  Fallback Resource - Search {cleanTopic(topic)} on YouTube
                                </a>
                              ) : (
                                formatResourceLink(resource)
                              )}
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
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ✨ Generated {Object.keys(resources).length} sets of resources using AI
              </p>
            </div>
          </div>
        )}
        {/* Empty State */}
        {input.trim().length === 0 && Object.keys(resources).length === 0 && (
          <div className="text-center py-12 animate-fade-in-up">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No Topics Available
            </h3>
            <p className="text-gray-500">
              Enter topics above or upload a syllabus to extract topics and generate learning resources
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceRecommender; 