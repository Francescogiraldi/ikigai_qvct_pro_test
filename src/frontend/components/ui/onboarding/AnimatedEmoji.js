import React from 'react';
import { motion } from 'framer-motion';

/**
 * Emoji animé avec différents types d'animations
 */
const AnimatedEmoji = ({ emoji, animation = 'pulse', size = 'md', className = '', color = '#4F46E5' }) => {
  // Définir les tailles disponibles
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  // Définir les animations disponibles
  const animations = {
    pulse: 'emoji-pulse',
    bounce: 'emoji-bounce',
    rotate: 'emoji-rotate',
    wave: 'emoji-wave'
  };

  // Convertir la couleur en RGB pour l'utiliser dans les animations
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const formattedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);
    return result ? 
      { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } 
      : { r: 79, g: 70, b: 229 }; // Default indigo color if parsing fails
  };

  const rgb = hexToRgb(color);
  const boxShadow = `0 4px 15px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;

  return (
    <motion.div 
      className={`emoji-animated ${animations[animation] || ''} ${className}`}
      style={{ 
        backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
        boxShadow,
        borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
      }}
      whileHover={{ 
        y: -5, 
        boxShadow: `0 8px 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` 
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 10
      }}
    >
      <span className={sizes[size] || sizes.md}>
        {emoji}
      </span>
    </motion.div>
  );
};

export default AnimatedEmoji;