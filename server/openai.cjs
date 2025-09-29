const OpenAI = require('openai');

class OpenAIService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async extractContactInfo(text) {
    const prompt = `
Extract contact information from the following resume text. Return ONLY a JSON object with the following format:
{
  "name": "Full Name or null",
  "email": "email@example.com or null",
  "phone": "phone number or null"
}

Resume text:
${text.substring(0, 2000)}
    `.trim();

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a resume parser. Extract contact information and return ONLY valid JSON. If information is not found, use null values.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.0,
        max_tokens: 200,
      });

      const result = response.choices[0].message.content.trim();
      
      try {
        return JSON.parse(result);
      } catch (parseError) {
        console.error('Failed to parse OpenAI contact extraction response:', result);
        return { name: null, email: null, phone: null };
      }

    } catch (error) {
      console.error('OpenAI contact extraction error:', error);
      return { name: null, email: null, phone: null };
    }
  }

  async generateQuestion(role, difficulty, priorContext = '') {
    const { v4: uuidv4 } = require('uuid');
    
    const timeLimits = {
      easy: 20,
      medium: 60,
      hard: 120
    };

    const systemPrompt = `You are an interview question generator for ${role} developers. Return ONLY valid JSON with the exact format shown below. Do not include any other text or explanation.`;

    const userPrompt = `
Generate 1 interview question for a ${role} developer role with ${difficulty} difficulty level.

${priorContext ? `Previous questions context:\n${priorContext}\n\n` : ''}

Requirements:
- ${difficulty} difficulty level
- Relevant to ${role} development
- Clear and specific
- Time limit: ${timeLimits[difficulty]} seconds

Return ONLY this JSON format:
{
  "question_id": "<uuid>",
  "question_text": "Your question here",
  "difficulty": "${difficulty}",
  "time_limit": ${timeLimits[difficulty]}
}
    `.trim();

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.2,
          max_tokens: 300,
        });

        const result = response.choices[0].message.content.trim();
        
        try {
          const parsed = JSON.parse(result);
          return {
            question_id: uuidv4(),
            question_text: parsed.question_text,
            difficulty: difficulty,
            time_limit: timeLimits[difficulty]
          };
        } catch (parseError) {
          console.error(`Attempt ${attempts + 1} - Failed to parse question generation response:`, result);
          attempts++;
        }

      } catch (error) {
        console.error(`Attempt ${attempts + 1} - OpenAI question generation error:`, error);
        attempts++;
      }
    }

    // Fallback question if all attempts fail
    return {
      question_id: uuidv4(),
      question_text: `Describe your experience with ${role} development and explain a challenging problem you've solved recently.`,
      difficulty: difficulty,
      time_limit: timeLimits[difficulty]
    };
  }

  async evaluateAnswer(questionText, difficulty, answerText) {
    const systemPrompt = `You are an interviewer evaluator. Score the candidate answer 0-10 (integer only). Consider correctness, completeness, depth, and clarity. Output ONLY valid JSON with exactly this format:
{
  "score": integer_0_to_10,
  "feedback": "Brief 1-2 sentence evaluation",
  "confidence": number_0_to_1
}`;

    const userPrompt = `
Question: ${questionText}
Difficulty: ${difficulty}
Candidate answer: ${answerText || 'No answer provided'}

Evaluate this answer and provide score (0-10), feedback, and confidence level.
    `.trim();

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 200,
        });

        const result = response.choices[0].message.content.trim();
        
        try {
          const evaluation = JSON.parse(result);
          
          // Validate the response structure
          if (typeof evaluation.score === 'number' && 
              typeof evaluation.feedback === 'string' && 
              typeof evaluation.confidence === 'number') {
            
            // Ensure score is within bounds
            evaluation.score = Math.max(0, Math.min(10, Math.round(evaluation.score)));
            evaluation.confidence = Math.max(0, Math.min(1, evaluation.confidence));
            
            return evaluation;
          } else {
            throw new Error('Invalid response structure');
          }

        } catch (parseError) {
          console.error(`Attempt ${attempts + 1} - Failed to parse evaluation response:`, result);
          attempts++;
        }

      } catch (error) {
        console.error(`Attempt ${attempts + 1} - OpenAI evaluation error:`, error);
        attempts++;
      }
    }

    // Fallback evaluation if all attempts fail
    const score = answerText && answerText.trim() ? 5 : 0;
    return {
      score: score,
      feedback: answerText && answerText.trim() 
        ? 'Unable to evaluate answer due to technical issues, assigned neutral score.' 
        : 'No answer provided.',
      confidence: 0.1
    };
  }

  async generateFinalSummary(answers) {
    const systemPrompt = `You are an interview summarizer. Based on the candidate's performance across all questions, provide a concise 2-4 sentence summary and calculate a final weighted score. Return ONLY valid JSON.`;

    const answersText = answers.map((answer, index) => 
      `Q${index + 1} (${answer.difficulty}): Score ${answer.score}/10 - ${answer.feedback}`
    ).join('\n');

    const userPrompt = `
Interview Results:
${answersText}

Scoring weights: Easy=1, Medium=2, Hard=3

Provide a summary and calculate the final weighted score.

Return ONLY this JSON format:
{
  "final_score": number,
  "summary": "2-4 sentence summary of performance"
}
    `.trim();

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 250,
      });

      const result = response.choices[0].message.content.trim();
      return JSON.parse(result);

    } catch (error) {
      console.error('OpenAI final summary error:', error);
      
      // Fallback calculation
      const weights = { easy: 1, medium: 2, hard: 3 };
      let totalWeightedScore = 0;
      let totalWeight = 0;

      answers.forEach(answer => {
        if (answer.score !== undefined) {
          const weight = weights[answer.difficulty] || 1;
          totalWeightedScore += answer.score * weight;
          totalWeight += weight;
        }
      });

      const finalScore = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 10) / 10 : 0;

      return {
        final_score: finalScore,
        summary: 'Interview completed. Performance evaluation based on technical responses and problem-solving approach.'
      };
    }
  }
}

module.exports = OpenAIService;