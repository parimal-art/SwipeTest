const Database = require('./database');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  console.log('Seeding database with test data...');
  
  try {
    const db = new Database();
    await db.initialize();

    // Create test candidates
    const candidates = [
      {
        id: uuidv4(),
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1-555-0123',
        status: 'completed',
        final_score: 8.5,
        summary: 'Strong technical knowledge with excellent problem-solving skills. Demonstrated good understanding of React and Node.js concepts.',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: uuidv4(),
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phone: '+1-555-0124',
        status: 'completed',
        final_score: 6.2,
        summary: 'Adequate technical skills but needs improvement in advanced concepts. Good communication and eager to learn.',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: uuidv4(),
        name: 'Mike Chen',
        email: 'mike.chen@example.com',
        phone: '+1-555-0125',
        status: 'in_progress',
        final_score: null,
        summary: '',
        created_at: new Date().toISOString(),
      }
    ];

    for (const candidate of candidates) {
      await db.saveCandidate(candidate);
      console.log(`Created candidate: ${candidate.name}`);
    }

    // Add sample answers for completed candidates
    const sampleAnswers = [
      {
        candidate_id: candidates[0].id,
        question_id: uuidv4(),
        question_text: 'Explain the difference between let, const, and var in JavaScript.',
        difficulty: 'easy',
        answer_text: 'let and const are block-scoped while var is function-scoped. const cannot be reassigned after declaration, while let can be. var has hoisting behavior that can cause issues.',
        score: 9,
        feedback: 'Excellent explanation covering all key differences clearly.',
        confidence: 0.95,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        candidate_id: candidates[0].id,
        question_id: uuidv4(),
        question_text: 'How would you implement authentication in a React application?',
        difficulty: 'medium',
        answer_text: 'I would use JWT tokens stored in httpOnly cookies for security. Implement login/logout endpoints, use context for auth state, and protect routes with higher-order components.',
        score: 8,
        feedback: 'Good approach mentioning security best practices and React patterns.',
        confidence: 0.88,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
      }
    ];

    for (const answer of sampleAnswers) {
      await db.saveAnswer(answer);
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();