import PomodoroSession from '../models/PomodoroSession.js';

// Get today's Pomodoro statistics
const getTodayStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let todaySession = await PomodoroSession.getTodaySession(userId);
    
    if (!todaySession) {
      // Create a new session for today if none exists
      todaySession = new PomodoroSession({
        userId,
        date: new Date(),
        completedCycles: 0,
        totalWorkTime: 0,
        totalBreakTime: 0,
        sessions: []
      });
      await todaySession.save();
    }
    
    res.json({
      success: true,
      data: {
        completedCycles: todaySession.completedCycles,
        totalWorkTime: todaySession.totalWorkTime,
        totalBreakTime: todaySession.totalBreakTime,
        totalSessions: todaySession.sessions.length
      }
    });
  } catch (error) {
    console.error('Error getting Pomodoro stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Pomodoro statistics'
    });
  }
};

// Add a completed Pomodoro session
const addSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, duration } = req.body;
    
    if (!type || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Type and duration are required'
      });
    }
    
    if (!['work', 'break'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "work" or "break"'
      });
    }
    
    let todaySession = await PomodoroSession.getTodaySession(userId);
    
    if (!todaySession) {
      todaySession = new PomodoroSession({
        userId,
        date: new Date(),
        completedCycles: 0,
        totalWorkTime: 0,
        totalBreakTime: 0,
        sessions: []
      });
    }
    
    // Save the session and get the updated document
    const updatedSession = await todaySession.addSession(type, duration);
    
    res.json({
      success: true,
      message: 'Session added successfully',
      data: {
        completedCycles: updatedSession.completedCycles,
        totalWorkTime: updatedSession.totalWorkTime,
        totalBreakTime: updatedSession.totalBreakTime
      }
    });
  } catch (error) {
    console.error('Error adding Pomodoro session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add session'
    });
  }
};

// Get weekly statistics
const getWeeklyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklySessions = await PomodoroSession.find({
      userId,
      date: {
        $gte: weekAgo,
        $lte: today
      }
    }).sort({ date: 1 });
    
    const weeklyStats = weeklySessions.map(session => ({
      date: session.date.toISOString().split('T')[0],
      completedCycles: session.completedCycles,
      totalWorkTime: session.totalWorkTime,
      totalBreakTime: session.totalBreakTime
    }));
    
    res.json({
      success: true,
      data: weeklyStats
    });
  } catch (error) {
    console.error('Error getting weekly stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get weekly statistics'
    });
  }
};

export {
  getTodayStats,
  addSession,
  getWeeklyStats
}; 