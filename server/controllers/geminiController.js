import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI(process.env.GEMINI_API_KEY) : null;

export const getModels = async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ 
        error: "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file" 
      });
    }
    // List available models using the correct API
    const modelsResponse = await genAI.models.list();
    console.log("✅ Models response received");
    // Extract models from pageInternal array
    const models = modelsResponse.pageInternal || [];
    const modelNames = models.map((m) => m.name);
    // Filter for text generation models (exclude embedding models)
    const textModels = models.filter(m => 
      m.supportedActions && 
      m.supportedActions.includes('generateContent') &&
      !m.name.includes('embedding')
    );
    const recommendedModels = [
      'models/gemini-1.5-flash',
      'models/gemini-1.5-pro',
      'models/gemini-2.0-flash',
      'models/gemini-2.5-flash',
      'models/gemini-2.5-pro'
    ];
    console.log("✅ Available text models:", textModels.map(m => m.name));
    res.json({ 
      models: models, 
      modelNames: modelNames,
      textModels: textModels,
      recommendedModels: recommendedModels
    });
  } catch (err) {
    console.error("❌ Model list error:", err.message);
    res.status(500).json({ error: "Failed to fetch models: " + err.message });
  }
};

export const askGemini = async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ 
        error: "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file" 
      });
    }
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }
    // Use the models.generateContent method directly
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
    });
    res.json({ response: result.text });
  } catch (err) {
    console.error("❌ Gemini error:", err.message);
    res.status(500).json({ error: "Gemini API error: " + err.message });
  }
}; 