import React from 'react';
import { motion } from 'framer-motion';

/**
 * Bouton avec micro-animation au survol et au clic
 */
const AnimatedButton = ({ 
  children, 
  color = '#4F46E5', 
  onClick, 
  className = '',
  icon,
  animation = 'scale',
  disabled = false
}) => {
  // Définir les animations disponibles
  const animations = {
    scale: { 
      whileHover: { scale: 1.05, boxShadow: `0 6px 15px ${color}50` }, 
      whileTap: { scale: 0.95 } 
    },
    pulse: { 
      whileHover: { 
        scale: [1, 1.05, 1], 
        boxShadow: [`0 4px 6px ${color}40`, `0 6px 15px ${color}50`, `0 4px 6px ${color}40`],
        transition: { 
          repeat: Infinity, 
          duration: 1.5,
          ease: "easeInOut"
        } 
      } 
    },
    bounce: { 
      whileHover: { 
        y: [0, -5, 0], 
        boxShadow: [`0 4px 6px ${color}40`, `0 8px 15px ${color}40`, `0 4px 6px ${color}40`],
        transition: { 
          repeat: Infinity, 
          duration: 1 
        } 
      } 
    },
    shake: { 
      whileHover: { 
        x: [0, 5, -5, 5, 0], 
        transition: { 
          repeat: Infinity, 
          duration: 1 
        } 
      } 
    }
  };
  
  const selectedAnimation = animations[animation] || animations.scale;
  
  // Calculer des couleurs pour le gradient
  const getComplementaryColor = (baseColor) => {
    // Si c'est une couleur hexadécimale
    if (baseColor.startsWith('#')) {
      // Extraire les composantes RGB
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      
      // Créer une variation légèrement différente
      const newR = Math.min(255, r + 40);
      const newG = Math.min(255, g + 20);
      const newB = Math.min(255, b + 30);
      
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    
    // Par défaut, si le format n'est pas reconnu
    return baseColor;
  };
  
  return (
    <motion.button
      className={`px-5 py-2.5 rounded-full text-white font-medium relative overflow-hidden ${className}`}
      style={{ 
        background: !disabled 
          ? `linear-gradient(135deg, ${color}, ${getComplementaryColor(color)})` 
          : '#9CA3AF',
        boxShadow: !disabled 
          ? `0 4px 10px ${color}40` 
          : '0 2px 5px rgba(0,0,0,0.1)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.8 : 1
      }}
      whileHover={!disabled ? selectedAnimation.whileHover : {}}
      whileTap={!disabled ? (selectedAnimation.whileTap || { scale: 0.95 }) : {}}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      {/* Effet de scintillement sur le bouton */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
          transform: "translateX(-100%)"
        }}
        animate={!disabled ? { 
          x: ["100%", "-100%"]
        } : {}}
        transition={{ 
          repeat: Infinity, 
          repeatDelay: 3,
          duration: 1.5, 
          ease: "easeInOut" 
        }}
      />
      
      <div className="flex items-center justify-center relative z-10">
        {icon && (
          <motion.span 
            className="mr-2 text-xl"
            animate={!disabled ? { 
              scale: [1, 1.2, 1], 
              rotate: animation === 'shake' ? [-5, 5, -5, 0] : 0 
            } : {}}
            transition={{ 
              repeat: Infinity, 
              repeatDelay: 2, 
              duration: 1 
            }}
          >
            {icon}
          </motion.span>
        )}
        {children}
      </div>
    </motion.button>
  );
};

export default AnimatedButton;