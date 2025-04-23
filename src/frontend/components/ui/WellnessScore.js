import React from 'react';
import ProgressBar from './ProgressBar';

const WellnessScore = ({ score }) => {
  // Determine color based on score
  let color, emoji;
  if (score >= 80) {
    color = "#41D185"; // Green for excellent
    emoji = "😊";
  } else if (score >= 60) {
    color = "#4EAAF0"; // Blue for good
    emoji = "🙂";
  } else if (score >= 40) {
    color = "#FF8747"; // Orange for moderate
    emoji = "😐";
  } else {
    color = "#FF5252"; // Red for needs improvement
    emoji = "😟";
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">Score de bien-être</span>
        <span className="text-xl">{emoji}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="w-full mr-3">
          <ProgressBar value={score} color={color} height="h-4" />
        </div>
        <div className="font-bold text-lg" style={{ color }}>
          {score}%
        </div>
      </div>
    </div>
  );
};

export default WellnessScore;