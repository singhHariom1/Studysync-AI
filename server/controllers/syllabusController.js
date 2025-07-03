import dotenv from 'dotenv';
dotenv.config();

// Import GoogleGenAI dynamically to avoid issues
let GoogleGenAI;
let genAI = null;

try {
  const genaiModule = await import('@google/genai');
  GoogleGenAI = genaiModule.GoogleGenAI;
  genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI(process.env.GEMINI_API_KEY) : null;
} catch (error) {
  console.error('❌ Failed to import GoogleGenAI:', error.message);
}

import { extractTextFromPDF } from '../utils/pdfUtils.js';

export const uploadSyllabus = async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ 
        error: "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file" 
      });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }
    console.log('📄 Processing PDF:', req.file.originalname);
    console.log('📊 File size:', req.file.size, 'bytes');
    console.log('📋 File mimetype:', req.file.mimetype);
    // Extract text from PDF
    let pdfText;
    try {
      pdfText = await extractTextFromPDF(req.file.buffer, req.file.originalname);
      console.log('📝 Extracted text length:', pdfText.length);
      console.log('📄 First 200 characters:', pdfText.substring(0, 200));
      if (!pdfText || pdfText.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Could not extract text from PDF. The file might be corrupted or contain only images.' 
        });
      }
    } catch (pdfError) {
      console.error('❌ PDF parsing error:', pdfError.message);
      return res.status(400).json({ 
        error: 'Failed to parse PDF: ' + pdfError.message 
      });
    }
    // Create prompt for topic extraction
    let prompt;
    if (pdfText.startsWith('PDF_FILENAME:')) {
      // If PDF parsing failed, use filename-based approach
      const filename = pdfText.replace('PDF_FILENAME:', '').trim();
      prompt = `Based on the filename "${filename}", generate 10 relevant study topics or skills that would typically be found in this type of document.\n\nPlease analyze the filename and provide exactly 10 topics in a numbered list format like this:\n1. Topic Name\n2. Topic Name\n3. Topic Name\n...\n\nFocus on:\n- Skills, technologies, or competencies that would be relevant\n- Educational topics or learning areas\n- Professional skills or certifications\n- Industry-specific knowledge areas\n\nMake the topics concise but descriptive based on what the filename suggests.`;
    } else {
      // Normal PDF content processing
      prompt = `Extract the 10 most important study topics from this syllabus/resume. \n\nDocument content:\n${pdfText.substring(0, 8000)} // Limit to first 8000 characters to avoid token limits\n\nPlease analyze the content and provide exactly 10 topics in a numbered list format like this:\n1. Topic Name\n2. Topic Name\n3. Topic Name\n...\n\nFocus on:\n- Main subjects, chapters, or key learning areas\n- Skills, technologies, or competencies mentioned\n- Educational qualifications or certifications\n- Work experience areas or specializations\n\nMake the topics concise but descriptive. If the document appears to be a resume, extract key skills and areas of expertise. If it's a syllabus, extract main subjects and learning objectives.`;
    }
    // Use Gemini to extract topics
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const aiResponse = result.text;
    // Parse the response to extract numbered topics
    const topicLines = aiResponse
      .split('\n')
      .filter(line => /^\d+\./.test(line.trim()))
      .map(line => line.trim())
      .slice(0, 10);
    console.log('🎯 Extracted topics:', topicLines.length);
    res.json({
      success: true,
      fileName: req.file.originalname,
      topics: topicLines,
      rawResponse: aiResponse,
      extractedTextLength: pdfText.length,
      method: pdfText.startsWith('PDF_FILENAME:') ? 'filename-based' : 'content-based'
    });
  } catch (error) {
    console.error('❌ Syllabus processing error:', error.message);
    res.status(500).json({ 
      error: 'Failed to process syllabus: ' + error.message 
    });
  }
}; 