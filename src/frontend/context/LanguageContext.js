import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTranslations } from '../../config/translations';

// Créer le contexte
const LanguageContext = createContext();

// Hook personnalisé pour utiliser le contexte de langue
export const useLanguage = () => {
  return useContext(LanguageContext);
};

// Fournisseur du contexte de langue
export const LanguageProvider = ({ children }) => {
  // État pour stocker la langue actuelle et les traductions
  const [language, setLanguage] = useState('fr');
  const [translations, setTranslations] = useState(getTranslations('fr'));

  // Fonction pour changer de langue
  const changeLanguage = useCallback((newLang) => {
    if (newLang === language) return;
    
    setLanguage(newLang);
    setTranslations(getTranslations(newLang));
    
    // Stocker la préférence de langue dans localStorage pour persistance
    localStorage.setItem('ikigai_language', newLang);
    
    // Logique pour appliquer la langue à l'ensemble de l'application
    document.documentElement.setAttribute('lang', newLang);
  }, [language]); // Ajouter language comme dépendance de useCallback

  // Fonction utilitaire pour obtenir une traduction
  const t = (key) => {
    // Diviser la clé par les points (ex: "profile.title" -> ["profile", "title"])
    const parts = key.split('.');
    
    // Navigation dans l'objet de traductions pour trouver la valeur
    let value = translations;
    for (const part of parts) {
      if (!value || !value[part]) return key; // Retourner la clé si la traduction n'existe pas
      value = value[part];
    }
    
    return value;
  };

  // Charger la langue préférée de l'utilisateur au démarrage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('ikigai_language');
    
    if (savedLanguage) {
      changeLanguage(savedLanguage);
    } else {
      // Si pas de préférence enregistrée, utiliser la langue du navigateur si disponible
      const browserLang = navigator.language.split('-')[0]; // 'fr-FR' -> 'fr'
      
      if (browserLang === 'en' || browserLang === 'fr') {
        changeLanguage(browserLang);
      }
      // Sinon, on garde 'fr' par défaut
    }
  }, [changeLanguage]); // changeLanguage est maintenant stable grâce à useCallback

  // Valeur à fournir au contexte
  const value = {
    language,
    translations,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;