export async function extractTextFromPDF(buffer, filename) {
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