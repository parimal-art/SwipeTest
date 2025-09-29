import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { resetCandidate } from '../store/candidateSlice';
import { resetInterview } from '../store/interviewSlice';
import { CheckCircle, RotateCcw, Award, TrendingUp } from 'lucide-react';

const InterviewComplete = () => {
  const dispatch = useDispatch();
  const { answers } = useSelector(state => state.interview);
  const { name } = useSelector(state => state.candidate);

  const calculateFinalScore = () => {
    if (!answers.length) return 0;
    
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

    return totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 10) / 10 : 0;
  };

  const finalScore = calculateFinalScore();
  const completedAnswers = answers.filter(a => a.score !== undefined).length;

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score) => {
    if (score >= 8) return 'Excellent performance!';
    if (score >= 6) return 'Good job!';
    if (score >= 4) return 'Room for improvement.';
    return 'Keep practicing!';
  };

  const handleStartNew = () => {
    dispatch(resetCandidate());
    dispatch(resetInterview());
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Interview Complete!
        </h3>
        <p className="text-gray-600">
          Great job, {name}! Here's your interview summary.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-6 bg-blue-50 rounded-lg">
          <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className={`text-3xl font-bold ${getScoreColor(finalScore)} mb-1`}>
            {finalScore}/10
          </div>
          <div className="text-sm text-gray-600">Final Score</div>
        </div>

        <div className="text-center p-6 bg-green-50 rounded-lg">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {completedAnswers}/6
          </div>
          <div className="text-sm text-gray-600">Questions Answered</div>
        </div>

        <div className="text-center p-6 bg-purple-50 rounded-lg">
          <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-gray-900 mb-1">
            {getScoreMessage(finalScore)}
          </div>
          <div className="text-sm text-gray-600">Performance</div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <h4 className="text-lg font-semibold text-gray-900">Question Breakdown</h4>
        {answers.map((answer, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {index + 1} ({answer.difficulty})
              </span>
              <span className={`font-semibold ${getScoreColor(answer.score || 0)}`}>
                {answer.score || 0}/10
              </span>
            </div>
            
            <p className="text-gray-800 mb-2 text-sm">
              {answer.questionText}
            </p>
            
            {answer.feedback && (
              <p className="text-sm text-gray-600 italic">
                {answer.feedback}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={handleStartNew}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          <RotateCcw size={18} />
          <span>Start New Interview</span>
        </button>
      </div>
    </div>
  );
};

export default InterviewComplete;