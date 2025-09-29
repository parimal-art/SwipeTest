import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setShowWelcomeBack } from '../store/appSlice';
import { resetCandidate } from '../store/candidateSlice';
import { resetInterview, resumeInterview } from '../store/interviewSlice';
import { X, Play, RotateCcw } from 'lucide-react';

const WelcomeBackModal = () => {
  const dispatch = useDispatch();
  const { name } = useSelector(state => state.candidate);
  const { currentQuestionIndex } = useSelector(state => state.interview);

  const handleResume = () => {
    dispatch(resumeInterview());
    dispatch(setShowWelcomeBack(false));
  };

  const handleRestart = () => {
    localStorage.removeItem('unfinished_session');
    dispatch(resetCandidate());
    dispatch(resetInterview());
    dispatch(setShowWelcomeBack(false));
  };

  const handleClose = () => {
    dispatch(setShowWelcomeBack(false));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Welcome back{name ? `, ${name}` : ''}!
          </h3>
          <p className="text-gray-600">
            We found an unfinished interview session. Would you like to continue where you left off or start fresh?
          </p>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            <span>Progress: Question {currentQuestionIndex + 1} of 6</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleResume}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Play size={18} />
            <span>Resume</span>
          </button>
          
          <button
            onClick={handleRestart}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            <RotateCcw size={18} />
            <span>Start Over</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBackModal;