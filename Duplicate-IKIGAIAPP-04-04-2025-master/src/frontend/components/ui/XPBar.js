import React from 'react';
import ProgressBar from './ProgressBar';

const XPBar = ({ points, level }) => {
  const pointsInCurrentLevel = points % 500;
  const percentage = (pointsInCurrentLevel / 500) * 100;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm mr-2">
            {level}
          </div>
          <div className="text-xs text-gray-500">Niveau</div>
        </div>
        <div className="text-xs font-medium bg-blue-100 text-blue-800 rounded-full px-2 py-1">
          {pointsInCurrentLevel}/500 XP
        </div>
      </div>
      <ProgressBar value={percentage} color="#4EAAF0" height="h-4" />
    </div>
  );
};

export default XPBar;