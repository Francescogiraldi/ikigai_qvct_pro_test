import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Sélecteur d'humeur avec émojis
 */
const MoodSelector = ({ 
  onSelect, 
  initialMood = null,
  color = '#4F46E5'
}) => {
  const [selectedMood, setSelectedMood] = useState(initialMood);
  
  const moods = [
    { value: 1, emoji: '😫', label: 'Très mal' },
    { value: 2, emoji: '😟', label: 'Mal' },
    { value: 3, emoji: '😐', label: 'Neutre' },
    { value: 4, emoji: '🙂', label: 'Bien' },
    { value: 5, emoji: '😄', label: 'Très bien' }
  ];
  
  const handleSelect = (mood) => {
    setSelectedMood(mood.value);
    if (onSelect) onSelect(mood.value);
  };
  
  return (
    <div className="w-full">
      <motion.div 
        className="flex justify-between items-end gap-1 sm:gap-2 p-1 sm:p-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {moods.map((mood, index) => (
          <motion.div
            key={mood.value}
            className="flex flex-col items-center cursor-pointer"
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              scale: selectedMood === mood.value ? 1.15 : 1,
              y: selectedMood === mood.value ? -8 : 0 
            }}
            onClick={() => handleSelect(mood)}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <motion.div 
              className="text-2xl sm:text-3xl md:text-4xl relative"
              animate={{ 
                rotate: selectedMood === mood.value ? [0, 5, -5, 0] : 0,
                filter: selectedMood === mood.value ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' : 'none'
              }}
              transition={{ 
                rotate: { 
                  repeat: selectedMood === mood.value ? Infinity : 0, 
                  duration: 0.5, 
                  repeatDelay: 1
                }
              }}
            >
              {mood.emoji}
              
              {/* Cercle de sélection */}
              <AnimatePresence>
                {selectedMood === mood.value && (
                  <motion.div
                    className="absolute -inset-2 rounded-full -z-10"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      background: `radial-gradient(circle, ${color}40 0%, ${color}00 70%)`
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
            
            <motion.div 
              className="text-xs mt-1 font-medium text-center"
              animate={{ 
                color: selectedMood === mood.value ? color : '#6B7280',
                fontWeight: selectedMood === mood.value ? '600' : '400'
              }}
            >
              {mood.label}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Barre de progression visuelle */}
      <motion.div 
        className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: selectedMood ? 1 : 0 }}
      >
        <motion.div 
          className="h-full rounded-full"
          style={{ 
            background: `linear-gradient(to right, #EF4444, #FBBF24, #10B981)`,
            width: selectedMood ? `${(selectedMood / 5) * 100}%` : '0%'
          }}
          initial={{ width: '0%' }}
          animate={{ width: selectedMood ? `${(selectedMood / 5) * 100}%` : '0%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </motion.div>
    </div>
  );
};

export default MoodSelector;