import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [50, 'Subject cannot exceed 50 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Due date cannot be in the past'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ subject: 1 });

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && this.dueDate < new Date();
});

// Method to mark task as completed
taskSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to mark task as pending
taskSchema.methods.markAsPending = function() {
  this.status = 'pending';
  this.completedAt = null;
  return this.save();
};

// Static method to get progress statistics
taskSchema.statics.getProgressStats = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalTasks, todayCompleted] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({
      status: 'completed',
      completedAt: { $gte: today, $lt: tomorrow }
    })
  ]);

  const percentage = totalTasks > 0 ? Math.round((todayCompleted / totalTasks) * 100) : 0;

  return {
    todayCompleted,
    totalTasks,
    percentage
  };
};

const Task = mongoose.model('Task', taskSchema);

export default Task; 