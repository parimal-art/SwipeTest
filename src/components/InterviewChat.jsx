import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  generateQuestion, 
  evaluateAnswer, 
  startInterview,
  nextQuestion,
  setTimer,
  submitAnswer
} from '../store/interviewSlice';
import { saveCandidate } from '../store/candidateSlice';
import Timer from './Timer';
import QuestionCard from './QuestionCard';
import ProgressBar from './ProgressBar';

const DIFFICULTIES = ['easy', 'easy', 'medium', 'medium', 'hard', 'hard'];

const InterviewChat = () => {
  const dispatch = useDispatch();
  const candidate = useSelector(state => state.candidate);
  const interview = useSelector(state => state.interview);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    sessionId, 
    currentQuestionIndex, 
    questions, 
    answers, 
    timerState, 
    status 
  } = interview;

  // Start interview if not started
  useEffect(() => {
    if (status === 'not_started' && candidate.name && candidate.email && candidate.phone) {
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      dispatch(startInterview({ sessionId: newSessionId }));
    }
  }, [status, candidate, dispatch]);

  // Generate current question if not exists
  useEffect(() => {
    if (status === 'in_progress' && !questions[currentQuestionIndex] && currentQuestionIndex < 6) {
      const difficulty = DIFFICULTIES[currentQuestionIndex];
      dispatch(generateQuestion({ 
        role: 'fullstack', 
        difficulty,
        priorContext: answers.map(a => `Q: ${a.questionText}\nA: ${a.answerText}`).join('\n\n')
      }));
    }
  }, [currentQuestionIndex, questions, status, dispatch, answers]);

  // Timer countdown
  useEffect(() => {
    if (timerState.isRunning && timerState.timeRemaining > 0) {
      const timer = setInterval(() => {
        dispatch(setTimer({ timeRemaining: timerState.timeRemaining - 1 }));
      }, 1000);

      return () => clearInterval(timer);
    } else if (timerState.isRunning && timerState.timeRemaining === 0) {
      // Auto-submit on timer expiry
      handleSubmit(true);
    }
  }, [timerState, dispatch]);

  const handleSubmit = async (autoSubmit = false) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const currentAnswer = autoSubmit ? answerText : answerText.trim();
    
    // Submit answer
    dispatch(submitAnswer({ 
      questionIndex: currentQuestionIndex, 
      answerText: currentAnswer 
    }));

    // Stop timer
    dispatch(setTimer({ isRunning: false, timeRemaining: 0 }));

    try {
      // Evaluate answer
      const currentQuestion = questions[currentQuestionIndex];
      const evaluation = await dispatch(evaluateAnswer({
        questionId: currentQuestion.question_id,
        questionText: currentQuestion.question_text,
        difficulty: currentQuestion.difficulty,
        answerText: currentAnswer,
        candidateId: candidate.id,
      })).unwrap();

      // Move to next question
      setTimeout(() => {
        dispatch(nextQuestion());
        setAnswerText('');
        setIsSubmitting(false);
      }, 2000);

    } catch (error) {
      console.error('Failed to evaluate answer:', error);
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const showEvaluation = currentAnswer && currentAnswer.score !== undefined;

  if (status === 'not_started') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Preparing Your Interview</h3>
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProgressBar 
        current={currentQuestionIndex + 1} 
        total={6} 
      />

      {currentQuestion && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <QuestionCard 
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
          />

          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Timer 
                timeRemaining={timerState.timeRemaining}
                isRunning={timerState.isRunning}
                difficulty={currentQuestion.difficulty}
              />
              <span className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of 6
              </span>
            </div>

            {!showEvaluation ? (
              <div className="space-y-4">
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
                
                <button
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting || !answerText.trim()}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Your Answer:</h4>
                  <p className="text-gray-700">{currentAnswer.answerText || 'No answer provided'}</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-900">Evaluation</h4>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      currentAnswer.score >= 8 ? 'bg-green-100 text-green-800' :
                      currentAnswer.score >= 6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {currentAnswer.score}/10
                    </span>
                  </div>
                  <p className="text-blue-800">{currentAnswer.feedback}</p>
                </div>

                <div className="text-center text-gray-500">
                  Moving to next question...
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewChat;