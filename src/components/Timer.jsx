import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const Timer = ({ timeRemaining, isRunning, difficulty }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeLimits = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 20;
      case 'medium': return 60;
      case 'hard': return 120;
      default: return 60;
    }
  };

  const totalTime = getTimeLimits(difficulty);
  const percentage = (timeRemaining / totalTime) * 100;
  const isLowTime = timeRemaining <= 10;

  return (
    <div className="flex items-center space-x-3">
      <div className={`flex items-center space-x-2 ${isLowTime ? 'text-red-600' : 'text-gray-600'}`}>
        {isLowTime ? <AlertTriangle size={18} /> : <Clock size={18} />}
        <span className={`font-mono text-lg font-semibold ${isLowTime ? 'animate-pulse' : ''}`}>
          {formatTime(timeRemaining)}
        </span>
      </div>
      
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            percentage > 50 ? 'bg-green-500' :
            percentage > 25 ? 'bg-yellow-500' :
            'bg-red-500'
          }`}
          style={{ width: `${Math.max(0, percentage)}%` }}
        />
      </div>
    </div>
  );
};

export default Timer;