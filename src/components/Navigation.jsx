import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveView } from '../store/appSlice';
import { Users, MessageSquare } from 'lucide-react';

const Navigation = () => {
  const dispatch = useDispatch();
  const { activeView } = useSelector(state => state.app);

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">AI Interview Assistant</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => dispatch(setActiveView('interviewee'))}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'interviewee'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <MessageSquare size={18} />
              <span className="hidden sm:inline">Interview</span>
            </button>
            
            <button
              onClick={() => dispatch(setActiveView('interviewer'))}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'interviewer'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Users size={18} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;