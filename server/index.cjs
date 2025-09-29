// server/index.cjs
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const Database = require('./database');
const OpenAIService = require('./openai.cjs');
const { extractTextFromFile, parseContactInfo } = require('./utils/textExtraction.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize services
const db = new Database();
const openai = new OpenAIService(process.env.OPENAI_API_KEY);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting for /api routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// File upload configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and DOCX files are allowed'), false);
  }
});

// ---------- Routes ----------

// Health / root route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API running. Use /api/* endpoints.' });
});

// Upload resume
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const parsedText = await extractTextFromFile(req.file.path);
    let contactInfo = parseContactInfo(parsedText);

    if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
      const aiExtraction = await openai.extractContactInfo(parsedText);
      contactInfo = { ...contactInfo, ...aiExtraction };
    }

    await fs.unlink(req.file.path).catch(() => {});
    res.json({ parsedText, ...contactInfo });
  } catch (error) {
    console.error('Resume upload error:', error);
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: 'Failed to process resume', details: error.message });
  }
});

// Generate question
app.post('/api/generate-question', async (req, res) => {
  try {
    const { role, difficulty, prior_context } = req.body;
    if (!role || !difficulty) return res.status(400).json({ error: 'Role and difficulty are required' });

    const question = await openai.generateQuestion(role, difficulty, prior_context);
    res.json(question);
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ error: 'Failed to generate question', details: error.message });
  }
});

// Evaluate answer
app.post('/api/evaluate-answer', async (req, res) => {
  try {
    const { question_id, question_text, difficulty, answer_text, candidate_id } = req.body;
    if (!question_id || !question_text || !difficulty || answer_text === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const evaluation = await openai.evaluateAnswer(question_text, difficulty, answer_text);

    await db.saveAnswer({
      candidate_id,
      question_id,
      question_text,
      difficulty,
      answer_text,
      score: evaluation.score,
      feedback: evaluation.feedback,
      confidence: evaluation.confidence,
      timestamp: new Date().toISOString()
    });

    res.json(evaluation);
  } catch (error) {
    console.error('Answer evaluation error:', error);
    res.status(500).json({ error: 'Failed to evaluate answer', details: error.message });
  }
});

// Save candidate
app.post('/api/candidate/save', async (req, res) => {
  try {
    const candidateData = req.body;
    const candidate = await db.saveCandidate(candidateData);
    res.json(candidate);
  } catch (error) {
    console.error('Save candidate error:', error);
    res.status(500).json({ error: 'Failed to save candidate', details: error.message });
  }
});

// Get candidates (paginated)
app.get('/api/candidates', async (req, res) => {
  try {
    const { page = 1, sortBy = 'final_score', sortOrder = 'desc', search = '' } = req.query;
    const result = await db.getCandidates({
      page: parseInt(page),
      sortBy,
      sortOrder,
      search
    });
    res.json(result);
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates', details: error.message });
  }
});

// Get candidate detail
app.get('/api/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await db.getCandidateWithAnswers(id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json(candidate);
  } catch (error) {
    console.error('Get candidate detail error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate details', details: error.message });
  }
});

// ---------- Error handling middleware ----------
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
  }
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// ---------- Start server ----------
async function start() {
  try {
    await db.initialize();
    console.log('Database initialized successfully');

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
