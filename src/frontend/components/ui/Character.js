import React from 'react';
import { motion } from 'framer-motion';

const Character = ({ character = "🧘", emotion = "neutral", className = "", size = "text-4xl" }) => {
  const animations = {
    neutral: {
      y: [0, -5, 0],
      transition: { repeat: Infinity, duration: 2 }
    },
    happy: {
      y: [0, -10, 0],
      rotate: [0, 5, 0, -5, 0],
      transition: { repeat: Infinity, duration: 1.5 }
    },
    excited: {
      y: [0, -15, 0],
      scale: [1, 1.1, 1],
      transition: { repeat: Infinity, duration: 0.8 }
    }
  };
  
  return (
    <motion.div
      className={`${size} ${className}`}
      animate={animations[emotion]}
    >
      {character}
    </motion.div>
  );
};

export default Character;