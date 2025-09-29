import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const generateQuestion = createAsyncThunk(
  'interview/generateQuestion',
  async ({ role, difficulty, priorContext }) => {
    const response = await fetch('/api/generate-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role, difficulty, prior_context: priorContext }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate question');
    }
    
    return response.json();
  }
);

export const evaluateAnswer = createAsyncThunk(
  'interview/evaluateAnswer',
  async ({ questionId, questionText, difficulty, answerText, candidateId }) => {
    const response = await fetch('/api/evaluate-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question_id: questionId,
        question_text: questionText,
        difficulty,
        answer_text: answerText,
        candidate_id: candidateId,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to evaluate answer');
    }
    
    return response.json();
  }
);

const initialState = {
  sessionId: null,
  currentQuestionIndex: 0,
  questions: [],
  answers: [],
  timerState: {
    timeRemaining: 0,
    isRunning: false,
    isPaused: false,
  },
  status: 'not_started',
  loading: false,
  error: null,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    startInterview: (state, action) => {
      state.sessionId = action.payload.sessionId;
      state.status = 'in_progress';
      state.currentQuestionIndex = 0;
      localStorage.setItem('unfinished_session', state.sessionId);
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < 5) {
        state.currentQuestionIndex += 1;
      } else {
        state.status = 'completed';
        localStorage.removeItem('unfinished_session');
      }
    },
    setTimer: (state, action) => {
      state.timerState = { ...state.timerState, ...action.payload };
    },
    pauseInterview: (state) => {
      state.status = 'paused';
      state.timerState.isPaused = true;
      state.timerState.isRunning = false;
    },
    resumeInterview: (state) => {
      state.status = 'in_progress';
      state.timerState.isPaused = false;
    },
    submitAnswer: (state, action) => {
      const { questionIndex, answerText } = action.payload;
      const question = state.questions[questionIndex];
      
      const answer = {
        questionId: question.question_id,
        answerText,
        timestamp: new Date().toISOString(),
        questionText: question.question_text,
        difficulty: question.difficulty,
      };
      
      state.answers[questionIndex] = answer;
    },
    setAnswerEvaluation: (state, action) => {
      const { questionIndex, evaluation } = action.payload;
      if (state.answers[questionIndex]) {
        state.answers[questionIndex] = { ...state.answers[questionIndex], ...evaluation };
      }
    },
    resetInterview: () => {
      localStorage.removeItem('unfinished_session');
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.questions.push(action.payload);
        
        const timeLimit = action.payload.time_limit;
        state.timerState = {
          timeRemaining: timeLimit,
          isRunning: true,
          isPaused: false,
        };
      })
      .addCase(generateQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(evaluateAnswer.fulfilled, (state, action) => {
        const questionIndex = state.currentQuestionIndex;
        if (state.answers[questionIndex]) {
          state.answers[questionIndex] = { ...state.answers[questionIndex], ...action.payload };
        }
      });
  },
});

export const {
  startInterview,
  nextQuestion,
  setTimer,
  pauseInterview,
  resumeInterview,
  submitAnswer,
  setAnswerEvaluation,
  resetInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;