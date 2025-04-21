import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Composant pour les questions avec réponses prédéfinies sous forme de cartes
 */
const CardSelectionQuestion = ({
  options,
  selectedValues,
  onChange,
  color = '#4F46E5',
  multiSelect = true,
  showOtherOption = false
}) => {
  const [otherValue, setOtherValue] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

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

  const handleCardClick = (optionId) => {
    if (optionId === 'other') {
      // Permettre la désélection de l'option "Autre"
      if (selectedValues.includes('other')) {
        setShowOtherInput(false);
        setOtherValue('');
        onChange(selectedValues.filter(id => id !== 'other'));
        return;
      }
      
      setShowOtherInput(true);
      if (multiSelect) {
        if (!selectedValues.includes('other')) {
          onChange([...selectedValues, 'other']);
        }
      } else {
        onChange(['other']);
      }
      return;
    }

    if (multiSelect) {
      // Pour la sélection multiple
      if (selectedValues.includes(optionId)) {
        onChange(selectedValues.filter(id => id !== optionId));
      } else {
        onChange([...selectedValues, optionId]);
      }
    } else {
      // Pour la sélection unique
      onChange([optionId]);
    }
  };

  const handleOtherInputChange = (e) => {
    setOtherValue(e.target.value);
    // Mettre à jour la valeur dans le parent
    if (multiSelect) {
      const newValues = selectedValues.filter(v => v !== 'other');
      if (e.target.value.trim() !== '') {
        onChange([...newValues, 'other']);
      } else {
        onChange(newValues);
      }
    } else if (e.target.value.trim() !== '') {
      onChange(['other']);
    } else {
      onChange([]);
    }
  };

  // Ajouter l'option "Autre" si nécessaire
  const allOptions = showOtherOption 
    ? [...options, { id: 'other', label: 'Autre', icon: '✏️' }]
    : options;

  return (
    <div className="card-selection-container grid grid-cols-2 gap-3 md:grid-cols-3">
      {allOptions.map((option, idx) => (
        <motion.div
          key={option.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: idx * 0.1,
            type: "spring",
            stiffness: 100
          }}
          onClick={() => handleCardClick(option.id)}
          className={`card-option p-3 rounded-xl cursor-pointer flex flex-col items-center justify-center text-center ${selectedValues.includes(option.id) ? 'selected' : ''}`}
          style={{
            backgroundColor: selectedValues.includes(option.id) 
              ? `rgba(${rgbValues}, 0.1)` 
              : 'white',
            borderColor: selectedValues.includes(option.id) 
              ? color 
              : '#e5e7eb',
            borderWidth: '2px',
            borderStyle: 'solid',
            boxShadow: selectedValues.includes(option.id) 
              ? `0 4px 12px rgba(${rgbValues}, 0.2)` 
              : '0 2px 5px rgba(0, 0, 0, 0.05)',
            minHeight: '100px'
          }}
          whileHover={{ 
            y: -5, 
            boxShadow: `0 8px 15px rgba(${rgbValues}, 0.15)` 
          }}
          whileTap={{ scale: 0.98 }}
        >
          {option.icon && (
            <span className="text-2xl mb-2">{option.icon}</span>
          )}
          <span className="font-medium">{option.label}</span>
        </motion.div>
      ))}

      {/* Champ de saisie pour l'option "Autre" */}
      <AnimatePresence>
        {showOtherInput && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="col-span-2 md:col-span-3 mt-3"
          >
            <input
              type="text"
              value={otherValue}
              onChange={handleOtherInputChange}
              placeholder="Précisez votre réponse..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
              style={{
                borderColor: color,
                boxShadow: `0 2px 5px rgba(${rgbValues}, 0.1)`,
                outline: 'none'
              }}
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Composant pour les questions avec champ de texte et suggestions
 */
const TextWithSuggestions = ({
  value,
  onChange,
  placeholder,
  suggestions = [],
  color = '#4F46E5',
  maxLength = 100,
  multiline = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);

  // Convertir la couleur en RGB
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const formattedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);
    return result ? 
      { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } 
      : { r: 79, g: 70, b: 229 };
  };
  
  const rgb = hexToRgb(color);
  const rgbValues = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Filtrer les suggestions
    if (newValue.trim() !== '') {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(newValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions(suggestions);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    if (suggestions.length > 0 && value.trim() === '') {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="text-with-suggestions-container" style={{ 
      position: 'relative', 
      minHeight: showSuggestions && filteredSuggestions.length > 0 ? '400px' : 'auto',
      marginBottom: '50px'
    }}>
      {/* Conteneur d'entrée avec z-index élevé */}
      <div className="input-container" style={{ position: 'relative', zIndex: 1 }}>
        {multiline ? (
          <motion.textarea
            className="modern-textarea w-full p-3 rounded-lg border-2"
            style={{ 
              borderColor: color,
              boxShadow: `0 2px 10px rgba(${rgbValues}, 0.1)`
            }}
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            maxLength={maxLength}
            rows={3}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.2,
              type: "spring",
              stiffness: 100
            }}
            whileFocus={{
              boxShadow: `0 4px 15px rgba(${rgbValues}, 0.2)`,
              borderColor: color,
              borderWidth: '2px',
              y: -3
            }}
          />
        ) : (
          <motion.input
            type="text"
            className="modern-input w-full p-3 rounded-lg border-2"
            style={{ 
              borderColor: color,
              boxShadow: `0 2px 10px rgba(${rgbValues}, 0.1)`
            }}
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            maxLength={maxLength}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.2,
              type: "spring",
              stiffness: 100
            }}
            whileFocus={{
              boxShadow: `0 4px 15px rgba(${rgbValues}, 0.2)`,
              borderColor: color,
              borderWidth: '2px',
              y: -3
            }}
          />
        )}
      </div>

      {/* Conteneur de suggestions avec espace suffisant et positionnement amélioré */}
      <div className="suggestions-container" style={{ 
        position: 'absolute', 
        width: '100%',
        top: multiline ? '120px' : '60px',
        left: 0,
        zIndex: 1000
      }}>
        <AnimatePresence>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <motion.div 
              className="suggestions-list w-full bg-white rounded-lg shadow-lg border border-gray-200"
              style={{ 
                width: '100%',
                maxHeight: '300px',
                overflowY: 'auto',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
            {filteredSuggestions.map((suggestion, idx) => (
              <motion.div
                key={idx}
                className="suggestion-item p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
                whileHover={{ backgroundColor: `rgba(${rgbValues}, 0.1)` }}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {suggestion}
              </motion.div>
            ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * Composant pour les questions avec tags sélectionnables
 */
const TagSelection = ({
  options,
  selectedValues,
  onChange,
  color = '#4F46E5',
  showImportanceSlider = false
}) => {
  const [importanceValues, setImportanceValues] = useState({});

  // Convertir la couleur en RGB
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const formattedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);
    return result ? 
      { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } 
      : { r: 79, g: 70, b: 229 };
  };
  
  const rgb = hexToRgb(color);
  const rgbValues = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

  const handleTagClick = (optionId) => {
    if (selectedValues.includes(optionId)) {
      // Désélectionner le tag
      const newSelected = selectedValues.filter(id => id !== optionId);
      onChange(newSelected);
      
      // Supprimer l'importance si elle existe
      if (importanceValues[optionId]) {
        const newImportance = {...importanceValues};
        delete newImportance[optionId];
        setImportanceValues(newImportance);
      }
    } else {
      // Sélectionner le tag
      const newSelected = [...selectedValues, optionId];
      onChange(newSelected);
      
      // Initialiser l'importance à 3 (milieu pour une échelle de 1 à 5)
      if (showImportanceSlider) {
        setImportanceValues(prev => ({
          ...prev,
          [optionId]: 3
        }));
      }
    }
  };

  const handleImportanceChange = (optionId, value) => {
    setImportanceValues(prev => ({
      ...prev,
      [optionId]: value
    }));
  };

  return (
    <div className="tag-selection-container">
      <div className="tags-list flex flex-wrap gap-2 max-h-60 overflow-y-auto pb-2 pr-1">
        {options.map((option, idx) => (
          <motion.div
            key={option.id}
            className={`tag-item px-3 py-2 rounded-full cursor-pointer ${selectedValues.includes(option.id) ? 'selected' : ''}`}
            style={{
              backgroundColor: selectedValues.includes(option.id) 
                ? `rgba(${rgbValues}, 0.1)` 
                : 'white',
              borderColor: selectedValues.includes(option.id) 
                ? color 
                : '#e5e7eb',
              borderWidth: '2px',
              borderStyle: 'solid',
              color: selectedValues.includes(option.id) ? color : '#374151'
            }}
            onClick={() => handleTagClick(option.id)}
            whileHover={{ 
              y: -2, 
              boxShadow: `0 4px 8px rgba(${rgbValues}, 0.15)` 
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            {option.icon && (
              <span className="mr-1">{option.icon}</span>
            )}
            {option.label}
          </motion.div>
        ))}
      </div>

      {/* Système de notation moderne pour les niveaux d'importance */}
      {showImportanceSlider && selectedValues.length > 0 && (
        <motion.div 
          className="importance-ratings mt-4 space-y-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="font-medium text-gray-700 mb-3">Niveau d'importance :</h4>
          {selectedValues.map(optionId => {
            const option = options.find(o => o.id === optionId);
            if (!option) return null;
            
            return (
              <div key={optionId} className="rating-container mb-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">{option.label}</span>
                  <motion.span 
                    className="text-sm font-bold px-2 py-1 rounded-md"
                    style={{ 
                      backgroundColor: `${color}15`,
                      color: color
                    }}
                    animate={{ 
                      scale: [1, 1.05, 1],
                      backgroundColor: `${color}${(importanceValues[optionId] || 3) * 5 + 10}`
                    }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "mirror" }}
                  >
                    {importanceValues[optionId] || 3}/5
                  </motion.span>
                </div>
                
                {/* Système d'étoiles amélioré pour la notation */}
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-center space-x-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <motion.button
                        key={star}
                        type="button"
                        className="focus:outline-none relative"
                        onClick={() => handleImportanceChange(optionId, star)}
                        whileHover={{ scale: 1.2, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                          rotate: star === (importanceValues[optionId] || 3) ? [0, 5, -5, 0] : 0,
                          scale: star <= (importanceValues[optionId] || 3) ? [1, 1.1, 1] : 1
                        }}
                        transition={{ 
                          duration: 0.5, 
                          repeat: star === (importanceValues[optionId] || 3) ? Infinity : 0,
                          repeatType: "mirror",
                          repeatDelay: 1
                        }}
                      >
                        <span className="text-2xl" style={{ 
                          color: star <= (importanceValues[optionId] || 3) ? color : '#e5e7eb',
                          filter: star <= (importanceValues[optionId] || 3) ? `drop-shadow(0 0 2px ${color}40)` : 'none'
                        }}>
                          {star <= (importanceValues[optionId] || 3) ? '★' : '☆'}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  
                  <motion.div 
                    className="text-sm text-center font-medium rounded-full py-1 mt-1"
                    style={{ 
                      backgroundColor: `${color}10`,
                      color: color
                    }}
                    animate={{ backgroundColor: `${color}${(importanceValues[optionId] || 3) * 3 + 10}` }}
                  >
                    {(importanceValues[optionId] || 3) === 1 && "Peu important"}
                    {(importanceValues[optionId] || 3) === 2 && "Assez important"}
                    {(importanceValues[optionId] || 3) === 3 && "Important"}
                    {(importanceValues[optionId] || 3) === 4 && "Très important"}
                    {(importanceValues[optionId] || 3) === 5 && "Essentiel"}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export { CardSelectionQuestion, TextWithSuggestions, TagSelection };