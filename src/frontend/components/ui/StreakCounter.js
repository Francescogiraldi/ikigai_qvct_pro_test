import React from 'react';

const StreakCounter = ({ streak }) => (
  <div className="bg-white rounded-xl shadow-sm p-3 flex items-center">
    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 text-white mr-3">
      <span className="text-2xl">🔥</span>
    </div>
    <div>
      <div className="text-xs text-gray-500">Série de bien-être</div>
      <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">
        {streak} jour{streak > 1 ? 's' : ''}
      </div>
    </div>
  </div>
);

export default StreakCounter;