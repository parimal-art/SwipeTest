import React from 'react';
import { Brain, Zap, Target } from 'lucide-react';

const QuestionCard = ({ question, questionNumber }) => {
  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return <Zap className="w-5 h-5" />;
      case 'medium': return <Target className="w-5 h-5" />;
      case 'hard': return <Brain className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Question {questionNumber}
        </h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getDifficultyColor(question.difficulty)}`}>
          {getDifficultyIcon(question.difficulty)}
          <span className="text-sm font-medium capitalize">
            {question.difficulty}
          </span>
        </div>
      </div>
      
      <p className="text-gray-800 text-lg leading-relaxed">
        {question.question_text}
      </p>
    </div>
  );
};

export default QuestionCard;