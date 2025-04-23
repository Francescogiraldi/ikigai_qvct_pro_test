import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Sélecteur d'options sous forme de bulles interactives
 */
const BubbleSelector = ({ 
  options = [], 
  onSelect, 
  multiSelect = false, 
  initialSelected = [], 
  color = '#4F46E5',
  className = '',
  optionClassName = '',
  animationStyle = 'bounce'
}) => {
  const [selected, setSelected] = useState(Array.isArray(initialSelected) ? initialSelected : [initialSelected].filter(Boolean));
  
  // Animations disponibles
  const animations = {
    bounce: (isSelected) => ({ 
      y: isSelected ? [0, -5, 0] : 0,
      transition: { 
        y: { 
          repeat: isSelected ? Infinity : 0, 
          repeatType: "mirror", 
          duration: 1.5,
          repeatDelay: 1
        }
      }
    }),
    pulse: (isSelected) => ({ 
      scale: isSelected ? [1, 1.05, 1] : 1,
      transition: { 
        scale: { 
          repeat: isSelected ? Infinity : 0, 
          repeatType: "mirror", 
          duration: 1.5
        }
      }
    }),
    glow: (isSelected) => ({ 
      boxShadow: isSelected 
        ? [
            `0 0 5px ${color}50`, 
            `0 0 10px ${color}70`,
            `0 0 5px ${color}50`
          ] 
        : `0 2px 5px rgba(0,0,0,0.05)`,
      transition: { 
        boxShadow: { 
          repeat: isSelected ? Infinity : 0, 
          repeatType: "mirror", 
          duration: 2
        }
      }
    })
  };
  
  const selectedAnimation = animations[animationStyle] || animations.pulse;
  
  const handleSelect = (optionId) => {
    let newSelected;
    if (multiSelect) {
      // Pour la sélection multiple, ajouter/retirer de la liste
      if (selected.includes(optionId)) {
        newSelected = selected.filter(id => id !== optionId);
      } else {
        newSelected = [...selected, optionId];
      }
    } else {
      // Pour la sélection unique, remplacer la sélection
      newSelected = [optionId];
    }
    
    setSelected(newSelected);
    if (onSelect) {
      onSelect(multiSelect ? newSelected : optionId);
    }
  };
  
  // Fonction pour obtenir la luminosité de la couleur (pour déterminer la couleur du texte)
  const getLuminance = (hexColor) => {
    // Convertir hex en RGB
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;
    
    // Calculer la luminance perçue
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const getTextColor = (bgColor) => {
    return getLuminance(bgColor) > 0.5 ? '#000000' : '#FFFFFF';
  };
  
  // Générer un motif de couleurs légèrement différentes pour les options
  const getOptionColor = (index, isSelected) => {
    if (!isSelected) return 'white';
    
    // Extraire les composantes RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Légère variation basée sur l'index
    const variation = Math.sin(index * 0.5) * 15;
    const newR = Math.min(255, Math.max(0, r + variation));
    const newG = Math.min(255, Math.max(0, g + variation / 2));
    const newB = Math.min(255, Math.max(0, b - variation / 2));
    
    return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
  };
  
  return (
    <motion.div 
      className={`flex flex-wrap gap-2 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.08 }}
    >
      {options.map((option, index) => {
        const isSelected = selected.includes(option.id);
        const optionColor = getOptionColor(index, isSelected);
        const textColor = isSelected ? getTextColor(optionColor) : '#4B5563';
        
        return (
          <motion.div
            key={option.id}
            className={`rounded-full px-4 py-2 text-sm font-medium cursor-pointer select-none ${optionClassName}`}
            style={{ 
              backgroundColor: isSelected ? optionColor : 'white',
              color: textColor,
              border: `2px solid ${isSelected ? optionColor : '#E5E7EB'}`,
              boxShadow: isSelected ? `0 3px 10px ${color}30` : '0 1px 3px rgba(0,0,0,0.05)'
            }}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: isSelected 
                ? `0 5px 15px ${color}40` 
                : '0 3px 10px rgba(0,0,0,0.08)',
              y: -2
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(option.id)}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              ...selectedAnimation(isSelected)
            }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 17,
              delay: index * 0.05
            }}
          >
            {option.icon && (
              <span className="mr-2">{option.icon}</span>
            )}
            {option.label}
            
            {multiSelect && isSelected && (
              <motion.span 
                className="ml-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                ✓
              </motion.span>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default BubbleSelector;