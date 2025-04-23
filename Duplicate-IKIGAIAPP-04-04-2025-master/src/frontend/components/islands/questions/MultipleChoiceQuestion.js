import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Réutilisation du dictionnaire d'émojis de CheckboxQuestion
// Si vous voulez que ce composant soit autonome, copiez ce tableau ici
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

const MultipleChoiceQuestion = ({ question, value, onChange, disabled }) => {
  const [hoverState, setHoverState] = useState(null);
  const [previousSelection, setPreviousSelection] = useState(null);
  
  // Obtenir l'emoji correspondant à l'ID de l'option
  const getEmoji = (optionId) => {
    return CATEGORY_EMOJIS[optionId] || '✨';
  };
  
  // Gérer la sélection avec animation de transition
  const handleSelect = (optionId) => {
    if (disabled) return;
    
    // Si on clique sur la même option, ne rien faire
    if (value === optionId) return;
    
    // Sauvegarder la sélection précédente pour l'animation
    setPreviousSelection(value);
    
    // Mettre à jour la valeur
    onChange(optionId);
  };
  
  return (
    <div className="grid grid-cols-1 gap-3">
      {question.options?.map((option) => {
        const isSelected = value === option.id;
        const wasSelected = previousSelection === option.id;
        
        return (
          <motion.div 
            key={option.id}
            initial={false}
            animate={{
              y: isSelected ? -5 : 0,
              boxShadow: isSelected 
                ? "0px 8px 15px rgba(0, 0, 0, 0.1)" 
                : "0px 4px 6px rgba(0, 0, 0, 0.05)"
            }}
            whileHover={{ 
              scale: 1.03, 
              y: -7, 
              boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)" 
            }}
            whileTap={{ 
              scale: 0.97,
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" 
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 15
            }}
            onHoverStart={() => setHoverState(option.id)}
            onHoverEnd={() => setHoverState(null)}
            onClick={() => handleSelect(option.id)}
            className={`p-4 border-2 rounded-2xl cursor-pointer transition-all relative overflow-hidden ${
              isSelected 
                ? 'border-green-500 bg-green-50'
                : wasSelected 
                  ? 'border-gray-300 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Fond décoratif avec gradient quand sélectionné */}
            {isSelected && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-50 to-transparent pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                exit={{ opacity: 0 }}
              />
            )}
            
            <div className="flex items-center">
              {/* Emoji décoratif selon la catégorie */}
              <motion.div
                className="mr-3 text-xl"
                initial={{ opacity: 0.7, scale: 1 }}
                animate={isSelected ? 
                  { opacity: 1, scale: 1.2, rotate: [0, 10, -10, 0] } : 
                  hoverState === option.id ? 
                    { opacity: 1, scale: 1.2, rotate: [0, 5, -5, 0] } : 
                    { opacity: 0.7, scale: 1 }
                }
                transition={{ 
                  duration: isSelected ? 0.5 : 0.3,
                  ease: "easeInOut"
                }}
              >
                {getEmoji(option.id)}
              </motion.div>
              
              {/* Cercle de sélection avec animation fluide */}
              <div className="relative mr-3">
                <div 
                  className={`w-6 h-6 flex items-center justify-center rounded-full border-2 ${
                    isSelected
                      ? 'border-green-500'
                      : 'border-gray-300'
                  }`}
                />
                
                {/* Cercle intérieur avec animation */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-green-500 rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 15 
                      }}
                    />
                  )}
                </AnimatePresence>
                
                {/* Checkmark avec animation */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 15,
                        delay: 0.1
                      }}
                    >
                      ✓
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Label de l'option */}
              <motion.span 
                className="font-medium"
                animate={{ 
                  fontWeight: isSelected ? 600 : 500,
                  scale: isSelected ? 1.02 : 1
                }}
                transition={{ duration: 0.2 }}
              >
                {option.label}
              </motion.span>
            </div>
            
            {/* Ripple effect quand sélectionné */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500 pointer-events-none"
                  initial={{ width: 0, height: 0, opacity: 0.5 }}
                  animate={{ width: 200, height: 200, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MultipleChoiceQuestion;