import { useState } from 'react';
import axios from 'axios';
import { formatMarkdown } from '../utils/markdownFormatter';

const AIDoubtSolver = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const result = await axios.post('/api/gemini/ask', { question });
      setResponse(result.data.response);
    } catch (err) {
      console.error('AI error:', err);
      setError(err.response?.data?.error || 'Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuestion('');
    setResponse('');
    setError('');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 animate-fade-in-up">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-blue-100 card-main">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🤔</div>
          <h2 className="heading-main mb-2">
            AI Doubt Solver
          </h2>
          <p className="text-gray-500 text-lg">
            Ask any academic question and get instant AI-powered explanations
          </p>
        </div>
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in-up">
            <p className="flex items-center text-red-600">
              <span className="text-xl mr-2">⚠️</span> {error}
            </p>
          </div>
        )}
        {/* Question Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-6">
            <label htmlFor="question" className="block text-sm font-semibold text-gray-700 mb-3">
              What's your question?
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about your studies, concepts, or academic topics..."
              className="input-field min-h-[120px] resize-none"
              disabled={loading}
            />
          </div>
          <div className="flex gap-4 justify-center">
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className={`btn-primary ${loading || !question.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="spinner w-4 h-4"></div>
                  Thinking...
                </span>
              ) : (
                <span className="flex items-center gap-2">🧠 Ask AI</span>
              )}
            </button>
            {(question || response) && (
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary"
              >
                🔄 Reset
              </button>
            )}
          </div>
        </form>
        {/* AI Response */}
        {response && (
          <div className="animate-fade-in-up">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  AI
                </div>
                <h3 className="heading-section">
                  AI Response
                </h3>
              </div>
              <div className="prose prose-blue max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(response) }}
                />
              </div>
            </div>
          </div>
        )}
        {/* Tips Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
          <h3 className="heading-section text-green-800 mb-3 flex items-center">
            💡 Pro Tips
          </h3>
          <ul className="text-green-700 space-y-2 text-sm">
            <li>• Be specific with your questions for better answers</li>
            <li>• Ask for step-by-step explanations of complex concepts</li>
            <li>• Request examples to better understand topics</li>
            <li>• Use the AI to clarify doubts from your syllabus</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIDoubtSolver; 