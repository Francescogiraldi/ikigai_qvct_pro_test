import React from 'react';

const ProgressBar = ({ value, color = "#41D185", height = "h-2.5" }) => (
  <div className={`w-full bg-gray-200 rounded-full ${height}`}>
    <div 
      className={`${height} rounded-full transition-all duration-500`}
      style={{ width: `${value}%`, backgroundColor: color }}
    />
  </div>
);

export default ProgressBar;