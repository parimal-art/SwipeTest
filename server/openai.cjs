// server/openai.cjs
const { v4: uuidv4 } = require('uuid');

let OpenAI;
try {
  OpenAI = require('openai');
} catch (e) {
  // ok if not installed; module will run in MOCK mode when no key
}

/**
 * OpenAIService(apiKey, baseURL)
 * - apiKey: string (may be OpenRouter key starting with sk-or-...)
 * - baseURL: optional string (e.g. https://openrouter.ai/api/v1)
 *
 * Uses process.env.OPENAI_MODEL if present, otherwise falls back to gpt-3.5-turbo.
 */
class OpenAIService {
  constructor(apiKey, baseURL) {
    this.enabled = !!apiKey && !!OpenAI;
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

    if (this.enabled) {
      // pass baseURL when using OpenRouter
      this.openai = new OpenAI({
        apiKey,
        baseURL: baseURL || undefined
      });
    } else {
      if (!apiKey) console.warn('OpenAI API key not provided. Running in MOCK mode.');
      else console.warn('openai package not installed. Running in MOCK mode.');
    }
  }

  // helper to safely read chat content across client versions
  _getMessageContent(resp) {
    try {
      // new client may return resp.output_text or resp.output or choices[0].message.content
      if (!resp) return '';
      if (resp.output_text) return resp.output_text;
      if (Array.isArray(resp.output)) {
        return resp.output.map(part => {
          if (typeof part === 'string') return part;
          if (part.content) return Array.isArray(part.content) ? part.content.map(c => c.text || c).join('') : (part.content[0]?.text || '');
          return '';
        }).join(' ');
      }
      if (resp.choices && resp.choices[0]) {
        return resp.choices[0].message?.content?.trim() || resp.choices[0].text || '';
      }
      return JSON.stringify(resp).slice(0, 2000);
    } catch (e) {
      return '';
    }
  }

  _logOpenAIError(prefix, err) {
    try {
      const status = err?.status || err?.response?.status;
      const data = err?.response?.data || err?.response?.body || err?.message;
      console.error(prefix, { status, data });
    } catch (e) {
      console.error(prefix, err);
    }
  }

  async extractContactInfo(text) {
    if (!this.enabled) return { name: null, email: null, phone: null };

    const prompt = `
Extract contact information from the following resume text. Return ONLY a JSON object exactly like:
{"name": "Full Name or null", "email": "email@example.com or null", "phone": "phone number or null"}

Resume text:
${(text || '').substring(0, 2000)}
    `.trim();

    try {
      const resp = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a resume parser. Extract contact information and return ONLY valid JSON. If information is not found, use null values.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.0,
        max_tokens: 200
      });

      const result = this._getMessageContent(resp).trim();

      try {
        const parsed = JSON.parse(result);
        return {
          name: parsed.name ?? null,
          email: parsed.email ?? null,
          phone: parsed.phone ?? null
        };
      } catch (parseError) {
        console.error('Failed to parse contact extraction JSON. Raw output:', result);
        return { name: null, email: null, phone: null };
      }
    } catch (err) {
      this._logOpenAIError('OpenAI contact extraction error:', err);
      return { name: null, email: null, phone: null };
    }
  }

  async generateQuestion(role, difficulty, priorContext = '') {
    const timeLimits = { easy: 20, medium: 60, hard: 120 };
    if (!this.enabled) {
      return {
        question_id: uuidv4(),
        question_text: `Mock question for ${role} (${difficulty})`,
        difficulty,
        time_limit: timeLimits[difficulty] || 60
      };
    }

    const systemPrompt = `You are an interview question generator for ${role} developers. Return ONLY valid JSON with the exact format shown below. Do not include any other text or explanation.`;
    const userPrompt = `
Generate 1 interview question for a ${role} developer role with ${difficulty} difficulty level.

${priorContext ? `Previous questions context:\n${priorContext}\n\n` : ''}

Return ONLY this JSON format:
{
  "question_id": "<uuid>",
  "question_text": "Your question here",
  "difficulty": "${difficulty}",
  "time_limit": ${timeLimits[difficulty] || 60}
}
    `.trim();

    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        const resp = await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.2,
          max_tokens: 300
        });

        const result = this._getMessageContent(resp).trim();
        try {
          const parsed = JSON.parse(result);
          return {
            question_id: parsed.question_id || uuidv4(),
            question_text: parsed.question_text || parsed.question || parsed.prompt || result,
            difficulty: difficulty,
            time_limit: parsed.time_limit || timeLimits[difficulty] || 60
          };
        } catch (parseError) {
          console.error(`Attempt ${attempts + 1} - Failed to parse question JSON. Raw:`, result);
          attempts++;
        }
      } catch (err) {
        this._logOpenAIError(`Attempt ${attempts + 1} - OpenAI question generation error:`, err);
        attempts++;
      }
    }

    return {
      question_id: uuidv4(),
      question_text: `Describe your experience with ${role} development and explain a challenging problem you've solved recently.`,
      difficulty,
      time_limit: timeLimits[difficulty] || 60
    };
  }

  async evaluateAnswer(questionText, difficulty, answerText) {
    if (!this.enabled) {
      return { score: answerText && answerText.trim() ? 5 : 0, feedback: 'Mock eval', confidence: 0.3 };
    }

    const systemPrompt = `You are an interviewer evaluator. Score the candidate answer 0-10 (integer only). Consider correctness, completeness, depth, and clarity. Output ONLY valid JSON with exactly this format:
{"score": integer_0_to_10, "feedback": "Brief 1-2 sentence evaluation", "confidence": number_0_to_1}
`;
    const userPrompt = `
Question: ${questionText}
Difficulty: ${difficulty}
Candidate answer: ${answerText || 'No answer provided'}

Evaluate and return ONLY the JSON.
    `.trim();

    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        const resp = await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 200
        });

        const result = this._getMessageContent(resp).trim();
        try {
          const evaluation = JSON.parse(result);

          if (typeof evaluation.score === 'number' &&
              typeof evaluation.feedback === 'string' &&
              typeof evaluation.confidence === 'number') {

            evaluation.score = Math.max(0, Math.min(10, Math.round(evaluation.score)));
            evaluation.confidence = Math.max(0, Math.min(1, evaluation.confidence));
            return evaluation;
          } else {
            throw new Error('Invalid structure');
          }
        } catch (parseError) {
          console.error(`Attempt ${attempts + 1} - Failed to parse evaluation JSON. Raw:`, result);
          attempts++;
        }
      } catch (err) {
        this._logOpenAIError(`Attempt ${attempts + 1} - OpenAI evaluation error:`, err);
        attempts++;
      }
    }

    const score = answerText && answerText.trim() ? 5 : 0;
    return {
      score,
      feedback: answerText && answerText.trim() ? 'Unable to evaluate fully due to technical issues. Neutral score assigned.' : 'No answer provided.',
      confidence: 0.1
    };
  }

  async generateFinalSummary(answers = []) {
    if (!this.enabled) {
      const avg = answers.length ? Math.round((answers.reduce((s,a)=>s+(a.score||0),0)/answers.length)*10)/10 : 0;
      return { final_score: avg, summary: 'Mock summary: interview completed.' };
    }

    const systemPrompt = `You are an interview summarizer. Provide a concise 2-4 sentence summary and calculate a final weighted score. Return ONLY valid JSON.`;
    const answersText = answers.map((a,i)=>`Q${i+1} (${a.difficulty}): Score ${a.score}/10 - ${a.feedback || ''}`).join('\n');

    const userPrompt = `
Interview Results:
${answersText}

Weights: Easy=1, Medium=2, Hard=3

Return ONLY this JSON:
{"final_score": number, "summary": "2-4 sentence summary"}
    `.trim();

    try {
      const resp = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 250
      });

      const result = this._getMessageContent(resp).trim();
      return JSON.parse(result);
    } catch (err) {
      this._logOpenAIError('OpenAI final summary error:', err);

      const weights = { easy: 1, medium: 2, hard: 3 };
      let totalWeightedScore = 0, totalWeight = 0;
      answers.forEach(answer => {
        if (typeof answer.score === 'number') {
          const weight = weights[answer.difficulty] || 1;
          totalWeightedScore += answer.score * weight;
          totalWeight += weight;
        }
      });
      const finalScore = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 10) / 10 : 0;
      return {
        final_score: finalScore,
        summary: 'Interview completed. Performance evaluated using weighted scores across questions.'
      };
    }
  }
}

module.exports = OpenAIService;
