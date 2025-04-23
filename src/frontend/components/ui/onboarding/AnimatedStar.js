import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Composant pour afficher une étoile de notation avec animation
 */
const AnimatedStar = ({ filled, onClick, size = 'md', color = '#FFD700', index = 0 }) => {
  // Tailles disponibles
  const sizes = {
    sm: '20px',
    md: '28px',
    lg: '36px',
    xl: '44px'
  };
  
  const fontSize = sizes[size] || sizes.md;
  
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.2, rotate: [-5, 5, 0], transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
    >
      <div
        className="cursor-pointer relative"
        style={{ width: fontSize, height: fontSize, userSelect: 'none' }}
      >
        {/* Étoile de base (contour) */}
        <div
          style={{
            position: 'absolute',
            fontSize,
            opacity: filled ? 0.3 : 1,
            color: filled ? color : '#d1d5db',
            transition: 'color 0.3s ease, opacity 0.3s ease'
          }}
        >
          ☆
        </div>
      
        {/* Étoile remplie avec animation */}
        <AnimatePresence>
          {filled && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ 
                scale: 1,
                rotate: [0, 5, 0, -5, 0],
              }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.3, type: "spring" }}
              style={{ 
                position: 'absolute',
                fontSize,
                color: color,
                zIndex: 1,
              }}
            >
              ★
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AnimatedStar;