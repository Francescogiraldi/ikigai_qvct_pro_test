import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * Curseur interactif avec indicateur visuel (emoji ou couleur)
 */
const InteractiveSlider = ({ 
  min = 0, 
  max = 100, 
  step = 1, 
  defaultValue = 50, 
  onChange,
  showEmojis = true,
  colorGradient = true,
  className = '',
  labels = []
}) => {
  const [value, setValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const sliderRef = useRef(null);
  
  // Définir les émojis pour différentes valeurs
  const getEmoji = (val) => {
    const normalizedValue = (val - min) / (max - min);
    if (normalizedValue < 0.2) return '😞';
    if (normalizedValue < 0.4) return '😕';
    if (normalizedValue < 0.6) return '😐';
    if (normalizedValue < 0.8) return '🙂';
    return '😄';
  };
  
  // Définir la couleur du curseur en fonction de la valeur
  const getTrackColor = () => {
    const normalizedValue = (value - min) / (max - min);
    if (colorGradient) {
      // Gradient de rouge à vert amélioré
      return `linear-gradient(90deg, 
        hsl(${Math.round(120 * normalizedValue)}, 80%, 50%), 
        hsl(${Math.round(120 * normalizedValue + 15)}, 85%, 55%)
      )`;
    }
    return '#4F46E5'; // Couleur par défaut (indigo)
  };
  
  // Calculer la position du curseur
  const getThumbPosition = () => {
    return ((value - min) / (max - min)) * 100;
  };
  
  // Mettre à jour la valeur en fonction de la position du curseur
  // Mémorisée avec useCallback pour éviter les rendus inutiles
  const updateValue = useCallback((clientX) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newValue = Math.min(max, Math.max(min, min + position * (max - min)));
    const steppedValue = Math.round(newValue / step) * step;
    
    setValue(steppedValue);
    if (onChange) onChange(steppedValue);
  }, [min, max, step, onChange]);
  
  // Gestionnaires d'événements pour le glisser-déposer
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setShowIndicator(true);
    updateValue(e.clientX);
  };
  
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setShowIndicator(true);
    updateValue(e.touches[0].clientX);
  };
  
  const handleMouseEnter = () => {
    setShowIndicator(true);
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setShowIndicator(false);
    }
  };
  
  // Ajouter et supprimer les écouteurs d'événements
  useEffect(() => {
    // Définir les gestionnaires d'événements à l'intérieur du useEffect
    const handleMouseMove = (e) => {
      if (isDragging) {
        updateValue(e.clientX);
      }
    };
    
    const handleTouchMove = (e) => {
      if (isDragging) {
        updateValue(e.touches[0].clientX);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      // Garder l'indicateur visible pendant un moment après relâchement
      setTimeout(() => setShowIndicator(false), 1500);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, updateValue]);

  // Générer des labels textuels si fournis
  const renderLabels = () => {
    if (labels && labels.length) {
      const normalizedValue = (value - min) / (max - min);
      const labelIndex = Math.min(labels.length - 1, Math.floor(normalizedValue * labels.length));
      return (
        <motion.div 
          className="text-sm font-medium text-center mt-3 text-gray-600"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          key={labelIndex}
        >
          {labels[labelIndex]}
        </motion.div>
      );
    }
    return null;
  };
  
  return (
    <div className={`${className}`}>
      <div 
        className="slider-container" 
        ref={sliderRef} 
        onMouseDown={handleMouseDown} 
        onTouchStart={handleTouchStart}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div 
          className="slider-track" 
          style={{ 
            width: `${getThumbPosition()}%`, 
            background: getTrackColor() 
          }}
          animate={{ width: `${getThumbPosition()}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        <motion.div 
          className="slider-thumb" 
          style={{ 
            left: `${getThumbPosition()}%`
          }}
          animate={{ 
            left: `${getThumbPosition()}%`,
            scale: isDragging ? 1.2 : 1
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {showEmojis && (
            <motion.div 
              className={`indicator-emoji ${(isDragging || showIndicator) ? 'visible' : ''}`}
              animate={{ 
                scale: [1, 1.1, 1],
                transition: { 
                  repeat: Infinity, 
                  repeatType: "mirror", 
                  duration: 1.5
                }
              }}
            >
              {getEmoji(value)}
            </motion.div>
          )}
        </motion.div>
      </div>
      <div className="slider-labels">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {renderLabels()}
    </div>
  );
};

export default InteractiveSlider;