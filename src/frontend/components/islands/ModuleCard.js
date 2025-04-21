import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

const ModuleCard = ({ module, onStart, isUnlocked, isCompleted, color }) => (
  <motion.div
    whileHover={isUnlocked ? { scale: 1.02 } : {}}
    className={`bg-white rounded-xl shadow-sm overflow-hidden ${
      isUnlocked ? 'cursor-pointer' : 'opacity-70'
    }`}
  >
    <div className="p-5" style={{ borderLeft: isCompleted ? `4px solid ${color}` : '4px solid #e2e8f0' }}>
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3"
            style={{ backgroundColor: isCompleted ? color : '#e2e8f0' }}
          >
            <span className="text-xl">{module.icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{module.title}</h3>
            <div className="flex text-xs text-gray-500">
              <span className="flex items-center mr-3">
                <span className="mr-1">⏰️</span>
                {module.duration}
              </span>
              <span className="flex items-center">
                <span className="mr-1">✨</span>
                {module.points} points
              </span>
            </div>
          </div>
        </div>
        
        {isCompleted && (
          <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            <span className="mr-1">✓</span> Complété
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-600 my-3">{module.description}</p>
      
      <div className="flex justify-end">
        <Button 
          color={color}
          onClick={onStart}
          disabled={!isUnlocked}
          size="sm"
          variant={isCompleted ? "secondary" : "primary"}
        >
          {isCompleted ? 'Revisiter' : 'Commencer'}
        </Button>
      </div>
    </div>
  </motion.div>
);

export default ModuleCard;