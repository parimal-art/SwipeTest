import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCandidates, setFilters } from '../store/dashboardSlice';
import CandidateTable from './CandidateTable';
import CandidateDetail from './CandidateDetail';
import SearchAndFilters from './SearchAndFilters';
import { Users } from 'lucide-react';

const InterviewerView = () => {
  const dispatch = useDispatch();
  const { candidates, loading, pagination, filters, selectedCandidate } = useSelector(state => state.dashboard);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    dispatch(fetchCandidates(filters));
  }, [dispatch, filters]);

  const handleCandidateSelect = (candidate) => {
    setShowDetail(true);
  };

  const handleBackToList = () => {
    setShowDetail(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {!showDetail ? (
        <>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">Interview Dashboard</h2>
            </div>
            
            <div className="text-sm text-gray-500">
              {pagination.totalItems} candidates
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <SearchAndFilters />
            <CandidateTable 
              candidates={candidates}
              loading={loading}
              pagination={pagination}
              onCandidateSelect={handleCandidateSelect}
            />
          </div>
        </>
      ) : (
        <CandidateDetail 
          candidate={selectedCandidate}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
};

export default InterviewerView;