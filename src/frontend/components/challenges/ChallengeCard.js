import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

const ChallengeCard = ({ challenge, onComplete, isCompleted }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-xl shadow-sm overflow-hidden"
  >
    <div className="p-4">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3" style={{ backgroundColor: challenge.color }}>
          <span className="text-xl">{challenge.icon}</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-800">{challenge.title}</h3>
          <div className="flex text-xs text-gray-500">
            <span className="flex items-center mr-3">
              <span className="mr-1">⏰️</span>
              {challenge.duration}
            </span>
            <span className="flex items-center">
              <span className="mr-1">✨</span>
              {challenge.points} points
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
      
      <div className="flex justify-end">
        <Button 
          color={challenge.color}
          onClick={() => onComplete(challenge.id)}
          disabled={isCompleted}
          size="sm"
          variant={isCompleted ? "secondary" : "primary"}
          icon={isCompleted ? "✓" : ""}
        >
          {isCompleted ? 'Complété' : 'Commencer'}
        </Button>
      </div>
    </div>
  </motion.div>
);

export default ChallengeCard;