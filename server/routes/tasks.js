import express from 'express';
import {
  getProgressStats,
  toggleTask,
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask
} from '../controllers/tasksController.js';

const router = express.Router();

router.get('/progress', getProgressStats);
router.patch('/:id/toggle', toggleTask);
router.post('/', createTask);
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router; 