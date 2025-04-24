// Service de stockage pour l'application IKIGAI
// Gère la persistance des données utilisateur (progression, badges, etc.)

import { supabase } from '../../shared/supabase';
import { UserProgress } from '../models/UserProgress';
import SecureStorage from '../../shared/SecureStorage';

class StorageService {
  // Clé utilisée pour le stockage local
  static LOCAL_STORAGE_KEY = 'ikigai_progress';
  
  // Sauvegarder l'état de complétion d'onboarding directement dans user_progress
  static async saveOnboardingCompletion(userId, progressData, completedAt) {
    try {
      if (!userId) {
        console.warn("saveOnboardingCompletion: ID utilisateur manquant");
        return false;
      }
      
      const timestamp = completedAt || new Date().toISOString();
      
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          progress_data: typeof progressData === 'string' ? progressData : JSON.stringify(progressData),
          onboarding_completed: true,
          onboarding_completed_at: timestamp,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
      if (error) {
        console.warn("Erreur mise à jour user_progress:", error.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Erreur critique saveOnboardingCompletion:", error);
      return false;
    }
  }
  
  // Obtenir la structure de données initiale pour un nouvel utilisateur
  static getInitialProgress(userId = null) {
    return new UserProgress(userId).toJSON();
  }
  
  // Récupérer la progression depuis Supabase
  static async getProgress() {
    try {
      console.log("DEBUG StorageService: Début de récupération de progression");
      
      // IMPORTANT: Timeout de sécurité pour éviter les blocages
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout lors de la récupération de l'utilisateur")), 5000)
      );
      
      // Vérifier si l'utilisateur est connecté
      console.log("DEBUG StorageService: Appel à supabase.auth.getUser()");
      
      // Utiliser Promise.race pour éviter que l'opération getUser() ne bloque indéfiniment 
      const userResult = await Promise.race([
        supabase.auth.getUser(),
        timeoutPromise
      ]);
      
      const { data: { user } } = userResult;
      
      if (user) {
        console.log(`DEBUG StorageService: Utilisateur connecté - ID: ${user.id}`);
        // Récupérer les données depuis Supabase
        console.log("DEBUG StorageService: Tentative de récupération des données de progression depuis Supabase");
        
        // Nouveau timeout pour la requête de progression
        const progressTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout lors de la récupération des données")), 5000)
        );
        
        const progressResult = await Promise.race([
          supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .single(),
          progressTimeoutPromise
        ]);
        
        const { data, error } = progressResult;
        
        if (error) {
          console.warn(`DEBUG StorageService: Erreur lors de la récupération des données de progression: ${error.message}`, error);
          throw error;
        }
        
        if (data) {
          console.log("DEBUG StorageService: Données de progression trouvées dans Supabase");
          try {
            const progressData = JSON.parse(data.progress_data);
            console.log("DEBUG StorageService: Parsing JSON réussi");
            return progressData;
          } catch (parseError) {
            console.error("DEBUG StorageService: Erreur de parsing JSON:", parseError);
            throw parseError;
          }
        } else {
          console.log("DEBUG StorageService: Aucune donnée trouvée dans Supabase pour cet utilisateur");
        }
      } else {
        console.log("DEBUG StorageService: Aucun utilisateur connecté");
      }
      
      // Si pas d'utilisateur connecté ou pas de données, utiliser localStorage
      console.log("DEBUG StorageService: Fallback vers le stockage local");
      return this.getProgressSync();
    } catch (error) {
      console.error('DEBUG StorageService: Erreur générale lors de la récupération des données:', error);
      console.log("DEBUG StorageService: Fallback vers le stockage local après erreur");
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
  
  // Sauvegarder les paramètres utilisateur dans Supabase
  static async saveUserSettings(settings) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("Utilisateur non connecté, impossible de sauvegarder les paramètres.");
        return false;
      }
      
      // S'assurer que les paramètres sont valides
      if (!settings || typeof settings !== 'object') {
        console.error('Paramètres utilisateur invalides');
        return false;
      }
      
      // Sauvegarder dans Supabase
      const { error } = await supabase
        .from('user_settings')
        .upsert({ 
          user_id: user.id, 
          settings: settings, 
          updated_at: new Date() 
        }, { onConflict: 'user_id' });
        
      if (error) {
        console.error('Erreur lors de la sauvegarde des paramètres:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erreur générale lors de la sauvegarde des paramètres:', error);
      return false;
    }
  }

  // Version synchrone utilisant SecureStorage (fallback)
  static getProgressSync() {
    const savedProgress = SecureStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (savedProgress) {
      return savedProgress;
    }
    return this.getInitialProgress();
  }
  
  // Sauvegarder la progression
  static async saveProgress(progressData) {
    try {
      // Sauvegarder en local d'abord (fallback)
      SecureStorage.setItem(this.LOCAL_STORAGE_KEY, progressData);
      
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
    SecureStorage.setItem(this.LOCAL_STORAGE_KEY, updatedProgress);
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
    SecureStorage.setItem(this.LOCAL_STORAGE_KEY, updatedProgress);
    return updatedProgress;
  }
  
  // Sauvegarder les réponses d'onboarding dans Supabase - Version optimisée et ultra-robuste
  static async saveOnboardingResponses(responses) {
    try {
      // Protection améliorée contre les appels multiples avec système de verrouillage
      if (window.IKIGAI_SAVING_ONBOARDING) {
        console.log("StorageService: Détection sauvegarde en cours, utilisation version en cache");
        return this.getProgressSync();
      }
      
      // Vérification des données d'entrée
      if (!responses || typeof responses !== 'object') {
        console.warn("StorageService: Réponses invalides reçues", { type: typeof responses });
        return this.getProgressSync();
      }
      
      // Verrouiller immédiatement pour éviter les appels concurrents
      window.IKIGAI_SAVING_ONBOARDING = true;
      const lockTimestamp = Date.now();
      console.log("StorageService: Début sauvegarde onboarding à", new Date(lockTimestamp).toISOString());
      
      // Sauvegarde redondante dans localStorage + sessionStorage pour résilience maximale
      try {
        // Format de données optimisé pour stockage local
        const backupData = {
          responses: responses,
          timestamp: new Date().toISOString(),
          lockId: lockTimestamp
        };
        
        // Sauvegarde multiple pour mitiger les erreurs de stockage
        localStorage.setItem('onboarding_backup_responses', JSON.stringify(backupData));
        localStorage.setItem('onboarding_backup_timestamp', backupData.timestamp);
        sessionStorage.setItem('onboarding_backup_responses', JSON.stringify(backupData));
      } catch (e) {
        console.warn("Erreur de sauvegarde locale (non bloquant):", e.message);
      }
      
      // Prétraitement - Traiter les valeurs personnalisées et normaliser les données
      let responsesToSave = { ...responses };
      
      // Fusionner toutes les entrées _custom dans un objet dédié
      const customValues = {};
      Object.keys(responsesToSave).forEach(key => {
        if (key.endsWith('_custom')) {
          const mainQuestionId = key.replace('_custom', '');
          customValues[mainQuestionId] = responsesToSave[key];
          delete responsesToSave[key]; // Supprimer l'entrée originale
        }
      });
      
      // Ajouter l'objet customValues uniquement s'il y a des valeurs
      if (Object.keys(customValues).length > 0) {
        responsesToSave.customValues = customValues;
      }
      
      // Garantir un timestamp de complétion et un ID unique
      responsesToSave.completedAt = responsesToSave.completedAt || new Date().toISOString();
      responsesToSave.saveId = lockTimestamp; // Utiliser le timestamp comme identifiant de sauvegarde
      
      // PRIORITÉ 1: Sauvegarder en local immédiatement (solution la plus rapide et fiable)
      let userProgress;
      try {
        // Utiliser la version synchrone pour éviter les blocages
        const progress = this.getProgressSync();
        userProgress = UserProgress.fromJSON(progress);
        
        // Sauvegarder les réponses dans l'objet de progression
        userProgress.saveModuleResponses('onboarding', responsesToSave);
        userProgress.setOnboardingCompleted(true, responsesToSave.completedAt);
        
        // Sauvegarder dans SecureStorage
        SecureStorage.setItem(this.LOCAL_STORAGE_KEY, userProgress.toJSON());
        console.log("Sauvegarde locale réussie");
      } catch (localError) {
        console.warn("Erreur de sauvegarde locale, création objet minimal:", localError.message);
        // Créer un objet minimal en cas d'échec
        userProgress = new UserProgress();
        userProgress.saveModuleResponses('onboarding', responsesToSave);
        userProgress.setOnboardingCompleted(true, responsesToSave.completedAt);
      }
      
      // PRIORITÉ 2: Lancer la sauvegarde Supabase en arrière-plan sans bloquer l'UI
      // Utiliser Promise pour éviter les attentes
      Promise.resolve().then(async () => {
        try {
          // Vérifier l'utilisateur avec timeout de protection
          let user = null;
          try {
            const userPromise = supabase.auth.getUser();
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error("Timeout récupération utilisateur")), 3000)
            );
            
            const { data } = await Promise.race([userPromise, timeoutPromise]);
            user = data?.user;
          } catch (userError) {
            console.warn("Échec récupération utilisateur:", userError.message);
            return; // Terminer si pas d'utilisateur
          }
          
          if (!user) {
            console.log("Aucun utilisateur connecté, sauvegarde Supabase ignorée");
            return;
          }
          
          // Utiliser Promise.allSettled pour effectuer toutes les sauvegardes en parallèle
          // sans qu'une erreur ne bloque les autres
          Promise.allSettled([
            // 1. Sauvegarde dans user_responses (table principale)
            supabase
              .from('user_responses')
              .upsert({
                user_id: user.id,
                module_id: 'onboarding',
                responses: responsesToSave,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id,module_id' }),
              
            // 2. Sauvegarde dans onboarding_responses (table spécifique)
            supabase
              .from('onboarding_responses')
              .upsert({
                user_id: user.id,
                responses: responsesToSave,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' }),
              
            // 3. Mise à jour de user_progress (table de progression globale)
            supabase
              .from('user_progress')
              .upsert({
                user_id: user.id,
                progress_data: JSON.stringify(userProgress.toJSON()),
                onboarding_completed: true,
                onboarding_completed_at: responsesToSave.completedAt,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' })
          ]).then(results => {
            // Analyser les résultats
            const [userResponsesResult, onboardingResponsesResult, userProgressResult] = results;
            
            let successCount = 0;
            let errorMessages = [];
            
            results.forEach((result, index) => {
              const tables = ['user_responses', 'onboarding_responses', 'user_progress'];
              if (result.status === 'fulfilled') {
                successCount++;
                console.log(`Sauvegarde ${tables[index]} réussie`);
              } else {
                errorMessages.push(`${tables[index]}: ${result.reason?.message || 'Erreur inconnue'}`);
              }
            });
            
            if (successCount === results.length) {
              console.log("Toutes les sauvegardes Supabase réussies");
            } else {
              console.warn(`Sauvegarde partielle (${successCount}/${results.length}):`, errorMessages);
            }
          });
        } catch (error) {
          console.error("Erreur générale sauvegarde Supabase (non bloquant):", error.message);
        } finally {
          // Toujours libérer le verrou après un délai raisonnable
          setTimeout(() => {
            window.IKIGAI_SAVING_ONBOARDING = false;
            console.log("Verrou de sauvegarde libéré");
          }, 1500);
        }
      });
      
      // PRIORITÉ 3: Retourner immédiatement le nouvel état de progression sans attendre Supabase
      return userProgress.toJSON();
    } catch (error) {
      console.error('Erreur critique lors de la sauvegarde onboarding:', error.message);
      
      // Libérer le verrou même en cas d'erreur
      window.IKIGAI_SAVING_ONBOARDING = false;
      
      // Utiliser le fallback synchrone en dernier recours
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
    SecureStorage.setItem(this.LOCAL_STORAGE_KEY, updatedProgress);
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
    SecureStorage.setItem(this.LOCAL_STORAGE_KEY, updatedProgress);
    return updatedProgress;
  }
  
  // Réinitialiser toutes les données
  static resetAllData() {
    SecureStorage.removeItem(this.LOCAL_STORAGE_KEY);
    return this.getInitialProgress();
  }
}

export default StorageService;