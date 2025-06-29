import { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

const TaskPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    dueDate: '',
    priority: 'medium',
    description: ''
  });

  // Available subjects with colors
  const subjects = [
    'Operating Systems', 'DBMS', 'Computer Networks', 'Data Structures',
    'Algorithms', 'Machine Learning', 'Web Development', 'Python',
    'JavaScript', 'React', 'Other'
  ];

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `${API}/api/tasks?sortBy=${sortBy}&sortOrder=${sortOrder}`;
      if (filter !== 'all') {
        url += `&status=${filter}`;
      }
      const response = await axios.get(url);
      setTasks(response.data.tasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Load tasks on component mount and filter/sort changes
  useEffect(() => {
    fetchTasks();
  }, [filter, sortBy, sortOrder]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      dueDate: '',
      priority: 'medium',
      description: ''
    });
    setEditingTask(null);
    setShowForm(false);
  };

  // Create or update task
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subject || !formData.dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editingTask) {
        // Update existing task
        await axios.patch(`${API}/api/tasks/${editingTask._id}`, formData);
        console.log('✅ Task updated successfully');
      } else {
        // Create new task
        await axios.post(`${API}/api/tasks`, formData);
        console.log('✅ Task created successfully');
      }
      
      resetForm();
      fetchTasks();
    } catch (err) {
      console.error('Task operation failed:', err);
      setError(err.response?.data?.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  // Toggle task completion
  const toggleTaskStatus = async (taskId) => {
    try {
      await axios.patch(`${API}/api/tasks/${taskId}/toggle`);
      fetchTasks();
    } catch (err) {
      console.error('Failed to toggle task:', err);
      setError('Failed to update task status');
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await axios.delete(`${API}/api/tasks/${taskId}`);
      console.log('✅ Task deleted successfully');
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task');
    }
  };

  // Edit task
  const editTask = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      subject: task.subject,
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      priority: task.priority,
      description: task.description || ''
    });
    setShowForm(true);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get priority icon
  const getPriorityIcon = (priority) => {
    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🔴'
    };
    return icons[priority] || '🟡';
  };

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in-up">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-blue-100 card-main">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h2 className="heading-main">
            <span className="text-3xl mr-2">📋</span> Task Planner
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary self-end"
          >
            {showForm ? '❌ Cancel' : '➕ Add Task'}
          </button>
        </div>
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in-up">
            <p className="text-red-600 flex items-center">
              <span className="text-xl mr-2">⚠️</span> {error}
            </p>
          </div>
        )}
        {/* Task Form */}
        {showForm && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl animate-fade-in-up">
            <h3 className="heading-section mb-4">
              {editingTask ? '✏️ Edit Task' : '➕ New Task'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Describe the task (optional)"
                />
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Filter & Sort Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex gap-2 items-center">
            <label className="font-medium text-gray-700">Filter:</label>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <label className="font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
            <button
              className="btn-secondary px-3 py-2"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              aria-label="Toggle sort order"
            >
              {sortOrder === 'asc' ? '⬆️' : '⬇️'}
            </button>
          </div>
        </div>
        {/* Task List */}
        <div className="grid gap-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner w-8 h-8 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="text-6xl mb-4">🗂️</div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No Tasks Found
              </h3>
              <p className="text-gray-500">
                Add a new task to get started with your planning!
              </p>
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task._id}
                className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-4 shadow-md hover:shadow-lg transition-shadow animate-fade-in-up ${task.status === 'completed' ? 'opacity-60' : ''}`}
              >
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-gray-800 flex items-center gap-2">
                      {getPriorityIcon(task.priority)} {task.title}
                    </span>
                    <span className="ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {task.subject}
                    </span>
                    <span className="ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      Due: {formatDate(task.dueDate)}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-gray-600 mb-2">{task.description}</p>
                  )}
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {task.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                </div>
                <div className="flex gap-2 md:flex-col md:items-end">
                  <button
                    className="btn-secondary"
                    onClick={() => toggleTaskStatus(task._id)}
                    aria-label="Toggle status"
                  >
                    {task.status === 'completed' ? '↩️ Mark Pending' : '✅ Mark Done'}
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => editTask(task)}
                    aria-label="Edit task"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => deleteTask(task._id)}
                    aria-label="Delete task"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskPlanner; 