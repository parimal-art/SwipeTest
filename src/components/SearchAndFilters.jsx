import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, fetchCandidates } from '../store/dashboardSlice';
import { Search, Filter, Import as SortAsc, Dessert as SortDesc } from 'lucide-react';

const SearchAndFilters = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector(state => state.dashboard);
  const [searchTerm, setSearchTerm] = useState(filters.search);

  const handleSearch = (e) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchTerm, page: 1 };
    dispatch(setFilters(newFilters));
    dispatch(fetchCandidates(newFilters));
  };

  const handleSortChange = (sortBy) => {
    const sortOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    const newFilters = { ...filters, sortBy, sortOrder, page: 1 };
    dispatch(setFilters(newFilters));
    dispatch(fetchCandidates(newFilters));
  };

  const sortOptions = [
    { key: 'final_score', label: 'Score' },
    { key: 'name', label: 'Name' },
    { key: 'created_at', label: 'Date' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidates by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Sort by:</span>
          
          <div className="flex space-x-1">
            {sortOptions.map(option => (
              <button
                key={option.key}
                onClick={() => handleSortChange(option.key)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                  filters.sortBy === option.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{option.label}</span>
                {filters.sortBy === option.key && (
                  filters.sortOrder === 'desc' ? 
                    <SortDesc size={14} /> : 
                    <SortAsc size={14} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilters;