import PomodoroSession from '../models/PomodoroSession.js';

// Helper function to get start of today in Indian timezone (UTC+5:30)
const getStartOfToday = () => {
  const now = new Date();
  
  // India is UTC+5:30, so we need to add 5.5 hours to get local time
  const indiaOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  
  // Get the current time in Indian timezone
  const indiaTime = new Date(now.getTime() + indiaOffset);
  
  // Calculate the start of today in Indian timezone manually
  // Get the current date in India
  const indiaYear = indiaTime.getUTCFullYear();
  const indiaMonth = indiaTime.getUTCMonth();
  const indiaDate = indiaTime.getUTCDate();
  
  // Create a UTC date for the start of today in Indian timezone
  // This will be midnight in India, which is 18:30 (6:30 PM) of the previous day in UTC
  const startOfDayIndia = new Date(Date.UTC(indiaYear, indiaMonth, indiaDate, 0, 0, 0, 0));
  
  // Convert to the UTC time that corresponds to midnight in India
  const utcStartOfDay = new Date(startOfDayIndia.getTime() - indiaOffset);
  
  console.log('Current UTC time:', now.toISOString());
  console.log('Current India time:', indiaTime.toISOString());
  console.log('Start of day (India):', startOfDayIndia.toISOString());
  console.log('Start of day (UTC for DB):', utcStartOfDay.toISOString());
  console.log('India date info:', {
    year: indiaYear,
    month: indiaMonth + 1,
    date: indiaDate,
    hours: indiaTime.getUTCHours()
  });
  
  return utcStartOfDay;
};

// Cleanup function to merge duplicate sessions for the same day
const cleanupDuplicateSessions = async (userId) => {
  try {
    // Use proper local timezone for date calculations
    const today = getStartOfToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log('Cleanup - Current time:', new Date().toISOString());
    console.log('Cleanup - Today start (local):', today.toISOString());
    console.log('Cleanup - Tomorrow start (local):', tomorrow.toISOString());
    
    // Find all sessions for today
    const todaySessions = await PomodoroSession.find({
      userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).sort({ createdAt: 1 });
    
    if (todaySessions.length > 1) {
      console.log(`Found ${todaySessions.length} sessions for today, merging...`);
      
      // Merge all sessions into the first one
      const primarySession = todaySessions[0];
      let totalCycles = 0;
      let totalWorkTime = 0;
      let totalBreakTime = 0;
      let allSessions = [];
      
      todaySessions.forEach(session => {
        totalCycles += session.completedCycles;
        totalWorkTime += session.totalWorkTime;
        totalBreakTime += session.totalBreakTime;
        allSessions = allSessions.concat(session.sessions);
      });
      
      // Update the primary session
      primarySession.completedCycles = totalCycles;
      primarySession.totalWorkTime = totalWorkTime;
      primarySession.totalBreakTime = totalBreakTime;
      primarySession.sessions = allSessions;
      await primarySession.save();
      
      // Delete the duplicate sessions
      const duplicateIds = todaySessions.slice(1).map(s => s._id);
      await PomodoroSession.deleteMany({ _id: { $in: duplicateIds } });
      
      console.log('Merged duplicate sessions successfully');
      return primarySession;
    }
    
    return todaySessions[0] || null;
  } catch (error) {
    console.error('Error cleaning up duplicate sessions:', error);
    return null;
  }
};

// Get today's Pomodoro statistics
const getTodayStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // First, cleanup any duplicate sessions for today
    let todaySession = await cleanupDuplicateSessions(userId);
    
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
    
    // Find today's session - use proper local timezone for date calculations
    const today = getStartOfToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log('AddSession - Current time:', new Date().toISOString());
    console.log('AddSession - Today start (local):', today.toISOString());
    
    let todaySession = await PomodoroSession.findOne({
      userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).sort({ createdAt: -1 }); // Get the most recent session for today
    
    if (!todaySession) {
      // Create a new session for today if none exists
      todaySession = new PomodoroSession({
        userId,
        date: new Date(), // This will be stored in UTC but compared in local time
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
    
    // Use proper local timezone for date calculations
    const today = getStartOfToday();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    // Calculate the end of today (start of tomorrow)
    const endOfToday = new Date(today);
    endOfToday.setDate(endOfToday.getDate() + 1);
    
    console.log('WeeklyStats - Current time:', new Date().toISOString());
    console.log('WeeklyStats - Today start (local):', today.toISOString());
    console.log('WeeklyStats - Today end (local):', endOfToday.toISOString());
    console.log('WeeklyStats - Week ago (local):', weekAgo.toISOString());
    
    // Debug: Find ALL sessions for this user
    const allSessions = await PomodoroSession.find({ userId }).sort({ date: 1 });
    console.log('All sessions for user:', allSessions.length);
    console.log('All session dates:', allSessions.map(s => s.date.toISOString()));
    
    // Log the exact query we're making
    console.log('WeeklyStats - Query:', {
      userId: userId,
      date: {
        $gte: weekAgo.toISOString(),
        $lt: endOfToday.toISOString() // Use $lt instead of $lte, and use endOfToday
      }
    });
    
    const weeklySessions = await PomodoroSession.find({
      userId,
      date: {
        $gte: weekAgo,
        $lt: endOfToday // Use $lt instead of $lte, and use endOfToday
      }
    }).sort({ date: 1 });
    
    console.log('Found sessions:', weeklySessions.length);
    console.log('Session dates found:', weeklySessions.map(s => s.date.toISOString()));
    
    const weeklyStats = weeklySessions.map(session => {
      // Convert the session date to Indian timezone for display
      const indiaOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
      const indiaTime = new Date(session.date.getTime() + indiaOffset);
      const dateStr = indiaTime.toISOString().split('T')[0];
      
      console.log('Processing session date:', session.date.toISOString(), '->', dateStr, '(India time)');
      
      return {
        date: dateStr,
        completedCycles: session.completedCycles,
        totalWorkTime: session.totalWorkTime,
        totalBreakTime: session.totalBreakTime
      };
    });
    
    console.log('Weekly stats to send:', weeklyStats);
    
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