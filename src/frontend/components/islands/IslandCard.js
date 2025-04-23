import React from 'react';
import { motion } from 'framer-motion';
import ProgressBar from '../ui/ProgressBar';

const IslandCard = ({ island, progress = 0, completedModules = 0, isUnlocked, onClick }) => (
  <motion.div 
    whileHover={isUnlocked ? { scale: 1.02 } : {}}
    className={`bg-white rounded-xl shadow-md overflow-hidden relative ${
      isUnlocked ? 'cursor-pointer' : 'opacity-80'
    }`}
    onClick={() => isUnlocked && onClick()}
  >
    <div className="p-5">
      <div className="flex items-start">
        <div className="relative mr-4">
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl text-white shadow-sm"
            style={{ backgroundColor: island.color }}
          >
            <span>{island.icon}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
            <span className="text-xl">{island.mascot}</span>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-lg text-gray-800">{island.name}</h3>
            
            {!isUnlocked && (
              <div className="text-xl">🔒</div>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{island.description}</p>
          
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">{completedModules}/{island.modules} modules</span>
            <span className="font-bold" style={{ color: island.color }}>{progress}%</span>
          </div>
          
          <ProgressBar value={progress} color={island.color} height="h-2" />
        </div>
      </div>
    </div>
  </motion.div>
);

export default IslandCard;