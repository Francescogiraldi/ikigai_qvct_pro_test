import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ScaleQuestion = ({ question, value, onChange, disabled }) => {
  // Emoji correspondant à chaque niveau de l'échelle
  const emojis = ['😟', '🙁', '😐', '🙂', '😀'];
  
  // Fonction pour déterminer la couleur de fond en fonction de la valeur
  const getBackgroundColor = (scaleValue, isSelected) => {
    if (!isSelected) return 'bg-white';
    
    // Dégradé de couleurs du rouge au vert
    const colors = [
      'bg-red-500',      // 1
      'bg-orange-500',   // 2
      'bg-yellow-500',   // 3
      'bg-lime-500',     // 4
      'bg-green-500'     // 5
    ];
    
    return colors[scaleValue - 1] || 'bg-green-500';
  };

  return (
    <div className="my-6">
      <div className="flex justify-between mb-3 px-2">
        {question.labels?.map((label, index) => (
          <div key={index} className="text-center">
            <div className="text-xs text-gray-500 mb-2">{label}</div>
          </div>
        ))}
      </div>
      
      {/* Émojis au-dessus des boutons pour indiquer l'échelle visuelle */}
      <div className="flex justify-between mb-2 px-2">
        {[...Array(question.max || 5)].map((_, idx) => {
          const scaleValue = idx + 1;
          const emojiIndex = Math.min(idx, emojis.length - 1);
          return (
            <div key={`emoji-${scaleValue}`} className="text-center">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={value === scaleValue ? 'selected' : 'unselected'}
                  initial={{ y: 0, scale: 1 }}
                  animate={value === scaleValue ? 
                    { y: [-5, 0], scale: [1, 1.3, 1.2], rotate: [0, 5, -5, 0] } : 
                    { y: 0, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="text-2xl mb-1"
                >
                  {emojis[emojiIndex]}
                </motion.div>
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      
      {/* Boutons de l'échelle */}
      <div className="flex justify-between">
        {[...Array(question.max || 5)].map((_, idx) => {
          const scaleValue = idx + 1;
          const isSelected = value === scaleValue;
          return (
            <motion.button
              key={scaleValue}
              whileHover={{ scale: 1.15, y: -5 }}
              whileTap={{ scale: 0.85, rotate: [0, -5, 5, 0] }}
              animate={isSelected ? 
                { scale: [1, 1.2, 1.1], boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)" } : 
                { scale: 1, boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
              transition={{ 
                duration: 0.3,
                type: "spring",
                stiffness: 500,
                damping: 15
              }}
              className={`w-16 h-16 rounded-full shadow-md focus:outline-none flex items-center justify-center ${
                isSelected
                  ? `${getBackgroundColor(scaleValue, true)} text-white`
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
              onClick={() => !disabled && onChange(scaleValue)}
              disabled={disabled}
            >
              <span className="text-xl font-bold">{scaleValue}</span>
            </motion.button>
          );
        })}
      </div>
      
      {/* Ligne de progression visuelle */}
      {value && (
        <div className="mt-6 relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full rounded-full"
            style={{ 
              background: "linear-gradient(to right, #ef4444, #f97316, #facc15, #84cc16, #22c55e)",
              width: `${(value / (question.max || 5)) * 100}%` 
            }}
            initial={{ width: 0 }}
            animate={{ width: `${(value / (question.max || 5)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </div>
  );
};

export default ScaleQuestion;