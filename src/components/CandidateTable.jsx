import React from 'react';
import { useDispatch } from 'react-redux';
import { fetchCandidateDetail, setSelectedCandidate } from '../store/dashboardSlice';
import { Eye, Mail, Phone, Calendar, Award } from 'lucide-react';

const CandidateTable = ({ candidates, loading, pagination, onCandidateSelect }) => {
  const dispatch = useDispatch();

  const handleViewDetails = async (candidate) => {
    try {
      const detailResult = await dispatch(fetchCandidateDetail(candidate.id)).unwrap();
      dispatch(setSelectedCandidate(detailResult));
      onCandidateSelect(candidate);
    } catch (error) {
      console.error('Failed to fetch candidate details:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading candidates...</p>
      </div>
    );
  }

  if (!candidates.length) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No candidates found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left py-4 px-6 font-semibold text-gray-900">Candidate</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900">Contact</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900">Score</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
            <th className="text-right py-4 px-6 font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        
        <tbody className="divide-y divide-gray-200">
          {candidates.map((candidate) => (
            <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-4 px-6">
                <div>
                  <div className="font-semibold text-gray-900">{candidate.name}</div>
                  {candidate.summary && (
                    <div className="text-sm text-gray-600 mt-1 truncate max-w-xs">
                      {candidate.summary}
                    </div>
                  )}
                </div>
              </td>
              
              <td className="py-4 px-6">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail size={14} />
                    <span className="truncate max-w-xs">{candidate.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone size={14} />
                    <span>{candidate.phone}</span>
                  </div>
                </div>
              </td>
              
              <td className="py-4 px-6">
                {candidate.final_score !== null ? (
                  <div className="flex items-center space-x-2">
                    <Award size={16} className={getScoreColor(candidate.final_score)} />
                    <span className={`font-bold ${getScoreColor(candidate.final_score)}`}>
                      {candidate.final_score}/10
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              
              <td className="py-4 px-6">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                  {candidate.status.replace('_', ' ')}
                </span>
              </td>
              
              <td className="py-4 px-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>{formatDate(candidate.created_at)}</span>
                </div>
              </td>
              
              <td className="py-4 px-6 text-right">
                <button
                  onClick={() => handleViewDetails(candidate)}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
                >
                  <Eye size={14} />
                  <span>View</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            {/* Add pagination controls here if needed */}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateTable;