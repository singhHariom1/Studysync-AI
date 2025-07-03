import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';
import geminiRoutes from './routes/gemini.js';
import syllabusRoutes from './routes/syllabus.js';
import resourcesRoutes from './routes/resources.js';
import tasksRoutes from './routes/tasks.js';
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();

// Allow both local and deployed frontend origins for CORS with credentials
const allowedOrigins = [
  'http://localhost:5173',
  'https://studysync-ai-nu.vercel.app'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
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
