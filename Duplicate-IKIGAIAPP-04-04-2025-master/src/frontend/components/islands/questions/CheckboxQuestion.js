import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mapping des emojis par catégorie d'option
// Ajout d'emojis contextuels pour différentes catégories d'options
const CATEGORY_EMOJIS = {
  // Catégories des activités/passions
  lecture: '📚',
  musique: '🎵',
  sport: '🏃‍♂️',
  voyages: '✈️',
  art_culture: '🎨',
  cuisine: '🍳',
  autre: '✨',
  
  // Catégories de talents
  communication: '🗣️',
  resolution: '🧩',
  creativite: '💡',
  leadership: '🚀',
  empathie: '❤️',
  organisation: '📋',
  ecriture: '✍️',
  dessin: '🖌️',
  parole: '🎤',
  
  // Catégories de missions/besoins
  environnement: '🌱',
  justice: '⚖️',
  sante: '🧠',
  education: '🎓',
  inegalites: '🤝',
  durabilite: '♻️',
  droits: '✊',
  innovation: '💫',
  
  // Catégories professionnelles
  conseil: '💼',
  coaching: '🏆',
  cours: '👨‍🏫',
  design: '🎭',
  contenu: '📱',
  freelance: '🚶',
  startup: '📈',
  creatif: '🎪',
};

const CheckboxQuestion = ({ question, value = [], onChange, disabled, maxSelect }) => {
  const [customValues, setCustomValues] = useState({});
  const [hoverState, setHoverState] = useState(null);
  const customInputRef = useRef(null);
  
  const handleToggle = (optionId) => {
    if (disabled) return;
    
    const currentValues = [...value];
    const index = currentValues.indexOf(optionId);
    
    if (index === -1) {
      // Add if not present and check maxSelect limit
      if (maxSelect && currentValues.length >= maxSelect) {
        currentValues.shift(); // Remove first element to maintain max limit
      }
      currentValues.push(optionId);
    } else {
      // Remove if present
      currentValues.splice(index, 1);
    }
    
    onChange(currentValues);
  };
  
  const handleCustomValueChange = (optionId, customValue) => {
    const newCustomValues = {...customValues, [optionId]: customValue};
    setCustomValues(newCustomValues);
    // Si vous avez besoin de stocker ces valeurs ailleurs, ajoutez la logique ici
  };
  
  // Obtenir l'emoji correspondant à l'ID de l'option
  const getEmoji = (optionId) => {
    return CATEGORY_EMOJIS[optionId] || '✨';
  };
  
  // Variantes d'animation pour les cartes
  const cardVariants = {
    selected: {
      y: -5,
      boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    unselected: {
      y: 0,
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.05)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17
      }
    },
    hover: {
      scale: 1.03,
      y: -7,
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    },
    tap: {
      scale: 0.97,
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };
  
  // Variantes d'animation pour l'emoji
  const emojiVariants = {
    initial: { opacity: 0, y: 10, scale: 0.8 },
    selected: {
      opacity: 1,
      y: 0,
      scale: 1.2,
      rotate: [0, 10, -10, 0],
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 10
      }
    },
    unselected: {
      opacity: 0.7,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 20
      }
    },
    hover: {
      scale: 1.3,
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };
  
  // Variantes d'animation pour la coche
  const checkmarkVariants = {
    unchecked: { scale: 0, opacity: 0 },
    checked: { 
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 10,
        delay: 0.1
      }
    }
  };
  
  return (
    <div className="grid grid-cols-1 gap-3">
      {question.options?.map((option) => {
        const isSelected = value.includes(option.id);
        return (
          <motion.div 
            key={option.id}
            initial="unselected"
            animate={isSelected ? "selected" : "unselected"}
            whileHover="hover"
            whileTap="tap"
            variants={cardVariants}
            onHoverStart={() => setHoverState(option.id)}
            onHoverEnd={() => setHoverState(null)}
            onClick={() => handleToggle(option.id)}
            className={`p-4 border-2 rounded-2xl cursor-pointer relative overflow-hidden ${
              isSelected 
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Fond décoratif avec opacity faible quand sélectionné */}
            {isSelected && (
              <motion.div 
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-50 to-transparent opacity-40 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                exit={{ opacity: 0 }}
              />
            )}
            
            <div className="flex items-center">
              {/* Emoji décoratif à gauche pour ajouter du contexte visuel */}
              <motion.div
                className="mr-3 text-xl"
                variants={emojiVariants}
                initial="initial"
                animate={isSelected ? "selected" : (hoverState === option.id ? "hover" : "unselected")}
              >
                {getEmoji(option.id)}
              </motion.div>
              
              {/* Case à cocher avec animation */}
              <motion.div 
                className={`w-6 h-6 flex items-center justify-center rounded-md border-2 mr-3 ${
                  isSelected
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300'
                }`}
                animate={{
                  scale: isSelected ? [1, 1.2, 1] : 1,
                  transition: { duration: 0.3 }
                }}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      variants={checkmarkVariants}
                      initial="unchecked"
                      animate="checked"
                      exit="unchecked"
                    >
                      ✓
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              
              <span className="font-medium">{option.label}</span>
            </div>
            
            {/* Champ personnalisé pour l'option "Autre" */}
            <AnimatePresence>
              {option.id === 'autre' && value && value.includes(option.id) && (
                <motion.div 
                  className="mt-3 w-full relative"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ 
                    opacity: 1, 
                    height: 'auto',
                    transition: { delay: 0.1 } 
                  }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input 
                    ref={option.id === 'autre' ? customInputRef : null}
                    type="text" 
                    className="w-full border-2 border-green-400 rounded-lg p-2 focus:outline-none focus:border-green-500 text-sm sm:text-base shadow-sm transition-all"
                    placeholder="Précisez..."
                    onClick={(e) => e.stopPropagation()} // Empêcher le toggle du checkbox lors du clic sur l'input
                    onChange={(e) => handleCustomValueChange(option.id, e.target.value)}
                    onFocus={(e) => {
                      e.stopPropagation(); // Empêcher la propagation du focus
                      // Placer le curseur à la fin du texte
                      setTimeout(() => {
                        const length = e.target.value.length;
                        e.target.setSelectionRange(length, length);
                      }, 0);
                    }}
                    value={customValues[option.id] || ''}
                    autoFocus={false}
                  />
                  
                  {/* Indicateur de frappe avec petite animation */}
                  {customValues[option.id] && (
                    <motion.div 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
      
      {/* Indicateur du nombre maximal de sélections avec compteur visuel */}
      {maxSelect && (
        <div className="text-xs text-gray-600 mt-1 flex items-center">
          <span className="mr-2">
            Sélection: {value.length}/{maxSelect}
          </span>
          {/* Barre de progression */}
          <div className="flex-grow h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(value.length / maxSelect) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckboxQuestion;