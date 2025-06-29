import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// Initialize Gemini AI
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in environment variables");
  console.error("Please create a .env file with your Gemini API key");
}

// Import GoogleGenAI dynamically to avoid issues
let GoogleGenAI;
let genAI = null;

try {
  const genaiModule = await import('@google/genai');
  GoogleGenAI = genaiModule.GoogleGenAI;
  genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI(process.env.GEMINI_API_KEY) : null;
} catch (error) {
  console.error("❌ Failed to import GoogleGenAI:", error.message);
}

// Function to extract text from PDF using multiple methods
async function extractTextFromPDF(buffer, filename) {
  // Method 1: Try pdfjs-dist (more reliable)
  try {
    console.log('🔄 Trying pdfjs-dist...');
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    console.log('✅ pdfjs-dist extraction successful');
    return fullText.trim();
    
  } catch (pdfjsError) {
    console.log('❌ pdfjs-dist failed:', pdfjsError.message);
    
    // Method 2: Fallback to pdf-parse
    try {
      console.log('🔄 Trying pdf-parse fallback...');
      const pdfParse = await import('pdf-parse');
      const pdfData = await pdfParse.default(buffer);
      console.log('✅ pdf-parse extraction successful');
      return pdfData.text;
      
    } catch (pdfParseError) {
      console.log('❌ pdf-parse also failed:', pdfParseError.message);
      
      // Method 3: Generate topics based on filename and ask for description
      console.log('🔄 Using filename-based approach...');
      return `PDF_FILENAME: ${filename}`;
    }
  }
}

router.post('/upload', upload.single('syllabus'), async (req, res) => {
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
      prompt = `Based on the filename "${filename}", generate 10 relevant study topics or skills that would typically be found in this type of document.
      
      Please analyze the filename and provide exactly 10 topics in a numbered list format like this:
      1. Topic Name
      2. Topic Name
      3. Topic Name
      ...
      
      Focus on:
      - Skills, technologies, or competencies that would be relevant
      - Educational topics or learning areas
      - Professional skills or certifications
      - Industry-specific knowledge areas
      
      Make the topics concise but descriptive based on what the filename suggests.`;
    } else {
      // Normal PDF content processing
      prompt = `Extract the 10 most important study topics from this syllabus/resume. 
      
      Document content:
      ${pdfText.substring(0, 8000)} // Limit to first 8000 characters to avoid token limits
      
      Please analyze the content and provide exactly 10 topics in a numbered list format like this:
      1. Topic Name
      2. Topic Name
      3. Topic Name
      ...
      
      Focus on:
      - Main subjects, chapters, or key learning areas
      - Skills, technologies, or competencies mentioned
      - Educational qualifications or certifications
      - Work experience areas or specializations
      
      Make the topics concise but descriptive. If the document appears to be a resume, extract key skills and areas of expertise. If it's a syllabus, extract main subjects and learning objectives.`;
    }

    // Use Gemini to extract topics
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });

    const aiResponse = result.text;
    
    // Parse the response to extract numbered topics
    const topicLines = aiResponse
      .split('\n')
      .filter(line => /^\d+\./.test(line.trim())) // Lines starting with numbers
      .map(line => line.trim())
      .slice(0, 10); // Take first 10 topics

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
});

export default router; 