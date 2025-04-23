/**
 * Configuration centralisée de l'application
 * Ce fichier exporte toutes les configurations nécessaires au fonctionnement de l'application
 * Utilise les variables d'environnement pour une configuration plus flexible
 */

// Configuration de l'application
export const APP_CONFIG = {
  name: process.env.REACT_APP_PWA_NAME || 'IKIGAI',
  shortName: process.env.REACT_APP_PWA_SHORT_NAME || 'IKIGAI',
  version: '1.0.0',
  description: process.env.REACT_APP_PWA_DESCRIPTION || 'Application de bien-être et développement personnel basée sur le concept d\'Ikigai',
  apiVersion: 'v1',
  defaultTimezone: 'Europe/Paris',
  localStoragePrefix: 'ikigai_'
};

// Configuration du service d'IA
export const AI_CONFIG = {
  enabled: process.env.REACT_APP_AI_RECOMMENDATION_ENABLED === 'true',
  version: 'enhanced-v1',
  categories: [
    'mindfulness',
    'productivity',
    'stress',
    'balance',
    'wellbeing',
    'social',
    'growth',
    'general'
  ],
  defaultRecommendationsCount: 3,
  refreshInterval: 24 * 60 * 60 * 1000, // 24 heures
  
  // Configuration du chatbot
  chatbot: {
    enabled: process.env.REACT_APP_FEATURE_CHATBOT === 'true',
    apiEndpoint: process.env.REACT_APP_GRADIO_API_URL || "Francescogiraldi/QVCT",
    systemPrompt: "Vous êtes un assistant pour une application de bien-être basée sur le concept d'IKIGAI. Aidez l'utilisateur avec des conseils sur le bien-être, la méditation, la gestion du stress et la recherche de l'équilibre. Restez positif et encourageant."
  }
};

// Configuration du stockage
export const STORAGE_CONFIG = {
  type: process.env.REACT_APP_STORAGE_TYPE || 'supabase', // 'supabase' ou 'local'
  cacheDuration: parseInt(process.env.REACT_APP_CACHE_DURATION || '3600000', 10),
  endpoint: process.env.REACT_APP_SUPABASE_URL
};

// Configuration de l'authentification
export const AUTH_CONFIG = {
  providers: (process.env.REACT_APP_AUTH_PROVIDERS || 'email').split(','),
  redirectUrl: process.env.REACT_APP_AUTH_REDIRECT_URL || window.location.origin,
  autoSignIn: false
};

// Configuration des fonctionnalités
export const FEATURES_CONFIG = {
  chatbot: process.env.REACT_APP_FEATURE_CHATBOT === 'true',
  recommendations: process.env.REACT_APP_FEATURE_RECOMMENDATIONS === 'true',
  moodTracking: process.env.REACT_APP_FEATURE_MOOD_TRACKING === 'true'
};

// Configuration offline
export const OFFLINE_CONFIG = {
  syncInterval: 5 * 60 * 1000, // 5 minutes
  maxRetries: 3,
  retryDelay: 30 * 1000 // 30 secondes
};