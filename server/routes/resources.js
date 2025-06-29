import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Check if API key is configured
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in environment variables");
  console.error("Please create a .env file with your Gemini API key");
}

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI(process.env.GEMINI_API_KEY) : null;

// Constants
const MAX_TOPICS_PER_REQUEST = 10;
const TIMEOUT_PER_TOPIC = 15000; // 15 seconds per topic

/**
 * Generate learning resources for a single topic using Gemini AI
 * @param {string} topic - The topic to find resources for
 * @returns {Promise<Array>} Array of resource links
 */
async function generateResourcesForTopic(topic) {
  try {
    const prompt = `Suggest 2 high-quality beginner-friendly resources (1 YouTube link and 1 article or PDF) to learn the topic: ${topic}.
Provide only the clickable links with a short title label. Keep answers concise.
Format each resource as: "🎥 [Title - YouTube](link)" or "📘 [Title - Source](link)"`;

    console.log(`🔍 Generating resources for topic: ${topic}`);

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash", // Using the latest flash model for speed
      contents: prompt,
    });

    const response = result.text;
    
    // Extract links from the response using regex
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    let match;

    while ((match = linkRegex.exec(response)) !== null) {
      const title = match[1];
      const url = match[2];
      links.push(`[${title}](${url})`);
    }

    // If no links found, try to extract any URLs
    if (links.length === 0) {
      const urlRegex = /https?:\/\/[^\s]+/g;
      const urls = response.match(urlRegex);
      if (urls && urls.length > 0) {
        return urls.slice(0, 2).map((url, index) => 
          `[Resource ${index + 1}](${url})`
        );
      }
    }

    return links.slice(0, 2); // Return max 2 resources
  } catch (error) {
    console.error(`❌ Error generating resources for ${topic}:`, error.message);
    return [`[Fallback Resource - Search ${topic} on YouTube](https://youtube.com/results?search_query=${encodeURIComponent(topic)})`];
  }
}

/**
 * Generate resources for multiple topics with timeout protection
 * @param {Array<string>} topics - Array of topics
 * @returns {Promise<Object>} Object with topics as keys and resource arrays as values
 */
async function generateResourcesForTopics(topics) {
  const resources = {};
  const failedTopics = [];

  // Process topics with timeout protection
  const promises = topics.map(async (topic) => {
    try {
      const topicPromise = generateResourcesForTopic(topic);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), TIMEOUT_PER_TOPIC)
      );

      const topicResources = await Promise.race([topicPromise, timeoutPromise]);
      resources[topic] = topicResources;
      console.log(`✅ Generated ${topicResources.length} resources for: ${topic}`);
    } catch (error) {
      console.error(`❌ Failed to generate resources for ${topic}:`, error.message);
      failedTopics.push(topic);
      resources[topic] = [
        `[Search ${topic} on YouTube](https://youtube.com/results?search_query=${encodeURIComponent(topic)})`,
        `[Search ${topic} on Google](https://google.com/search?q=${encodeURIComponent(topic + " tutorial")})`
      ];
    }
  });

  await Promise.all(promises);

  // Log summary
  if (failedTopics.length > 0) {
    console.log(`⚠️ Failed to generate resources for ${failedTopics.length} topics:`, failedTopics);
  }

  return resources;
}

/**
 * POST /api/resources/suggest
 * Suggest learning resources for given topics
 */
router.post('/suggest', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ 
        error: "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file" 
      });
    }

    const { topics } = req.body;

    // Input validation
    if (!topics || !Array.isArray(topics)) {
      return res.status(400).json({ 
        error: "Topics array is required" 
      });
    }

    if (topics.length === 0) {
      return res.status(400).json({ 
        error: "At least one topic is required" 
      });
    }

    if (topics.length > MAX_TOPICS_PER_REQUEST) {
      return res.status(400).json({ 
        error: `Maximum ${MAX_TOPICS_PER_REQUEST} topics allowed per request` 
      });
    }

    // Validate each topic
    const validTopics = topics.filter(topic => 
      topic && typeof topic === 'string' && topic.trim().length > 0
    );

    if (validTopics.length === 0) {
      return res.status(400).json({ 
        error: "No valid topics provided" 
      });
    }

    console.log(`🚀 Starting resource generation for ${validTopics.length} topics:`, validTopics);

    // Generate resources for all topics
    const resources = await generateResourcesForTopics(validTopics);

    console.log(`✅ Successfully generated resources for ${Object.keys(resources).length} topics`);

    res.json({ 
      success: true,
      resources,
      totalTopics: validTopics.length,
      message: `Generated resources for ${validTopics.length} topics`
    });

  } catch (error) {
    console.error("❌ Resource suggestion error:", error.message);
    res.status(500).json({ 
      error: "Failed to generate resources: " + error.message 
    });
  }
});

/**
 * GET /api/resources/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    geminiConfigured: !!genAI,
    maxTopicsPerRequest: MAX_TOPICS_PER_REQUEST,
    timeoutPerTopic: TIMEOUT_PER_TOPIC
  });
});

export default router; 