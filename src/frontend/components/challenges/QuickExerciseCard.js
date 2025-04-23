import React from 'react';
import { motion } from 'framer-motion';

const QuickExerciseCard = ({ exercise, onStart }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white p-4 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer"
    onClick={onStart}
  >
    <div 
      className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-2xl mb-2" 
      style={{ backgroundColor: `${exercise.color}20`, color: exercise.color }}
    >
      {exercise.icon}
    </div>
    <div className="font-medium">{exercise.title}</div>
    <div className="text-xs text-gray-500">{exercise.duration}</div>
  </motion.div>
);

export default QuickExerciseCard;