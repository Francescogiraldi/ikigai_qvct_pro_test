// Service de stockage pour l'application IKIGAI
// Gère la persistance des données utilisateur (progression, badges, etc.)

import { supabase } from '../../shared/supabase';
import { UserProgress } from '../models/UserProgress';
import SecureStorage from '../../shared/SecureStorage';

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
  
  // Sauvegarder les réponses d'onboarding dans Supabase (optimisé)
  static async saveOnboardingResponses(responses) {
    try {
      console.log("StorageService: Sauvegarde des réponses d'onboarding");
      
      // Traiter les valeurs personnalisées si nécessaire
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
      
      // 1. Sauvegarder en local immédiatement (pour fallback rapide)
      const progress = await this.getProgress();
      const userProgress = UserProgress.fromJSON(progress);
      userProgress.saveModuleResponses('onboarding', responsesToSave);
      SecureStorage.setItem(this.LOCAL_STORAGE_KEY, userProgress.toJSON());
      
      // 2. Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 3. Sauvegarder dans Supabase de manière non-bloquante (avec Promise.allSettled)
        // Cette approche permet une exécution parallèle et ne bloque pas même si une opération échoue
        Promise.allSettled([
          // STRATÉGIE PRINCIPALE: Sauvegarder dans user_responses (prioritaire)
          // Notre déclencheur SQL s'occupera de synchroniser vers onboarding_responses
          supabase
            .from('user_responses')
            .upsert({
              user_id: user.id,
              module_id: 'onboarding',
              responses: responsesToSave,
              created_at: new Date(),
              updated_at: new Date()
            }, { onConflict: 'user_id,module_id' }),
            
          // MISE À JOUR PARALLÈLE: Sauvegarder dans la table de progression
          supabase
            .from('user_progress')
            .upsert({
              user_id: user.id,
              progress_data: JSON.stringify(userProgress.toJSON()),
              updated_at: new Date()
            }, { onConflict: 'user_id' })
        ])
        .then(results => {
          // Traiter les résultats sans bloquer le flux
          const [userResponsesResult, progressResult] = results;
          
          // Vérifier si la première opération a réussi
          if (userResponsesResult.status === 'fulfilled') {
            console.log("StorageService: Sauvegarde dans user_responses réussie");
          } else {
            console.warn("StorageService: Échec de sauvegarde dans user_responses:", 
              userResponsesResult.reason?.message || "Erreur inconnue");
              
            // FALLBACK: En cas d'échec, essayer directement onboarding_responses
            // Cela ne bloque pas le flux car c'est dans une promesse
            supabase
              .from('onboarding_responses')
              .upsert({
                user_id: user.id,
                responses: responsesToSave,
                updated_at: new Date()
              }, { onConflict: 'user_id' })
              .then(({ error }) => {
                if (error) {
                  console.warn("StorageService: Échec du fallback:", error.message);
                  throw error;
                } else {
                  console.log("StorageService: Fallback vers onboarding_responses réussi");
                }
              })
              .catch(err => {
                // Même en cas d'échec, ne pas bloquer le flux
                console.error("StorageService: Erreur critique de sauvegarde:", err);
                // Sauvegarde de dernier recours
                SecureStorage.setItem('onboarding_responses_backup', {
                  user_id: user.id,
                  responses: responsesToSave,
                  timestamp: new Date().toISOString()
                });
              });
          }
          
          // Vérifier si la deuxième opération a réussi
          if (progressResult.status === 'fulfilled') {
            console.log("StorageService: Mise à jour progress_data réussie");
          } else {
            console.warn("StorageService: Échec de la mise à jour progress_data:", 
              progressResult.reason?.message || "Erreur inconnue");
          }
        })
        .catch(err => {
          // Ne jamais bloquer le flux principal même en cas d'erreur globale
          console.error("StorageService: Erreur dans la gestion des promesses:", err);
        });
        
        // Note importante: nous ne mettons pas de await devant Promise.allSettled
        // pour éviter de bloquer le flux de l'application
      } else {
        console.log("StorageService: Aucun utilisateur connecté, sauvegarde locale uniquement");
      }
      
      // 4. Retourner immédiatement les données mises à jour sans attendre les opérations Supabase
      // Cela permet à l'utilisateur de continuer sa navigation sans blocage
      return userProgress.toJSON();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des réponses d\'onboarding:', error);
      // Même en cas d'erreur, utiliser le fallback sync et continuer
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