import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import geminiRoutes from './routes/gemini.js';
import syllabusRoutes from './routes/syllabus.js';
import resourcesRoutes from './routes/resources.js';
import tasksRoutes from './routes/tasks.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/gemini', geminiRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/tasks', tasksRoutes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
