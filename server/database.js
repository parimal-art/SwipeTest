const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class Database {
  constructor() {
    this.db = null;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, 'interview.db');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        console.log('Connected to SQLite database');
        this.createTables()
          .then(() => resolve())
          .catch(reject);
      });
    });
  }

  async createTables() {
    const createCandidatesTable = `
      CREATE TABLE IF NOT EXISTS candidates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        status TEXT DEFAULT 'not_started',
        final_score REAL,
        summary TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `;

    const createAnswersTable = `
      CREATE TABLE IF NOT EXISTS answers (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        question_text TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        answer_text TEXT,
        score INTEGER,
        feedback TEXT,
        confidence REAL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (candidate_id) REFERENCES candidates (id)
      )
    `;

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_candidates_score ON candidates(final_score);
      CREATE INDEX IF NOT EXISTS idx_candidates_created ON candidates(created_at);
      CREATE INDEX IF NOT EXISTS idx_answers_candidate ON answers(candidate_id);
    `;

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(createCandidatesTable, (err) => {
          if (err) reject(err);
        });
        
        this.db.run(createAnswersTable, (err) => {
          if (err) reject(err);
        });
        
        this.db.exec(createIndexes, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  async saveCandidate(candidateData) {
    return new Promise((resolve, reject) => {
      const id = candidateData.id || uuidv4();
      const now = new Date().toISOString();
      
      const query = `
        INSERT OR REPLACE INTO candidates 
        (id, name, email, phone, status, final_score, summary, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(query, [
        id,
        candidateData.name,
        candidateData.email,
        candidateData.phone,
        candidateData.status || 'not_started',
        candidateData.final_score || null,
        candidateData.summary || '',
        candidateData.created_at || now,
        now
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...candidateData, updated_at: now });
        }
      });
    });
  }

  async saveAnswer(answerData) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      
      const query = `
        INSERT INTO answers 
        (id, candidate_id, question_id, question_text, difficulty, answer_text, score, feedback, confidence, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(query, [
        id,
        answerData.candidate_id,
        answerData.question_id,
        answerData.question_text,
        answerData.difficulty,
        answerData.answer_text,
        answerData.score,
        answerData.feedback,
        answerData.confidence,
        answerData.timestamp
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...answerData });
        }
      });
    });
  }

  async getCandidates({ page = 1, sortBy = 'final_score', sortOrder = 'desc', search = '' }) {
    return new Promise((resolve, reject) => {
      const limit = 20;
      const offset = (page - 1) * limit;
      
      let whereClause = '';
      let searchParams = [];
      
      if (search) {
        whereClause = 'WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?';
        const searchTerm = `%${search}%`;
        searchParams = [searchTerm, searchTerm, searchTerm];
      }

      const validSortColumns = ['name', 'email', 'final_score', 'status', 'created_at', 'updated_at'];
      const validSortOrders = ['asc', 'desc'];
      
      if (!validSortColumns.includes(sortBy)) {
        sortBy = 'final_score';
      }
      if (!validSortOrders.includes(sortOrder.toLowerCase())) {
        sortOrder = 'desc';
      }

      const query = `
        SELECT * FROM candidates 
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
        LIMIT ? OFFSET ?
      `;

      const countQuery = `
        SELECT COUNT(*) as total FROM candidates ${whereClause}
      `;

      // Get total count first
      this.db.get(countQuery, searchParams, (err, countResult) => {
        if (err) {
          reject(err);
          return;
        }

        const totalItems = countResult.total;
        const totalPages = Math.ceil(totalItems / limit);

        // Get candidates
        this.db.all(query, [...searchParams, limit, offset], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              candidates: rows,
              pagination: {
                page,
                totalPages,
                totalItems,
                limit
              }
            });
          }
        });
      });
    });
  }

  async getCandidateWithAnswers(candidateId) {
    return new Promise((resolve, reject) => {
      const candidateQuery = 'SELECT * FROM candidates WHERE id = ?';
      const answersQuery = 'SELECT * FROM answers WHERE candidate_id = ? ORDER BY timestamp ASC';

      this.db.get(candidateQuery, [candidateId], (err, candidate) => {
        if (err) {
          reject(err);
          return;
        }

        if (!candidate) {
          resolve(null);
          return;
        }

        this.db.all(answersQuery, [candidateId], (err, answers) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              ...candidate,
              answers: answers || []
            });
          }
        });
      });
    });
  }

  async updateCandidateScore(candidateId, finalScore, summary) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE candidates 
        SET final_score = ?, summary = ?, status = 'completed', updated_at = ?
        WHERE id = ?
      `;

      this.db.run(query, [finalScore, summary, new Date().toISOString(), candidateId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}

module.exports = Database;