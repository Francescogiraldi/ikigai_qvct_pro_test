// Service de stockage pour l'application IKIGAI
// Gère la persistance des données utilisateur (progression, badges, etc.)

import { supabase } from '../../shared/supabase';
import { UserProgress } from '../models/UserProgress';

class StorageService {
  // Clé utilisée pour le stockage local
  static LOCAL_STORAGE_KEY = 'ikigai_progress';
  
  // Obtenir la structure de données initiale pour un nouvel utilisateur
  static getInitialProgress(userId = null) {
    return new UserProgress(userId).toJSON();
  }
  
  // Récupérer la progression depuis Supabase
  static async getProgress() {
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Récupérer les données depuis Supabase
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          return JSON.parse(data.progress_data);
        }
      }
      
      // Si pas d'utilisateur connecté ou pas de données, utiliser localStorage
      return this.getProgressSync();
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return this.getProgressSync();
    }
  }
  
  // Récupérer les paramètres utilisateur depuis Supabase
  static async getUserSettings() {
    // Définir les paramètres par défaut
    const defaultSettings = {
      notifications: true,
      sounds: true,
      darkMode: false,
      dataPrivacy: 'standard',
      language: 'fr',
      dailyReminders: false,
      meditationSounds: false
    };
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("Utilisateur non connecté, utilisation des paramètres par défaut.");
        return defaultSettings;
      }
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') { // PGRST116: No rows found
          console.log('Aucun paramètre trouvé pour cet utilisateur, utilisation des paramètres par défaut.');
          return defaultSettings;
        } else {
          console.error('Erreur lors de la récupération des paramètres utilisateur:', error);
          // En cas d'erreur de requête, utiliser les paramètres par défaut
          return defaultSettings;
        }
      }
      
      if (data && data.settings) {
        // Traiter selon le type de données retourné
        if (typeof data.settings === 'string') {
          try {
            // Essayer de parser la chaîne JSON
            const parsedSettings = JSON.parse(data.settings);
            // Fusionner avec les paramètres par défaut pour s'assurer que tous les champs sont présents
            return { ...defaultSettings, ...parsedSettings };
          } catch (parseError) {
            console.error('Erreur lors du parsing des paramètres JSON:', parseError);
            return defaultSettings;
          }
        } else if (typeof data.settings === 'object') {
          // Si c'est déjà un objet, le fusionner avec les paramètres par défaut
          // S'assurer que les valeurs booléennes sont correctement converties
          const settings = { ...defaultSettings };
          Object.keys(data.settings).forEach(key => {
            if (typeof defaultSettings[key] === 'boolean') {
              settings[key] = Boolean(data.settings[key]);
            } else {
              settings[key] = data.settings[key];
            }
          });
          return settings;
        } else {
          console.warn('Format des paramètres inattendu:', data.settings);
          return defaultSettings;
        }
      } else {
        // Pas de paramètres trouvés
        return defaultSettings;
      }
    } catch (error) {
      console.error('Erreur générale lors de la récupération des paramètres utilisateur:', error);
      // En cas d'erreur générale, utiliser les paramètres par défaut
      return defaultSettings;
    }
  }

  // Version synchrone utilisant localStorage (fallback)
  static getProgressSync() {
    const savedProgress = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (savedProgress) {
      try {
        return JSON.parse(savedProgress);
      } catch (e) {
        console.error('Erreur lors du parsing des données locales:', e);
        return this.getInitialProgress();
      }
    }
    return this.getInitialProgress();
  }
  
  // Sauvegarder la progression
  static async saveProgress(progressData) {
    try {
      // Sauvegarder en local d'abord (fallback)
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(progressData));
      
      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Sauvegarder dans Supabase
        const { error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: user.id,
            progress_data: JSON.stringify(progressData),
            updated_at: new Date()
          });
        
        if (error) throw error;
      }
      
      return progressData;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
      return progressData;
    }
  }
  
  // Compléter un module
  static async completeModule(moduleId, islandId) {
    try {
      const progress = await this.getProgress();
      
      // Utiliser la classe UserProgress pour encapsuler la logique
      const userProgress = UserProgress.fromJSON(progress);
      userProgress.completeModule(moduleId, islandId);
      const updatedProgress = userProgress.toJSON();
      
      // Sauvegarder les changements
      return await this.saveProgress(updatedProgress);
    } catch (error) {
      console.error('Erreur lors de la complétion du module:', error);
      return this.completeModuleSync(moduleId, islandId);
    }
  }
  
  // Version synchrone pour compléter un module (fallback)
  static completeModuleSync(moduleId, islandId) {
    const progress = this.getProgressSync();
    
    // Utiliser la classe UserProgress pour encapsuler la logique
    const userProgress = UserProgress.fromJSON(progress);
    userProgress.completeModule(moduleId, islandId);
    const updatedProgress = userProgress.toJSON();
    
    // Sauvegarder les changements
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(updatedProgress));
    return updatedProgress;
  }
  
  // Compléter un défi quotidien
  static async completeChallenge(challengeId) {
    try {
      const progress = await this.getProgress();
      
      // Utiliser la classe UserProgress pour encapsuler la logique
      const userProgress = UserProgress.fromJSON(progress);
      userProgress.completeChallenge(challengeId);
      const updatedProgress = userProgress.toJSON();
      
      // Sauvegarder les changements
      return await this.saveProgress(updatedProgress);
    } catch (error) {
      console.error('Erreur lors de la complétion du défi:', error);
      return this.completeChallengeSync(challengeId);
    }
  }
  
  // Version synchrone pour compléter un défi (fallback)
  static completeChallengeSync(challengeId) {
    const progress = this.getProgressSync();
    
    // Utiliser la classe UserProgress pour encapsuler la logique
    const userProgress = UserProgress.fromJSON(progress);
    userProgress.completeChallenge(challengeId);
    const updatedProgress = userProgress.toJSON();
    
    // Sauvegarder les changements
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(updatedProgress));
    return updatedProgress;
  }
  
  // Sauvegarder les réponses d'onboarding dans Supabase
  static async saveOnboardingResponses(responses) {
    try {
      console.log("StorageService: Sauvegarde des réponses d'onboarding:", responses);
      
      // Traiter les valeurs personnalisées si nécessaire
      let responsesToSave = { ...responses };
      
      // Si des entrées se terminent par _custom, les fusionner correctement
      Object.keys(responsesToSave).forEach(key => {
        if (key.endsWith('_custom')) {
          const mainQuestionId = key.replace('_custom', '');
          console.log(`StorageService: Fusion des données personnalisées pour ${mainQuestionId}`);
          
          // Ajouter les données personnalisées à l'objet principal
          responsesToSave.customValues = responsesToSave.customValues || {};
          responsesToSave.customValues[mainQuestionId] = responsesToSave[key];
          
          // Supprimer l'entrée _custom séparée pour éviter la duplication
          delete responsesToSave[key];
        }
      });
      
      // S'assurer que nous avons un timestamp de complétion
      if (!responsesToSave.completedAt) {
        responsesToSave.completedAt = new Date().toISOString();
      }
      
      // Sauvegarder en local d'abord (fallback)
      const progress = await this.getProgress();
      const userProgress = UserProgress.fromJSON(progress);
      userProgress.saveModuleResponses('onboarding', responsesToSave);
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(userProgress.toJSON()));
      
      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log("StorageService: Utilisateur connecté, sauvegarde dans Supabase pour:", user.id);
        
        // Approche simplifiée: utiliser une seule stratégie principale avec fallback
        try {
          // STRATÉGIE PRINCIPALE: Utiliser la table user_responses
          console.log("StorageService: Tentative de sauvegarde dans user_responses");
          const { error } = await supabase
            .from('user_responses')
            .upsert({
              user_id: user.id,
              module_id: 'onboarding',
              responses: responsesToSave,
              created_at: new Date()
            }, { onConflict: 'user_id,module_id' });
          
          if (error) {
            console.warn("StorageService: Erreur avec user_responses:", error.message);
            
            // FALLBACK: Tenter avec onboarding_responses dédiée
            console.log("StorageService: Tentative avec table dédiée onboarding_responses");
            const { error: fallbackError } = await supabase
              .from('onboarding_responses')
              .upsert({
                user_id: user.id,
                responses: responsesToSave,
                updated_at: new Date()
              }, { onConflict: 'user_id' });
              
            if (fallbackError) {
              console.warn("StorageService: Fallback également échoué:", fallbackError.message);
              throw fallbackError;
            } else {
              console.log("StorageService: Sauvegarde dans onboarding_responses réussie");
            }
          } else {
            console.log("StorageService: Sauvegarde dans user_responses réussie");
          }
        } catch (err) {
          console.error("StorageService: Échec de toutes les stratégies:", err);
          
          // Sauvegarder localement en cas d'échec total
          localStorage.setItem('onboarding_responses_backup', JSON.stringify({
            user_id: user.id,
            responses: responsesToSave,
            timestamp: new Date().toISOString(),
            error: err.message
          }));
        }
        
        // Dans tous les cas, mettre à jour user_progress pour compatibilité
        const updatedProgress = userProgress.toJSON();
        await this.saveProgress(updatedProgress);
      } else {
        console.log("StorageService: Aucun utilisateur connecté, sauvegarde locale uniquement");
      }
      
      return userProgress.toJSON();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des réponses d\'onboarding:', error);
      return this.saveOnboardingResponsesSync(responses);
    }
  }
  
  // Version synchrone pour sauvegarder les réponses d'onboarding (fallback)
  static saveOnboardingResponsesSync(responses) {
    // Traiter les valeurs personnalisées comme dans la version asynchrone
    let responsesToSave = { ...responses };
    
    // Si des entrées se terminent par _custom, les fusionner correctement
    Object.keys(responsesToSave).forEach(key => {
      if (key.endsWith('_custom')) {
        const mainQuestionId = key.replace('_custom', '');
        
        // Ajouter les données personnalisées à l'objet principal
        responsesToSave.customValues = responsesToSave.customValues || {};
        responsesToSave.customValues[mainQuestionId] = responsesToSave[key];
        
        // Supprimer l'entrée _custom séparée pour éviter la duplication
        delete responsesToSave[key];
      }
    });
    
    // S'assurer que nous avons un timestamp de complétion
    if (!responsesToSave.completedAt) {
      responsesToSave.completedAt = new Date().toISOString();
    }
    
    const progress = this.getProgressSync();
    const userProgress = UserProgress.fromJSON(progress);
    userProgress.saveModuleResponses('onboarding', responsesToSave);
    const updatedProgress = userProgress.toJSON();
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(updatedProgress));
    return updatedProgress;
  }
  
  // Sauvegarder les réponses d'un module
  static async saveModuleResponses(moduleId, responses) {
    // Pour l'onboarding, utiliser la méthode spécifique
    if (moduleId === 'onboarding') {
      return await this.saveOnboardingResponses(responses);
    }
    
    try {
      const progress = await this.getProgress();
      
      // Utiliser la classe UserProgress pour encapsuler la logique
      const userProgress = UserProgress.fromJSON(progress);
      userProgress.saveModuleResponses(moduleId, responses);
      const updatedProgress = userProgress.toJSON();
      
      // Sauvegarder les changements
      return await this.saveProgress(updatedProgress);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des réponses:', error);
      return this.saveModuleResponsesSync(moduleId, responses);
    }
  }
  
  // Version synchrone pour sauvegarder les réponses (fallback)
  static saveModuleResponsesSync(moduleId, responses) {
    // Pour l'onboarding, utiliser la méthode spécifique
    if (moduleId === 'onboarding') {
      return this.saveOnboardingResponsesSync(responses);
    }
    
    const progress = this.getProgressSync();
    
    // Utiliser la classe UserProgress pour encapsuler la logique
    const userProgress = UserProgress.fromJSON(progress);
    userProgress.saveModuleResponses(moduleId, responses);
    const updatedProgress = userProgress.toJSON();
    
    // Sauvegarder les changements
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(updatedProgress));
    return updatedProgress;
  }
  
  // Réinitialiser toutes les données
  static resetAllData() {
    localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    return this.getInitialProgress();
  }
}

export default StorageService;