import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TextQuestion = ({ question, value = "", onChange, disabled }) => {
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(value ? value.length : 0);
  
  // Mise à jour du compteur de caractères en fonction de la valeur
  useEffect(() => {
    setCharCount(value ? value.length : 0);
  }, [value]);
  
  // Utiliser useEffect pour préserver le focus et la position du curseur
  useEffect(() => {
    if (textareaRef.current && document.activeElement === textareaRef.current) {
      const selectionStart = textareaRef.current.selectionStart;
      const selectionEnd = textareaRef.current.selectionEnd;
      
      // Petit délai pour s'assurer que le DOM est mis à jour
      setTimeout(() => {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(selectionStart, selectionEnd);
      }, 0);
    }
  }, [value]);
  
  // Déterminer le style de la bordure en fonction de l'état de focus
  const getBorderStyle = () => {
    if (disabled) return 'border-gray-200';
    if (isFocused) return 'border-green-500 ring-2 ring-green-100';
    if (value && value.length > 0) return 'border-green-300';
    return 'border-gray-300';
  };
  
  // Déterminer le niveau de remplissage pour le compteur de caractères
  const getCharCountStyle = () => {
    const maxLength = question.maxLength || 500;
    const percentage = Math.min((charCount / maxLength) * 100, 100);
    
    // Couleurs différentes selon le niveau de remplissage
    if (percentage > 90) return { color: '#ef4444', width: `${percentage}%` }; // Rouge
    if (percentage > 70) return { color: '#f97316', width: `${percentage}%` }; // Orange
    return { color: '#22c55e', width: `${percentage}%` }; // Vert
  };
  
  // Générer un emoji basé sur la longueur du texte
  const getEmoji = () => {
    if (!value) return '✏️';
    
    const length = value.length;
    const maxLength = question.maxLength || 500;
    const percentage = (length / maxLength) * 100;
    
    if (percentage > 90) return '🔥'; // Rouge
    if (percentage > 70) return '📝'; // Orange
    if (percentage > 40) return '✨'; // Bonne longueur
    if (percentage > 10) return '🌱'; // Démarrage
    return '✏️'; // Par défaut
  };
  
  return (
    <div className="mb-6">
      {/* Container avec animation de focus */}
      <motion.div
        className={`relative w-full rounded-2xl overflow-hidden transition-all ${
          disabled ? 'opacity-75' : 'opacity-100'
        }`}
        animate={{
          boxShadow: isFocused 
            ? "0px 8px 20px rgba(0, 0, 0, 0.1)" 
            : "0px 4px 10px rgba(0, 0, 0, 0.05)"
        }}
      >
        {/* Zone de texte avec animations et effets */}
        <textarea
          ref={textareaRef}
          className={`w-full min-h-[150px] border-2 ${getBorderStyle()} rounded-2xl p-4 focus:outline-none resize-none text-gray-700 transition-all duration-300`}
          style={{
            background: isFocused ? 'linear-gradient(to bottom, white, #f9fafb)' : 'white'
          }}
          rows={5}
          placeholder={question.placeholder || "Votre réponse..."}
          value={value || ''}
          onChange={(e) => {
            onChange(e.target.value);
            setCharCount(e.target.value.length);
          }}
          disabled={disabled}
          autoFocus={textareaRef.current === document.activeElement}
          onFocus={(e) => {
            setIsFocused(true);
            // Assurer que le focus est correctement appliqué
            setTimeout(() => {
              // Placer le curseur à la fin du texte
              e.target.selectionStart = e.target.value.length;
              e.target.selectionEnd = e.target.value.length;
            }, 0);
          }}
          onBlur={() => setIsFocused(false)}
        />
        
        {/* Indicateur visuel en bas-droit du textarea */}
        <motion.div
          className="absolute bottom-3 right-3 text-lg opacity-70"
          animate={{ 
            scale: isFocused ? 1.2 : 1,
            opacity: isFocused ? 0.9 : 0.6,
            rotate: isFocused ? [0, 10, -10, 0] : 0
          }}
          transition={{ duration: 0.5 }}
        >
          {getEmoji()}
        </motion.div>
      </motion.div>
      
      {/* Indicateur de longueur avec animation */}
      {question.maxLength && (
        <div className="mt-2 relative">
          {/* Barre de progression */}
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
            <motion.div 
              className="h-full rounded-full"
              style={{ 
                backgroundColor: getCharCountStyle().color,
                width: getCharCountStyle().width 
              }}
              initial={{ width: 0 }}
              animate={{ width: getCharCountStyle().width }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          {/* Compteur de caractères */}
          <div className="flex justify-between text-xs text-gray-500">
            <AnimatePresence mode="wait">
              <motion.span
                key={charCount > 0 ? 'typing' : 'empty'}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-gray-500"
              >
                {charCount > 0 ? (
                  <>
                    <span className="font-medium">Réponse:</span> {charCount} caractères
                  </>
                ) : 'Commencez à écrire...'}
              </motion.span>
            </AnimatePresence>
            
            <motion.span
              animate={{ 
                color: charCount > question.maxLength * 0.9 
                  ? '#ef4444' 
                  : '#6b7280',
                scale: charCount > question.maxLength * 0.9
                  ? [1, 1.1, 1]
                  : 1
              }}
              transition={{ duration: 0.3 }}
            >
              {charCount}/{question.maxLength}
            </motion.span>
          </div>
        </div>
      )}
      
      {/* Message d'aide contextuel avec animation */}
      <AnimatePresence>
        {value && value.length < 10 && !isFocused && (
          <motion.div
            className="text-xs text-blue-500 mt-2 bg-blue-50 p-2 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="font-medium">💡 Conseil:</span> Essayez d'être aussi détaillé que possible dans votre réponse.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TextQuestion;