import dotenv from 'dotenv';
dotenv.config();
import { generateResourcesForTopics, MAX_TOPICS_PER_REQUEST, TIMEOUT_PER_TOPIC } from '../utils/resourceUtils.js';
import { GoogleGenAI } from '@google/genai';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI(process.env.GEMINI_API_KEY) : null;

export const suggestResources = async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ 
        error: "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file" 
      });
    }
    const { topics } = req.body;
    if (!topics || !Array.isArray(topics)) {
      return res.status(400).json({ error: "Topics array is required" });
    }
    if (topics.length === 0) {
      return res.status(400).json({ error: "At least one topic is required" });
    }
    if (topics.length > MAX_TOPICS_PER_REQUEST) {
      return res.status(400).json({ error: `Maximum ${MAX_TOPICS_PER_REQUEST} topics allowed per request` });
    }
    const validTopics = topics.filter(topic => topic && typeof topic === 'string' && topic.trim().length > 0);
    if (validTopics.length === 0) {
      return res.status(400).json({ error: "No valid topics provided" });
    }
    console.log(`🚀 Starting resource generation for ${validTopics.length} topics:`, validTopics);
    const resources = await generateResourcesForTopics(validTopics, genAI);
    console.log(`✅ Successfully generated resources for ${Object.keys(resources).length} topics`);
    res.json({ success: true, resources, totalTopics: validTopics.length, message: `Generated resources for ${validTopics.length} topics` });
  } catch (error) {
    console.error("❌ Resource suggestion error:", error.message);
    res.status(500).json({ error: "Failed to generate resources: " + error.message });
  }
};

export const resourcesHealth = (req, res) => {
  res.json({ 
    status: 'healthy',
    geminiConfigured: !!genAI,
    maxTopicsPerRequest: MAX_TOPICS_PER_REQUEST,
    timeoutPerTopic: TIMEOUT_PER_TOPIC
  });
}; 