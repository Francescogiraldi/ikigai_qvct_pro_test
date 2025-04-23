// Fichier principal de l'API qui centralise les endpoints

import AuthService from '../services/AuthService';
import StorageService from '../services/StorageService';
import ContentService from '../services/ContentService';
import AIRecommendationService from '../services/AIRecommendationService';

// API d'authentification
export const authAPI = {
  // Récupérer l'utilisateur courant
  getCurrentUser: async () => {
    return await AuthService.getCurrentUser();
  },
  
  // S'inscrire
  signUp: async (email, password) => {
    return await AuthService.signUp(email, password);
  },
  
  // Se connecter
  signIn: async (email, password) => {
    return await AuthService.signIn(email, password);
  },
  
  // Se connecter avec Google
  signInWithGoogle: async () => {
    return await AuthService.signInWithGoogle();
  },
  
  // Se déconnecter
  signOut: async () => {
    return await AuthService.signOut();
  },
  
  // Vérifier l'authentification
  isAuthenticated: async () => {
    return await AuthService.isAuthenticated();
  },
  
  // Réinitialiser le mot de passe
  resetPassword: async (email) => {
    return await AuthService.resetPassword(email);
  }
};

// API de progression utilisateur
export const progressAPI = {
  // Récupérer la progression
  getProgress: async () => {
    return await StorageService.getProgress();
  },
  
  // Sauvegarder la progression
  saveProgress: async (progressData) => {
    return await StorageService.saveProgress(progressData);
  },
  
  // Compléter un module
  completeModule: async (moduleId, islandId) => {
    return await StorageService.completeModule(moduleId, islandId);
  },
  
  // Compléter un défi
  completeChallenge: async (challengeId) => {
    return await StorageService.completeChallenge(challengeId);
  },
  
  // Sauvegarder les réponses d'un module
  saveModuleResponses: async (moduleId, responses) => {
    return await StorageService.saveModuleResponses(moduleId, responses);
  },
  
  // Réinitialiser les données
  resetAllData: () => {
    return StorageService.resetAllData();
  },
  getUserSettings: async () => {
    return await StorageService.getUserSettings();
  },
  
  // Sauvegarder les paramètres utilisateur
  saveUserSettings: async (settings) => {
    return await StorageService.saveUserSettings(settings);
  },
};

// API de contenu
export const contentAPI = {
  // Récupérer toutes les îles
  getAllIslands: () => {
    return ContentService.getAllIslands();
  },
  
  // Récupérer une île par son ID
  getIslandById: (islandId) => {
    return ContentService.getIslandById(islandId);
  },
  
  // Récupérer tous les modules
  getAllModules: () => {
    return ContentService.getAllModules();
  },
  
  // Récupérer les modules d'une île
  getModulesByIslandId: (islandId) => {
    return ContentService.getModulesByIslandId(islandId);
  },
  
  // Récupérer un module par son ID
  getModuleById: (moduleId) => {
    return ContentService.getModuleById(moduleId);
  },
  
  // Récupérer tous les défis
  getAllChallenges: () => {
    return ContentService.getAllChallenges();
  },
  
  // Récupérer tous les exercices
  getAllExercises: () => {
    return ContentService.getAllExercises();
  },
  
  // Récupérer le contenu recommandé
  getRecommendedContent: (userProgress) => {
    return ContentService.getRecommendedContent(userProgress);
  }
};

// API d'analyse et de recommandation IA
export const aiAPI = {
  // Analyser les réponses d'un utilisateur et générer des recommandations
  analyzeUserResponses: async (userId = null) => {
    return await AIRecommendationService.analyzeUserResponses(userId);
  },
  
  // Récupérer les recommandations d'un utilisateur
  getUserRecommendations: async (userId = null) => {
    return await AIRecommendationService.getUserRecommendations(userId);
  },
  
  // Enregistrer un feedback sur les recommandations
  sendRecommendationFeedback: async (userId = null, isHelpful, details = {}) => {
    // À implémenter - Enregistre le feedback dans Supabase pour améliorer les futures recommandations
    // Actuellement simulé comme opération réussie
    return { success: true };
  },
  
  // Enregistrer une interaction avec une recommandation (cliqué, vu, etc.)
  logRecommendationInteraction: async (recommendationId, action, userId = null) => {
    // À implémenter - Enregistre l'interaction dans Supabase pour des analyses futures
    // Actuellement simulé comme opération réussie
    return { success: true };
  },
  
  // Récupérer l'historique des recommandations
  getRecommendationsHistory: async (userId = null, limit = 5) => {
    // À implémenter - Récupère l'historique des recommandations passées
    // Actuellement simulé comme opération réussie avec liste vide
    return { success: true, history: [] };
  }
};

// API centralisée
const API = {
  auth: authAPI,
  progress: progressAPI,
  content: contentAPI,
  ai: aiAPI
};

export default API;