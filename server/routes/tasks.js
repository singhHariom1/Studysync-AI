import express from 'express';
import Task from '../models/Task.js';

const router = express.Router();

// Helper function to get subject color
const getSubjectColor = (subject) => {
  const colors = {
    'Operating Systems': 'bg-purple-100 text-purple-800 border-purple-200',
    'DBMS': 'bg-blue-100 text-blue-800 border-blue-200',
    'Computer Networks': 'bg-green-100 text-green-800 border-green-200',
    'Data Structures': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Algorithms': 'bg-red-100 text-red-800 border-red-200',
    'Machine Learning': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Web Development': 'bg-pink-100 text-pink-800 border-pink-200',
    'Python': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'JavaScript': 'bg-amber-100 text-amber-800 border-amber-200',
    'React': 'bg-cyan-100 text-cyan-800 border-cyan-200'
  };
  return colors[subject] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Helper function to get priority color
const getPriorityColor = (priority) => {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };
  return colors[priority] || colors.medium;
};

/**
 * GET /api/tasks/progress
 * Get progress statistics
 */
router.get('/progress', async (req, res) => {
  try {
    const stats = await Task.getProgressStats();
    console.log(`📊 Progress stats: ${stats.todayCompleted}/${stats.totalTasks} (${stats.percentage}%)`);
    res.json({ success: true, ...stats });
  } catch (error) {
    console.error('❌ Progress stats error:', error.message);
    res.status(500).json({ error: 'Failed to get progress stats: ' + error.message });
  }
});

/**
 * PATCH /api/tasks/:id/toggle
 * Toggle task completion status
 */
router.patch('/:id/toggle', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (task.status === 'completed') {
      await task.markAsPending();
    } else {
      await task.markAsCompleted();
    }
    console.log(`✅ Task toggled: ${task.title} (${task.status})`);
    res.json({
      success: true,
      task: {
        ...task.toObject(),
        subjectColor: getSubjectColor(task.subject),
        priorityColor: getPriorityColor(task.priority),
        isOverdue: task.isOverdue
      }
    });
  } catch (error) {
    console.error('❌ Task toggle error:', error.message);
    res.status(500).json({ error: 'Failed to toggle task: ' + error.message });
  }
});

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', async (req, res) => {
  try {
    const { title, subject, dueDate, priority = 'medium', description } = req.body;

    // Validation
    if (!title || !subject || !dueDate) {
      return res.status(400).json({
        error: 'Title, subject, and due date are required'
      });
    }

    // Create task
    const task = new Task({
      title,
      subject,
      dueDate: new Date(dueDate),
      priority,
      description
    });

    await task.save();

    console.log(`✅ Task created: ${task.title}`);

    res.status(201).json({
      success: true,
      task: {
        ...task.toObject(),
        subjectColor: getSubjectColor(task.subject),
        priorityColor: getPriorityColor(task.priority),
        isOverdue: task.isOverdue
      }
    });

  } catch (error) {
    console.error('❌ Task creation error:', error.message);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }

    res.status(500).json({
      error: 'Failed to create task: ' + error.message
    });
  }
});

/**
 * GET /api/tasks
 * Get all tasks with filtering and sorting
 */
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      subject, 
      sortBy = 'dueDate', 
      sortOrder = 'asc',
      limit = 50 
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (subject) filter.subject = subject;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get tasks
    const tasks = await Task.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .lean();

    // Add computed fields
    const tasksWithComputed = tasks.map(task => ({
      ...task,
      subjectColor: getSubjectColor(task.subject),
      priorityColor: getPriorityColor(task.priority),
      isOverdue: task.status === 'pending' && new Date(task.dueDate) < new Date()
    }));

    console.log(`✅ Retrieved ${tasksWithComputed.length} tasks`);

    res.json({
      success: true,
      tasks: tasksWithComputed,
      total: tasksWithComputed.length
    });

  } catch (error) {
    console.error('❌ Task retrieval error:', error.message);
    res.status(500).json({
      error: 'Failed to retrieve tasks: ' + error.message
    });
  }
});

/**
 * GET /api/tasks/:id
 * Get a specific task
 */
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).lean();
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({
      success: true,
      task: {
        ...task,
        subjectColor: getSubjectColor(task.subject),
        priorityColor: getPriorityColor(task.priority),
        isOverdue: task.status === 'pending' && new Date(task.dueDate) < new Date()
      }
    });
  } catch (error) {
    console.error('❌ Task retrieval error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve task: ' + error.message });
  }
});

/**
 * PATCH /api/tasks/:id
 * Update a task
 */
router.patch('/:id', async (req, res) => {
  try {
    const { title, subject, dueDate, status, priority, description } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (subject !== undefined) task.subject = subject;
    if (dueDate !== undefined) task.dueDate = new Date(dueDate);
    if (priority !== undefined) task.priority = priority;
    if (description !== undefined) task.description = description;

    // Handle status change
    if (status !== undefined) {
      if (status === 'completed' && task.status === 'pending') {
        task.completedAt = new Date();
      } else if (status === 'pending' && task.status === 'completed') {
        task.completedAt = null;
      }
      task.status = status;
    }

    await task.save();

    console.log(`✅ Task updated: ${task.title}`);

    res.json({
      success: true,
      task: {
        ...task.toObject(),
        subjectColor: getSubjectColor(task.subject),
        priorityColor: getPriorityColor(task.priority),
        isOverdue: task.isOverdue
      }
    });

  } catch (error) {
    console.error('❌ Task update error:', error.message);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }

    res.status(500).json({
      error: 'Failed to update task: ' + error.message
    });
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }

    console.log(`✅ Task deleted: ${task.title}`);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('❌ Task deletion error:', error.message);
    res.status(500).json({
      error: 'Failed to delete task: ' + error.message
    });
  }
});

export default router; 