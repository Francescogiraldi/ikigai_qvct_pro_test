// Service de stockage pour l'application IKIGAI
// Gère la persistance des données utilisateur (progression, badges, etc.)

import { supabase } from '../../src/shared/supabase.js';

// Version simplifiée de UserProgress pour les tests
class UserProgress {
  constructor(userId) {
    this.userId = userId;
    this.totalPoints = 0;
    this.streak = 0;
    this.wellnessScore = 65;
    this.completedModules = {};
    this.completedChallenges = [];
    this.badges = [];
    this.moduleResponses = {};
    this.islandProgress = {
      mindfulness: { progress: 0, completedModules: 0 },
      productivity: { progress: 0, completedModules: 0 },
      stress: { progress: 0, completedModules: 0 },
      balance: { progress: 0, completedModules: 0 }
    };
  }

  static fromJSON(json) {
    const progress = new UserProgress(json.userId);
    progress.totalPoints = json.totalPoints || 0;
    progress.streak = json.streak || 0;
    progress.wellnessScore = json.wellnessScore || 65;
    progress.completedModules = json.completedModules || {};
    progress.completedChallenges = json.completedChallenges || [];
    progress.badges = json.badges || [];
    progress.moduleResponses = json.moduleResponses || {};
    progress.islandProgress = json.islandProgress || {
      mindfulness: { progress: 0, completedModules: 0 },
      productivity: { progress: 0, completedModules: 0 },
      stress: { progress: 0, completedModules: 0 },
      balance: { progress: 0, completedModules: 0 }
    };
    return progress;
  }

  toJSON() {
    return {
      userId: this.userId,
      totalPoints: this.totalPoints,
      streak: this.streak,
      wellnessScore: this.wellnessScore,
      completedModules: this.completedModules,
      completedChallenges: this.completedChallenges,
      badges: this.badges,
      moduleResponses: this.moduleResponses,
      islandProgress: this.islandProgress
    };
  }

  saveModuleResponses(moduleId, responses) {
    this.moduleResponses[moduleId] = {
      responses,
      completedAt: new Date().toISOString()
    };
    return this;
  }

  completeModule(moduleId, islandId) {
    this.completedModules[moduleId] = true;
    return this;
  }
}

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
        
        // STRATÉGIE 1: Utiliser la table onboarding_responses dédiée
        try {
          console.log("StorageService: Tentative avec table dédiée onboarding_responses");
          const { error } = await supabase
            .from('onboarding_responses')
            .upsert({
              user_id: user.id,
              responses: responsesToSave,
              updated_at: new Date()
            }, { onConflict: 'user_id' });
            
          if (error) {
            // Si la table n'existe pas
            if (error.code === 'PGRST116' || error.message.includes("relation") || error.message.includes("does not exist")) {
              console.warn("StorageService: Table onboarding_responses non disponible:", error.message);
              throw new Error('table_not_found');
            }
            throw error;
          }
          
          console.log("StorageService: Sauvegarde dans onboarding_responses réussie");
        } catch (err) {
          // Si la table onboarding_responses n'existe pas, tenter avec user_responses
          if (err.message === 'table_not_found') {
            console.warn("StorageService: Table dédiée non trouvée, essai avec user_responses");
            
            // STRATÉGIE 2: Tenter avec user_responses (structure standard)
            try {
              const { error: stdError } = await supabase
                .from('user_responses')
                .upsert({
                  user_id: user.id,
                  module_id: 'onboarding',
                  responses: responsesToSave,
                  created_at: new Date()
                }, { onConflict: 'user_id,module_id' });
                
              if (stdError) {
                // Si erreur de structure, essayer une approche par question
                if (stdError.message && (
                    stdError.message.includes("column") || 
                    stdError.code === 'PGRST204' ||
                    stdError.message.includes("question_id") || 
                    stdError.code === '42703')) {
                  console.warn("StorageService: Structure différente détectée:", stdError.message);
                  
                  // STRATÉGIE 3: Structure avec question_id (une entrée par question)
                  console.log("StorageService: Essai avec structure par question");
                  
                  // Fonction pour générer UUID
                  const uuidv4 = () => {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                      var r = Math.random() * 16 | 0;
                      var v = c === 'x' ? r : ((r & 0x3) | 0x8);
                      return v.toString(16);
                    });
                  };
                  
                  // Insertion par lot pour toutes les questions
                  const insertPromises = [];
                  
                  // Parcourir toutes les réponses
                  Object.entries(responsesToSave).forEach(([questionId, value]) => {
                    // Ignorer les métadonnées
                    if (questionId === 'completedAt' || questionId === 'customValues') {
                      return;
                    }
                    
                    // Convertir la valeur en texte
                    let answerText = '';
                    if (Array.isArray(value)) {
                      answerText = value.join(', ');
                    } else if (typeof value === 'object') {
                      answerText = JSON.stringify(value);
                    } else {
                      answerText = String(value);
                    }
                    
                    // Créer une entrée pour cette question
                    insertPromises.push(
                      supabase
                        .from('user_responses')
                        .insert({
                          user_id: user.id,
                          question_id: uuidv4(),
                          // Les champs suivants seront ignorés si non supportés
                          question_text: questionId,
                          answer_text: answerText,
                          created_at: new Date()
                        })
                    );
                  });
                  
                  // Traiter les valeurs personnalisées
                  if (responsesToSave.customValues) {
                    Object.entries(responsesToSave.customValues).forEach(([qId, customObj]) => {
                      Object.entries(customObj).forEach(([option, value]) => {
                        insertPromises.push(
                          supabase
                            .from('user_responses')
                            .insert({
                              user_id: user.id,
                              question_id: uuidv4(),
                              question_text: `${qId}_custom_${option}`,
                              answer_text: String(value),
                              created_at: new Date()
                            })
                        );
                      });
                    });
                  }
                  
                  // Ajouter une entrée pour la date de complétion
                  insertPromises.push(
                    supabase
                      .from('user_responses')
                      .insert({
                        user_id: user.id,
                        question_id: uuidv4(),
                        question_text: 'onboarding_completed',
                        answer_text: responsesToSave.completedAt,
                        created_at: new Date()
                      })
                  );
                  
                  // Exécuter toutes les insertions et vérifier les résultats
                  const results = await Promise.allSettled(insertPromises);
                  const successCount = results.filter(r => r.status === 'fulfilled' && !r.value?.error).length;
                  
                  console.log(`StorageService: ${successCount}/${insertPromises.length} insertions réussies`);
                  
                  // Considérer comme un succès si au moins 70% des insertions ont réussi
                  if (successCount < insertPromises.length * 0.7) {
                    console.error("StorageService: Trop d'échecs d'insertion");
                    
                    // Sauvegarder localement également
                    localStorage.setItem('onboarding_responses_backup', JSON.stringify({
                      user_id: user.id,
                      responses: responsesToSave,
                      timestamp: new Date().toISOString()
                    }));
                  }
                } else {
                  // Autre type d'erreur
                  console.error("StorageService: Erreur lors de la sauvegarde standard:", stdError);
                  throw stdError;
                }
              } else {
                console.log("StorageService: Sauvegarde dans user_responses standard réussie");
              }
            } catch (structErr) {
              console.error("StorageService: Échec de toutes les stratégies:", structErr);
              
              // Sauvegarder localement en cas d'échec
              localStorage.setItem('onboarding_responses_backup', JSON.stringify({
                user_id: user.id,
                responses: responsesToSave,
                timestamp: new Date().toISOString(),
                error: structErr.message
              }));
            }
          } else {
            // Autre type d'erreur
            console.error("StorageService: Erreur avec la table dédiée:", err);
            throw err;
          }
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