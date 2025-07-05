import express from 'express';
import { getTodayStats, addSession, getWeeklyStats } from '../controllers/pomodoroController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get today's Pomodoro statistics
router.get('/stats/today', getTodayStats);

// Add a completed Pomodoro session
router.post('/session', addSession);

// Get weekly statistics
router.get('/stats/weekly', getWeeklyStats);

export default router; 