import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedStar from './AnimatedStar';

/**
 * Composant de notation avec étoiles pour onboarding
 */
const StarRating = ({ 
  maxRating = 5, 
  initialRating = 0, 
  onChange, 
  color = '#FFD700',
  size = 'md',
  className = ''
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleRatingChange = (newRating) => {
    setRating(newRating);
    if (onChange) onChange(newRating);
  };
  
  return (
    <motion.div 
      className={`flex justify-center gap-1 sm:gap-2 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {Array.from({ length: maxRating }, (_, i) => (
        <AnimatedStar
          key={i}
          filled={i < (hoverRating || rating)}
          onClick={() => handleRatingChange(i + 1)}
          onHover={() => setHoverRating(i + 1)}
          onLeave={() => setHoverRating(0)}
          color={color}
          size={size}
          index={i}
        />
      ))}
      
      {/* Labels optionnels sous les étoiles */}
      <AnimatePresence>
        {rating > 0 && (
          <motion.div 
            className="absolute -bottom-7 text-sm font-medium text-center w-full text-gray-600"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {rating === 1 && "Pas satisfait"}
            {rating === 2 && "Peu satisfait"}
            {rating === 3 && "Neutre"}
            {rating === 4 && "Satisfait"}
            {rating === 5 && "Très satisfait"}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StarRating;