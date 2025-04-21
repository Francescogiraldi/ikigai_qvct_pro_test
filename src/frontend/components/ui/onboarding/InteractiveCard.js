import React from 'react';
import { motion } from 'framer-motion';

/**
 * Carte interactive avec animation au survol et au clic - Version modernisée
 */
const InteractiveCard = ({ children, color = '#4F46E5', onClick, className = '', selected = false, icon, title, subtitle }) => {
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
  const rgbValues = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  
  // Générer des variations de couleur pour les effets visuels
  const lighterColor = `rgba(${rgbValues}, 0.1)`;
  const gradientColor = `rgba(${rgbValues}, 0.15)`;
  const boxShadowColor = `rgba(${rgbValues}, 0.2)`;
  
  // Variables CSS pour les dégradés
  const cssVariables = {
    '--card-color': color,
    '--card-color-light': lighterColor,
    '--card-color-gradient': gradientColor,
    '--r': rgb.r,
    '--g': rgb.g,
    '--b': rgb.b
  };

  const handleClick = (e) => {
    // Effet de ripple amélioré au clic
    if (!onClick) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.width = '1px';
    ripple.style.height = '1px';
    ripple.style.borderRadius = '50%';
    ripple.style.backgroundColor = `rgba(${rgbValues}, ${selected ? 0.4 : 0.2})`;
    ripple.style.transform = 'scale(0)';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.pointerEvents = 'none';
    
    e.currentTarget.appendChild(ripple);
    
    // Animation plus fluide pour l'effet ripple
    // Vérifier si la fonction animate existe (pour la compatibilité JSDOM)
    if (typeof ripple.animate === 'function') {
      const animation = ripple.animate(
        [
          { transform: 'scale(0)', opacity: 0.7 },
          { transform: 'scale(150)', opacity: 0 }
        ],
        {
          duration: 850,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
        }
      );
      
      animation.onfinish = () => ripple.remove();
    } else {
      // Fallback simple si animate n'est pas disponible
      setTimeout(() => ripple.remove(), 850);
    }
    
    onClick(e);
  };

  return (
    <motion.div
      className={`onboarding-card ${className} ${selected ? 'glass-effect' : ''}`}
      style={{
        ...cssVariables,
        backgroundColor: selected 
          ? lighterColor 
          : 'white',
        borderColor: selected ? color : 'rgba(229, 231, 235, 0.8)',
        borderWidth: '2px',
        borderStyle: 'solid',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: selected 
          ? `0 10px 20px ${boxShadowColor}, 0 3px 6px rgba(${rgbValues}, 0.1)` 
          : '0 4px 10px rgba(0, 0, 0, 0.05)',
        padding: '1.5rem'
      }}
      whileHover={{ 
        scale: 1.01, 
        y: -5,
        boxShadow: selected 
          ? `0 15px 25px rgba(${rgbValues}, 0.3), 0 5px 10px rgba(${rgbValues}, 0.2)` 
          : '0 15px 25px rgba(0, 0, 0, 0.06)'
      }}
      whileTap={{ 
        scale: 0.98, 
        boxShadow: `0 2px 5px rgba(${rgbValues}, 0.1)`
      }}
      onClick={handleClick}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 17
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
      }}
    >
      {/* Effet de surbrillance pour les cartes sélectionnées */}
      {selected && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ 
            opacity: [0.05, 0.15, 0.05],
            background: `radial-gradient(circle at center, rgba(${rgbValues}, 0.2) 0%, transparent 70%)`
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
      )}
      
      {/* Éléments décoratifs */}
      <div className="decoration-circle decoration-circle-1" 
        style={{ background: `linear-gradient(135deg, rgba(${rgbValues}, 0.1), rgba(${rgbValues}, 0.05))` }} />
      <div className="decoration-circle decoration-circle-2" 
        style={{ background: `linear-gradient(135deg, rgba(${rgbValues}, 0.1), rgba(${rgbValues}, 0.03))` }} />
        
      {/* En-tête de la carte avec titre et icône */}
      {(title || icon) && (
        <div className="mb-4">
          {icon && (
            <div className="mb-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-2xl" 
                style={{ 
                  backgroundColor: `rgba(${rgbValues}, 0.1)`,
                  color: color,
                  boxShadow: `0 3px 8px rgba(${rgbValues}, 0.15)`
                }}>
                {icon}
              </span>
            </div>
          )}
          
          {title && (
            <motion.h3 
              className="text-xl font-bold mb-1"
              style={{ color }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {title}
            </motion.h3>
          )}
          
          {subtitle && (
            <motion.p 
              className="text-gray-600"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      )}
      
      {/* Contenu principal */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default InteractiveCard;