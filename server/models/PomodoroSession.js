import mongoose from 'mongoose';

const pomodoroSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  completedCycles: {
    type: Number,
    default: 0
  },
  totalWorkTime: {
    type: Number, // in minutes
    default: 0
  },
  totalBreakTime: {
    type: Number, // in minutes
    default: 0
  },
  sessions: [{
    type: {
      type: String,
      enum: ['work', 'break'],
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries by user and date
pomodoroSessionSchema.index({ userId: 1, date: 1 });

// Method to get today's session for a user
pomodoroSessionSchema.statics.getTodaySession = function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.findOne({
    userId,
    date: {
      $gte: today,
      $lt: tomorrow
    }
  });
};

// Method to add a completed session
pomodoroSessionSchema.methods.addSession = function(type, duration) {
  this.sessions.push({
    type,
    duration,
    completedAt: new Date()
  });
  
  if (type === 'work') {
    this.totalWorkTime += duration;
    this.completedCycles += 1;
  } else {
    this.totalBreakTime += duration;
  }
  
  return this.save();
};

export default mongoose.model('PomodoroSession', pomodoroSessionSchema); 