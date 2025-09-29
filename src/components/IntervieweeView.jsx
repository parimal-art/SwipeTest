import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { resetCandidate } from '../store/candidateSlice';
import { resetInterview } from '../store/interviewSlice';
import ResumeUpload from './ResumeUpload';
import CandidateInfo from './CandidateInfo';
import InterviewChat from './InterviewChat';
import InterviewComplete from './InterviewComplete';

const IntervieweeView = () => {
  const dispatch = useDispatch();
  const { status: candidateStatus, name, email, phone } = useSelector(state => state.candidate);
  const { status: interviewStatus } = useSelector(state => state.interview);

  const handleStartNew = () => {
    dispatch(resetCandidate());
    dispatch(resetInterview());
  };

  const renderCurrentStep = () => {
    // If no resume uploaded yet
    if (!candidateStatus || candidateStatus === 'not_started') {
      return <ResumeUpload />;
    }

    // If missing required fields
    if (!name || !email || !phone) {
      return <CandidateInfo />;
    }

    // If interview completed
    if (interviewStatus === 'completed') {
      return <InterviewComplete />;
    }

    // Interview in progress or ready to start
    return <InterviewChat />;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">AI Interview</h2>
        <button
          onClick={handleStartNew}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Start New Interview
        </button>
      </div>

      {renderCurrentStep()}
    </div>
  );
};

export default IntervieweeView;