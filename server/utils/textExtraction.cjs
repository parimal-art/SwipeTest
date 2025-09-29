const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractTextFromFile(filePath) {
  const fileBuffer = await fs.readFile(filePath);
  const fileExtension = filePath.toLowerCase().split('.').pop();

  try {
    if (fileExtension === 'pdf') {
      const data = await pdfParse(fileBuffer);
      return data.text;
    } else if (fileExtension === 'docx' || fileExtension === 'doc') {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error('Failed to extract text from file');
  }
}

function parseContactInfo(text) {
  const result = {
    name: null,
    email: null,
    phone: null
  };

  // Email regex
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emailMatch = text.match(emailRegex);
  if (emailMatch && emailMatch.length > 0) {
    result.email = emailMatch[0];
  }

  // Phone regex - matches various formats
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch && phoneMatch.length > 0) {
    result.phone = phoneMatch[0];
  }

  // Name extraction - look for patterns at the beginning of the document
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Try to find name in first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    
    // Skip lines that look like contact info or addresses
    if (line.includes('@') || 
        line.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) ||
        line.toLowerCase().includes('street') ||
        line.toLowerCase().includes('drive') ||
        line.toLowerCase().includes('avenue')) {
      continue;
    }

    // Look for name pattern - typically 2-3 words, proper case
    const namePattern = /^([A-Z][a-z]+\s+){1,2}[A-Z][a-z]+$/;
    if (namePattern.test(line) && line.split(' ').length <= 4) {
      result.name = line;
      break;
    }
  }

  return result;
}

module.exports = {
  extractTextFromFile,
  parseContactInfo
};