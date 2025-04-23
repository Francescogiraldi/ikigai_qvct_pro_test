/**
 * Contextes React pour la gestion de l'état global de l'application
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../../backend/api';

// Contexte pour l'authentification
const AuthContext = createContext();

// Contexte pour la progression de l'utilisateur
const ProgressContext = createContext();

// Contexte pour le contenu de l'application
const ContentContext = createContext();

/**
 * Provider pour l'authentification
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Vérifier l'authentification au chargement
    const checkAuth = async () => {
      try {
        const currentUser = await API.auth.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Fonctions d'authentification
  const signIn = async (email, password) => {
    const result = await API.auth.signIn(email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };
  
  const signUp = async (email, password) => {
    const result = await API.auth.signUp(email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };
  
  const signInWithGoogle = async () => {
    return await API.auth.signInWithGoogle();
  };
  
  const signOut = async () => {
    const result = await API.auth.signOut();
    if (result.success) {
      setUser(null);
    }
    return result;
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Provider pour la progression de l'utilisateur
 */
export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Charger la progression au chargement
    const loadProgress = async () => {
      try {
        const userProgress = await API.progress.getProgress();
        setProgress(userProgress);
      } catch (error) {
        console.error('Erreur lors du chargement de la progression:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProgress();
  }, []);
  
  // Fonctions de progression
  const completeModule = async (moduleId, islandId) => {
    const updatedProgress = await API.progress.completeModule(moduleId, islandId);
    setProgress(updatedProgress);
    return updatedProgress;
  };
  
  const completeChallenge = async (challengeId) => {
    const updatedProgress = await API.progress.completeChallenge(challengeId);
    setProgress(updatedProgress);
    return updatedProgress;
  };
  
  const saveModuleResponses = async (moduleId, responses) => {
    const updatedProgress = await API.progress.saveModuleResponses(moduleId, responses);
    setProgress(updatedProgress);
    return updatedProgress;
  };
  
  const resetProgress = () => {
    const initialProgress = API.progress.resetAllData();
    setProgress(initialProgress);
    return initialProgress;
  };
  
  return (
    <ProgressContext.Provider value={{ 
      progress, 
      loading, 
      completeModule, 
      completeChallenge, 
      saveModuleResponses, 
      resetProgress 
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

/**
 * Provider pour le contenu de l'application
 */
export const ContentProvider = ({ children }) => {
  const [islands, setIslands] = useState([]);
  const [modules, setModules] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Charger le contenu au chargement
    const loadContent = () => {
      try {
        const allIslands = API.content.getAllIslands();
        const allModules = API.content.getAllModules();
        const allChallenges = API.content.getAllChallenges();
        const allExercises = API.content.getAllExercises();
        
        setIslands(allIslands);
        setModules(allModules);
        setChallenges(allChallenges);
        setExercises(allExercises);
      } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadContent();
  }, []);
  
  return (
    <ContentContext.Provider value={{ islands, modules, challenges, exercises, loading }}>
      {children}
    </ContentContext.Provider>
  );
};

/**
 * Provider global qui combine tous les providers
 */
export const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <ProgressProvider>
        <ContentProvider>
          {children}
        </ContentProvider>
      </ProgressProvider>
    </AuthProvider>
  );
};

// Hooks personnalisés pour utiliser les contextes
export const useAuth = () => useContext(AuthContext);
export const useProgress = () => useContext(ProgressContext);
export const useContent = () => useContext(ContentContext);