import Task from '../models/Task.js';
import { getSubjectColor, getPriorityColor } from '../utils/taskColors.js';

export const getProgressStats = async (req, res) => {
  try {
    const stats = await Task.getProgressStats();
    console.log(`📊 Progress stats: ${stats.todayCompleted}/${stats.totalTasks} (${stats.percentage}%)`);
    res.json({ success: true, ...stats });
  } catch (error) {
    console.error('❌ Progress stats error:', error.message);
    res.status(500).json({ error: 'Failed to get progress stats: ' + error.message });
  }
};

export const toggleTask = async (req, res) => {
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
};

export const createTask = async (req, res) => {
  try {
    const { title, subject, dueDate, priority = 'medium', description } = req.body;
    if (!title || !subject || !dueDate) {
      return res.status(400).json({ error: 'Title, subject, and due date are required' });
    }
    const task = new Task({ title, subject, dueDate: new Date(dueDate), priority, description });
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
      return res.status(400).json({ error: Object.values(error.errors).map(err => err.message).join(', ') });
    }
    res.status(500).json({ error: 'Failed to create task: ' + error.message });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const { status, subject, sortBy = 'dueDate', sortOrder = 'asc', limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (subject) filter.subject = subject;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    const tasks = await Task.find(filter).sort(sort).limit(parseInt(limit)).lean();
    const tasksWithComputed = tasks.map(task => ({
      ...task,
      subjectColor: getSubjectColor(task.subject),
      priorityColor: getPriorityColor(task.priority),
      isOverdue: task.status === 'pending' && new Date(task.dueDate) < new Date()
    }));
    console.log(`✅ Retrieved ${tasksWithComputed.length} tasks`);
    res.json({ success: true, tasks: tasksWithComputed, total: tasksWithComputed.length });
  } catch (error) {
    console.error('❌ Task retrieval error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve tasks: ' + error.message });
  }
};

export const getTaskById = async (req, res) => {
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
};

export const updateTask = async (req, res) => {
  try {
    const { title, subject, dueDate, status, priority, description } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (title !== undefined) task.title = title;
    if (subject !== undefined) task.subject = subject;
    if (dueDate !== undefined) task.dueDate = new Date(dueDate);
    if (priority !== undefined) task.priority = priority;
    if (description !== undefined) task.description = description;
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
      return res.status(400).json({ error: Object.values(error.errors).map(err => err.message).join(', ') });
    }
    res.status(500).json({ error: 'Failed to update task: ' + error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    console.log(`✅ Task deleted: ${task.title}`);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('❌ Task deletion error:', error.message);
    res.status(500).json({ error: 'Failed to delete task: ' + error.message });
  }
}; 