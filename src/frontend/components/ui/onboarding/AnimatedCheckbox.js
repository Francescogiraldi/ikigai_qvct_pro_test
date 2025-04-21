import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Checkbox modernisé avec animations fluides
 */
const AnimatedCheckbox = ({ 
  label, 
  checked, 
  onChange, 
  color = '#4F46E5',
  className = ''
}) => {
  // Convertir la couleur en RGB pour les animations
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const formattedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);
    return result ? 
      { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } 
      : { r: 79, g: 70, b: 229 }; // Default indigo color if parsing fails
  };
  
  const rgb = hexToRgb(color);
  const rgbValues = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  
  return (
    <motion.div 
      className={`modern-checkbox ${checked ? 'modern-checkbox-checked' : ''} ${className}`}
      style={{ 
        '--checkbox-color': color,
        '--r': rgb.r,
        '--g': rgb.g,
        '--b': rgb.b
      }}
      whileHover={{ 
        y: -2, 
        boxShadow: checked 
          ? `0 8px 15px rgba(${rgbValues}, 0.2)` 
          : '0 8px 15px rgba(0, 0, 0, 0.1)' 
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onChange(!checked)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div 
        className="w-6 h-6 flex items-center justify-center rounded-lg mr-3 relative overflow-hidden"
        style={{ 
          borderColor: checked ? color : '#d1d5db',
          backgroundColor: checked ? color : 'white',
          borderWidth: '2px',
          borderStyle: 'solid',
          boxShadow: checked 
            ? `0 3px 10px rgba(${rgbValues}, 0.3)` 
            : '0 2px 5px rgba(0, 0, 0, 0.05)'
        }}
        animate={{
          scale: checked ? [1, 1.2, 1] : 1,
          rotate: checked ? [0, 10, 0] : 0,
          transition: { duration: 0.4, type: "spring" }
        }}
      >
        {/* Animation de fond lorsque sélectionné */}
        <AnimatePresence>
          {checked && (
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0.3, scale: 0 }}
              animate={{ opacity: 0, scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {checked && (
            <motion.svg
              initial={{ opacity: 0, scale: 0, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0, rotate: 10 }}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))" }}
            >
              <motion.path
                d="M5 13L9 17L19 7"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Effet de pulsation en arrière-plan lorsque checked */}
        {checked && (
          <motion.div
            className="absolute inset-0 rounded-md"
            animate={{ 
              boxShadow: [
                `0 0 0 0 rgba(${rgbValues}, 0.7)`, 
                `0 0 0 8px rgba(${rgbValues}, 0)`
              ],
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 0.5
            }}
          />
        )}
      </motion.div>
      
      {label && (
        <motion.span 
          className="font-medium"
          animate={{ 
            color: checked ? `rgba(${rgbValues}, 1)` : '#374151'
          }}
          transition={{ duration: 0.3 }}
        >
          {label}
        </motion.span>
      )}
    </motion.div>
  );
};

export default AnimatedCheckbox;