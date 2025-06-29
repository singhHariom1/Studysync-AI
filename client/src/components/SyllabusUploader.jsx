import { useState } from 'react';
import axios from 'axios';

const SyllabusUploader = ({ onTopicsExtracted }) => {
  const [file, setFile] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
      setTopics([]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('syllabus', file);

    try {
      const response = await axios.post('/api/syllabus/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const extractedTopics = response.data.topics;
      setTopics(extractedTopics);
      if (onTopicsExtracted) {
        onTopicsExtracted(extractedTopics);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process syllabus');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTopics([]);
    setError('');
    setFileName('');
    const fileInput = document.getElementById('pdf-upload');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="max-w-3xl mx-auto p-6 animate-fade-in-up">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-blue-100 card-main">
        <h2 className="heading-main text-center mb-2">
          <span className="text-4xl mr-2">📚</span> Syllabus Topic Extractor
        </h2>
        <p className="text-gray-500 text-center mb-8 text-lg">
          Upload your syllabus PDF and get the top 10 study topics extracted by AI
        </p>
        {/* File Upload Section */}
        <div className="mb-8">
          <div className="border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-10 text-center hover:border-blue-400 transition-colors duration-300">
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer select-none">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {fileName ? fileName : 'Click to upload PDF syllabus'}
              </p>
              <p className="text-sm text-gray-400">
                {fileName ? 'Click to change file' : 'Maximum file size: 10MB'}
              </p>
            </label>
          </div>
        </div>
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
            onClick={handleUpload}
            disabled={!file || loading}
            className={`btn-primary ${!file || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Extract Topics"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="spinner w-4 h-4"></div>
                Extracting Topics...
              </span>
            ) : (
              <span className="flex items-center gap-2">🔍 Extract Topics</span>
            )}
          </button>
          {file && (
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
        {/* Topics Display */}
        {topics.length > 0 && (
          <div className="mt-8 animate-fade-in-up">
            <h3 className="heading-section text-center mb-6">
              🎯 Extracted Study Topics
            </h3>
            <div className="grid gap-4">
              {topics.map((topic, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium leading-relaxed">
                        {topic.replace(/^\d+\.\s*/, '')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                ✨ {topics.length} topics extracted from "{fileName}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyllabusUploader; 