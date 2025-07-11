import axios from 'axios';

export const MAX_TOPICS_PER_REQUEST = 10;
export const TIMEOUT_PER_TOPIC = 15000; // 15 seconds per topic

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Helper to extract YouTube video ID from a URL
function extractYouTubeVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Check if a YouTube video is active using the YouTube Data API
async function isYouTubeVideoActive(url) {
  if (!YOUTUBE_API_KEY) return true; // If no key, skip check
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return false;
  try {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=status&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    const response = await axios.get(apiUrl);
    const items = response.data.items;
    if (items && items.length > 0 && items[0].status && items[0].status.privacyStatus === 'public') {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

/**
 * Generate learning resources for a single topic using Gemini AI
 * @param {string} topic - The topic to find resources for
 * @param {object} genAI - The Gemini AI instance
 * @returns {Promise<Array>} Array of resource links
 */
export async function generateResourcesForTopic(topic, genAI) {
  try {
    const prompt = `Suggest 2 high-quality beginner-friendly resources (1 YouTube link and 1 article or PDF) to learn the topic: ${topic}.
Provide only the clickable links with a short title label. Keep answers concise.
Format each resource as: "🎥 [Title - YouTube](link)" or "📘 [Title - Source](link)"`;
    console.log(`🔍 Generating resources for topic: ${topic}`);
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
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
      // If YouTube link, check if active
      if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(url)) {
        const active = await isYouTubeVideoActive(url);
        if (!active) {
          links.push(`[Fallback Resource - Search ${topic} on YouTube](https://youtube.com/results?search_query=${encodeURIComponent(topic)})`);
          continue;
        }
      }
      links.push(`[${title}](${url})`);
    }
    // If no links found, try to extract any URLs
    if (links.length === 0) {
      const urlRegex = /https?:\/\/[^\s]+/g;
      const urls = response.match(urlRegex);
      if (urls && urls.length > 0) {
        return urls.slice(0, 2).map((url, index) => `[Resource ${index + 1}](${url})`);
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
 * @param {object} genAI - The Gemini AI instance
 * @returns {Promise<Object>} Object with topics as keys and resource arrays as values
 */
export async function generateResourcesForTopics(topics, genAI) {
  const resources = {};
  const failedTopics = [];
  // Process topics with timeout protection
  const promises = topics.map(async (topic) => {
    try {
      const topicPromise = generateResourcesForTopic(topic, genAI);
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