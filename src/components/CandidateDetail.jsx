import React from 'react';
import { ArrowLeft, User, Mail, Phone, Calendar, Award, Clock, MessageSquare } from 'lucide-react';

const CandidateDetail = ({ candidate, onBack }) => {
  if (!candidate) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
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
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to List</span>
        </button>
        
        <h2 className="text-3xl font-bold text-gray-900">Candidate Details</h2>
      </div>

      {/* Candidate Info */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-500">Name</div>
              <div className="font-semibold text-gray-900">{candidate.name}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-semibold text-gray-900">{candidate.email}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-500">Phone</div>
              <div className="font-semibold text-gray-900">{candidate.phone}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-500">Interview Date</div>
              <div className="font-semibold text-gray-900">{formatDate(candidate.created_at)}</div>
            </div>
          </div>
        </div>

        {/* Final Score */}
        {candidate.final_score !== null && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Final Score</h3>
                {candidate.summary && (
                  <p className="text-gray-600">{candidate.summary}</p>
                )}
              </div>
              
              <div className={`px-4 py-2 rounded-lg ${getScoreColor(candidate.final_score)}`}>
                <div className="flex items-center space-x-2">
                  <Award size={20} />
                  <span className="text-2xl font-bold">{candidate.final_score}/10</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interview Questions and Answers */}
      {candidate.answers && candidate.answers.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Interview Transcript</h3>
          
          <div className="space-y-6">
            {candidate.answers.map((answer, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-gray-900">Question {index + 1}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(answer.difficulty)}`}>
                      {answer.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {answer.timestamp && (
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>{formatDate(answer.timestamp)}</span>
                      </div>
                    )}
                    
                    {answer.score !== undefined && (
                      <div className={`px-3 py-1 rounded-lg font-semibold ${getScoreColor(answer.score)}`}>
                        {answer.score}/10
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
                    <p className="text-gray-700">{answer.questionText}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <MessageSquare size={16} />
                      <span>Answer:</span>
                    </h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {answer.answerText || 'No answer provided'}
                    </p>
                  </div>
                  
                  {answer.feedback && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Evaluation:</h4>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                        {answer.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDetail;