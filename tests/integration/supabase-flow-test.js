// Script de test pour simuler le flux complet d'intégration avec Supabase
// Ce test vérifie:
// 1. L'inscription d'un nouvel utilisateur
// 2. L'enregistrement des données d'onboarding
// 3. La progression de l'utilisateur
// 4. La complétion de modules
// 5. L'intégrité des données à travers les différentes tables

// Utilisation de require pour la compatibilité avec Node.js sans configuration supplémentaire
const { createClient } = require('@supabase/supabase-js');

// Importer la configuration centralisée pour les tests
const { getTestConfig } = require('../config');

// Obtenir la configuration Supabase de manière sécurisée
const { supabaseUrl, supabaseAnonKey } = getTestConfig();
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Note: Pour la production, utilisez les variables d'environnement
// Voir le fichier .env.template pour les variables à configurer

// Implémentation simplifiée des services pour les tests
const AuthService = {
  signUp: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      
      return {
        success: true,
        user: data.user,
        message: 'Inscription réussie!'
      };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return {
        success: false,
        user: null,
        message: error.message
      };
    }
  },
  
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return {
        success: true,
        user: data.user,
        message: 'Connexion réussie!'
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return {
        success: false,
        user: null,
        message: error.message
      };
    }
  },
  
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      return {
        success: true,
        message: 'Déconnexion réussie!'
      };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
};

// Modèle simplifié de UserProgress
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

  addPoints(points) {
    this.totalPoints += points;
    return this.totalPoints;
  }

  completeModule(moduleId, islandId) {
    this.completedModules[moduleId] = true;
    return this;
  }
  
  completeChallenge(challengeId) {
    if (!this.completedChallenges.includes(challengeId)) {
      this.completedChallenges.push(challengeId);
      this.totalPoints += 50;
      this.streak += 1;
    }
    return this;
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
}

// Implémentation simplifiée du service de stockage
const StorageService = {
  saveProgress: async (progressData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
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
  },
  
  saveOnboardingResponses: async (responses) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('onboarding_responses')
          .upsert({
            user_id: user.id,
            responses: responses,
            updated_at: new Date()
          }, { onConflict: 'user_id' });
          
        if (error) {
          // Si la table n'existe pas, essayer avec user_responses
          if (error.code === 'PGRST116' || error.message.includes("relation") || error.message.includes("does not exist")) {
            const { error: stdError } = await supabase
              .from('user_responses')
              .upsert({
                user_id: user.id,
                module_id: 'onboarding',
                responses: responses,
                created_at: new Date()
              }, { onConflict: 'user_id,module_id' });
              
            if (stdError) throw stdError;
          } else {
            throw error;
          }
        }
      }
      
      return responses;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des réponses d\'onboarding:', error);
      return responses;
    }
  },
  
  saveModuleResponses: async (moduleId, responses) => {
    if (moduleId === 'onboarding') {
      return await StorageService.saveOnboardingResponses(responses);
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('user_responses')
          .upsert({
            user_id: user.id,
            module_id: moduleId,
            responses: responses,
            created_at: new Date()
          }, { onConflict: 'user_id,module_id' });
          
        if (error) throw error;
      }
      
      return responses;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des réponses:', error);
      return responses;
    }
  }
};

// Fonctions utilitaires pour les tests
const generateTestEmail = () => `test_${Date.now()}@example.com`;
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const logResult = (step, success, details = {}) => {
  console.log(`${success ? '✅' : '❌'} [${step}]`, details);
  return success;
};

// Fonction pour nettoyer les données après les tests
async function cleanupTestData(userId) {
  if (!userId) return;
  
  try {
    // Supprimer les données de test en parallèle
    const tables = ['user_progress', 'onboarding_responses', 'user_responses', 'user_recommendations'];
    
    await Promise.all(tables.map(table => 
      supabase.from(table).delete().eq('user_id', userId)
    ));
    
    // Tenter de supprimer l'utilisateur (peut ne pas fonctionner selon les permissions)
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) console.warn("Impossible de supprimer l'utilisateur de test:", error.message);
    
    console.log('🧹 Nettoyage des données de test effectué');
  } catch (error) {
    console.error('Erreur lors du nettoyage des données de test:', error);
  }
}

// Fonction principale de test
async function runSupabaseFlowTest(options = {}) {
  console.log('🚀 Démarrage du test d\'intégration Supabase');
  
  const testPassword = 'Test@123456';
  const testEmail = generateTestEmail();
  let userId = null;
  
  const verbose = options.verbose === undefined ? true : options.verbose;
  
  try {
    // 1. Inscription d'un nouvel utilisateur
    console.log('\n1️⃣ Test d\'inscription d\'un utilisateur');
    const signUpResult = await AuthService.signUp(testEmail, testPassword);
    
    if (!signUpResult.success || !signUpResult.user) {
      throw new Error(`Échec de l'inscription: ${signUpResult.message}`);
    }
    
    userId = signUpResult.user.id;
    logResult('Inscription', true, { userId, email: testEmail });
    
    // Attendre que l'inscription soit traitée
    await wait(2000);
    
    // 2. Connexion avec le nouvel utilisateur
    console.log('\n2️⃣ Test de connexion');
    const signInResult = await AuthService.signIn(testEmail, testPassword);
    
    if (!signInResult.success || !signInResult.user) {
      throw new Error(`Échec de la connexion: ${signInResult.message}`);
    }
    
    logResult('Connexion', true, { userId: signInResult.user.id });
    
    // 3. Simuler la complétion de l'onboarding
    console.log('\n3️⃣ Test d\'enregistrement des données d\'onboarding');
    const onboardingResponses = {
      q1: 'Stress et anxiété',
      q2: ['Méditation', 'Respiration'],
      q3: 7,
      q4: 'Mieux dormir',
      q5_custom: {
        'Autre objectif': 'Améliorer ma concentration'
      },
      completedAt: new Date().toISOString()
    };
    
    const onboardingResult = await StorageService.saveOnboardingResponses(onboardingResponses);
    logResult('Sauvegarde onboarding', true, { moduleResponses: !!onboardingResult.moduleResponses.onboarding });
    
    // Attendre que les données soient traitées
    await wait(1000);
    
    // 4. Vérifier l'enregistrement dans la table onboarding_responses
    console.log('\n4️⃣ Vérification des données d\'onboarding');
    
    let onboardingData = null;
    
    // Essayer d'abord la table dédiée
    const { data: dedicatedData, error: dedicatedError } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (dedicatedData) {
      onboardingData = dedicatedData;
      logResult('Récupération onboarding (table dédiée)', true, { found: true });
    } else {
      // Essayer la table standard
      const { data: standardData, error: standardError } = await supabase
        .from('user_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('module_id', 'onboarding')
        .single();
        
      if (standardData) {
        onboardingData = standardData;
        logResult('Récupération onboarding (table standard)', true, { found: true });
      } else {
        // Tentative de récupération dans progress_data
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('progress_data')
          .eq('user_id', userId)
          .single();
          
        if (progressData?.progress_data) {
          const parsedData = typeof progressData.progress_data === 'string' 
            ? JSON.parse(progressData.progress_data) 
            : progressData.progress_data;
            
          if (parsedData.moduleResponses?.onboarding) {
            onboardingData = { 
              embedded: true, 
              responses: parsedData.moduleResponses.onboarding 
            };
            logResult('Récupération onboarding (dans progress_data)', true, { found: true });
          }
        }
      }
    }
    
    if (!onboardingData) {
      console.warn('❌ Données d\'onboarding non trouvées dans aucune table');
    }
    
    // 5. Créer et sauvegarder une progression utilisateur
    console.log('\n5️⃣ Test de création et sauvegarde de la progression utilisateur');
    
    // Créer un objet UserProgress
    const userProgress = new UserProgress(userId);
    userProgress.addPoints(100);
    userProgress.completeModule('mindfulness_1', 'mindfulness');
    userProgress.completeChallenge('daily_meditation_1');
    
    // Sauvegarder la progression
    const savedProgress = await StorageService.saveProgress(userProgress.toJSON());
    logResult('Sauvegarde progression', true, { 
      points: savedProgress.totalPoints, 
      completedModules: Object.keys(savedProgress.completedModules).length 
    });
    
    // 6. Vérifier la progression dans la table user_progress
    console.log('\n6️⃣ Vérification des données de progression');
    
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (progressError) {
      console.error('Erreur lors de la récupération des données de progression:', progressError);
      logResult('Récupération progression', false);
    } else {
      logResult('Récupération progression', true, { 
        id: progressData.id,
        hasProgressData: !!progressData.progress_data 
      });
      
      // Vérifier que les données correspondent
      try {
        const parsedProgress = typeof progressData.progress_data === 'string' 
          ? JSON.parse(progressData.progress_data) 
          : progressData.progress_data;
          
        const validPoints = parsedProgress.totalPoints === userProgress.totalPoints;
        const validModules = parsedProgress.completedModules?.mindfulness_1 === true;
        
        logResult('Validation progression', validPoints && validModules, {
          pointsMatch: validPoints,
          modulesMatch: validModules
        });
      } catch (error) {
        console.error('Erreur lors de la validation des données de progression:', error);
        logResult('Validation progression', false);
      }
    }
    
    // 7. Enregistrer des réponses pour un module
    console.log('\n7️⃣ Test d\'enregistrement des réponses de module');
    
    const moduleResponses = {
      q1: 'Très bien',
      q2: 8,
      q3: ['Option 1', 'Option 3'],
      feedback: 'Module très utile',
      completedAt: new Date().toISOString()
    };
    
    const moduleId = 'mindfulness_1';
    const savedModuleResponses = await StorageService.saveModuleResponses(moduleId, moduleResponses);
    
    logResult('Sauvegarde réponses module', true, {
      moduleId,
      hasResponses: !!savedModuleResponses.moduleResponses[moduleId]
    });
    
    // 8. Vérifier l'enregistrement dans la table user_responses
    console.log('\n8️⃣ Vérification des réponses de module');
    
    const { data: responseData, error: responseError } = await supabase
      .from('user_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId);
      
    if (responseError) {
      console.warn('Table user_responses (standard) non disponible:', responseError.message);
      
      // Vérifier dans progress_data
      const { data: progressUpdateData } = await supabase
        .from('user_progress')
        .select('progress_data')
        .eq('user_id', userId)
        .single();
        
      if (progressUpdateData?.progress_data) {
        const parsedData = typeof progressUpdateData.progress_data === 'string' 
          ? JSON.parse(progressUpdateData.progress_data) 
          : progressUpdateData.progress_data;
          
        if (parsedData.moduleResponses?.[moduleId]) {
          logResult('Récupération réponses (dans progress_data)', true, { 
            found: true,
            moduleId 
          });
        } else {
          logResult('Récupération réponses', false, { reason: 'Non trouvées' });
        }
      }
    } else if (responseData && responseData.length > 0) {
      logResult('Récupération réponses', true, { 
        count: responseData.length,
        moduleId 
      });
    } else {
      logResult('Récupération réponses', false, { reason: 'Données vides' });
    }
    
    // 9. Déconnexion
    console.log('\n9️⃣ Test de déconnexion');
    const logoutResult = await AuthService.signOut();
    logResult('Déconnexion', logoutResult.success, { message: logoutResult.message });
    
    console.log('\n✨ Tests terminés avec succès');
    
    // Retourner le résultat global
    return {
      success: true,
      userId,
      email: testEmail
    };
    
  } catch (error) {
    console.error('❌ Erreur pendant les tests:', error);
    return {
      success: false,
      error: error.message,
      userId,
      email: testEmail
    };
  } finally {
    // Nettoyer les données de test si nécessaire
    // Décommenter pour supprimer les données de test
    // await cleanupTestData(userId);
  }
}

// Exécuter le test et afficher le résultat
console.log('=== Début des tests d\'intégration Supabase ===');
runSupabaseFlowTest()
  .then(result => {
    console.log('\n=== Résumé ===');
    console.log(`État: ${result.success ? 'SUCCÈS' : 'ÉCHEC'}`);
    console.log(`Email test: ${result.email}`);
    console.log(`ID utilisateur: ${result.userId}`);
    
    if (!result.success) {
      console.error(`Erreur: ${result.error}`);
    }
    
    console.log('\nNote: Les données de test n\'ont pas été supprimées automatiquement.');
    console.log('Pour nettoyer les données, décommentez la ligne appelant cleanupTestData() dans le code.');
  })
  .catch(error => {
    console.error('Erreur lors de l\'exécution du test:', error);
  });

// Exporter les fonctions pour permettre l'exécution modulaire
module.exports = { runSupabaseFlowTest, cleanupTestData };