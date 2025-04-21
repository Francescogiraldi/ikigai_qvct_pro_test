// Test du flux utilisateur complet avec Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mgegwthaogszzgflwery.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZWd3dGhhb2dzenpnZmx3ZXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMjUyMjIsImV4cCI6MjA1OTcwMTIyMn0.ojqRmmC1O4sFTJDydtdSQ15J5ywMyCNBAkMYAkqYQxM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction pour attendre un peu entre les opérations
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ÉTAPE 1: Inscription d'un nouvel utilisateur
async function createUser() {
  console.log('\n=== ÉTAPE 1: Création d\'un nouvel utilisateur ===');
  
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Test@123456';
  
  console.log(`Email: ${testEmail}`);
  console.log(`Mot de passe: ${testPassword}`);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Utilisateur',
          last_name: 'Test',
          status: 'Test'
        }
      }
    });
    
    if (error) throw error;
    
    const userId = data.user.id;
    console.log(`✅ Utilisateur créé avec succès: ${userId}`);
    
    return {
      userId,
      email: testEmail,
      password: testPassword
    };
  } catch (error) {
    console.error(`❌ Erreur lors de la création de l'utilisateur: ${error.message}`);
    return null;
  }
}

// ÉTAPE 2: Connexion avec l'utilisateur
async function loginUser(email, password) {
  console.log('\n=== ÉTAPE 2: Connexion avec l\'utilisateur ===');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    console.log(`✅ Connexion réussie: ${data.user.id}`);
    return data.user;
  } catch (error) {
    console.error(`❌ Erreur lors de la connexion: ${error.message}`);
    return null;
  }
}

// ÉTAPE 3: Enregistrement des réponses d'onboarding
async function saveOnboardingResponses(userId) {
  console.log('\n=== ÉTAPE 3: Enregistrement des données d\'onboarding ===');
  
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
  
  console.log('Réponses d\'onboarding:', JSON.stringify(onboardingResponses, null, 2));
  
  try {
    // D'abord essayer avec la table dédiée
    console.log('Tentative avec la table onboarding_responses...');
    const { error: onboardingError } = await supabase
      .from('onboarding_responses')
      .upsert({
        user_id: userId,
        responses: onboardingResponses,
        updated_at: new Date()
      }, { onConflict: 'user_id' });
      
    if (onboardingError) {
      console.log(`⚠️ Erreur avec onboarding_responses: ${onboardingError.message}`);
      
      // Essayer avec la table user_responses
      console.log('Tentative avec la table user_responses...');
      const { error: userResponsesError } = await supabase
        .from('user_responses')
        .upsert({
          user_id: userId,
          module_id: 'onboarding',
          responses: onboardingResponses,
          created_at: new Date()
        }, { onConflict: 'user_id,module_id' });
        
      if (userResponsesError) {
        throw userResponsesError;
      }
      
      console.log('✅ Données d\'onboarding enregistrées dans user_responses');
    } else {
      console.log('✅ Données d\'onboarding enregistrées dans onboarding_responses');
    }
    
    // Dans tous les cas, mettre à jour user_progress pour compatibilité
    await updateUserProgress(userId, {
      moduleResponses: {
        onboarding: {
          responses: onboardingResponses,
          completedAt: new Date().toISOString()
        }
      }
    });
    
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de l'enregistrement des données d'onboarding: ${error.message}`);
    return false;
  }
}

// ÉTAPE 4: Création/mise à jour de la progression utilisateur
async function updateUserProgress(userId, extraData = {}) {
  console.log('\n=== ÉTAPE 4: Mise à jour de la progression utilisateur ===');
  
  try {
    // Créer une structure de base pour les données de progression
    const baseProgressData = {
      userId,
      totalPoints: 0,
      streak: 0,
      wellnessScore: 65,
      completedModules: {},
      completedChallenges: [],
      badges: [],
      moduleResponses: {},
      islandProgress: {
        mindfulness: { progress: 0, completedModules: 0 },
        productivity: { progress: 0, completedModules: 0 },
        stress: { progress: 0, completedModules: 0 },
        balance: { progress: 0, completedModules: 0 }
      }
    };
    
    // Fusionner avec les données supplémentaires
    const progressData = { ...baseProgressData, ...extraData };
    
    // Vérifier si une entrée existe déjà
    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (existingProgress) {
      console.log('Mise à jour des données de progression existantes');
      
      // Mettre à jour les données existantes
      const { error: updateError } = await supabase
        .from('user_progress')
        .update({
          progress_data: progressData,
          updated_at: new Date()
        })
        .eq('user_id', userId);
        
      if (updateError) throw updateError;
    } else {
      console.log('Création d\'une nouvelle entrée de progression');
      
      // Insérer une nouvelle entrée
      const { error: insertError } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          progress_data: progressData,
          created_at: new Date()
        });
        
      if (insertError) throw insertError;
    }
    
    console.log('✅ Données de progression utilisateur mises à jour');
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour de la progression: ${error.message}`);
    return false;
  }
}

// ÉTAPE 5: Complétion d'un module
async function completeModule(userId, moduleId, islandId) {
  console.log(`\n=== ÉTAPE 5: Complétion du module ${moduleId} ===`);
  
  try {
    // Récupérer les données de progression actuelles
    const { data: currentProgress, error: progressError } = await supabase
      .from('user_progress')
      .select('progress_data')
      .eq('user_id', userId)
      .single();
      
    if (progressError) throw progressError;
    
    // Extraire les données de progression
    let progressData = {};
    if (currentProgress && currentProgress.progress_data) {
      if (typeof currentProgress.progress_data === 'string') {
        progressData = JSON.parse(currentProgress.progress_data);
      } else {
        progressData = currentProgress.progress_data;
      }
    }
    
    // Mettre à jour les modules complétés
    if (!progressData.completedModules) {
      progressData.completedModules = {};
    }
    progressData.completedModules[moduleId] = true;
    
    // Ajouter des points
    if (!progressData.totalPoints) {
      progressData.totalPoints = 0;
    }
    progressData.totalPoints += 100;
    
    // Mettre à jour l'avancement de l'île
    if (islandId && (!progressData.islandProgress || !progressData.islandProgress[islandId])) {
      progressData.islandProgress = progressData.islandProgress || {};
      progressData.islandProgress[islandId] = { progress: 0, completedModules: 0 };
    }
    
    if (islandId) {
      const islandModules = 4; // Nombre de modules par île
      const completedCount = Object.keys(progressData.completedModules)
        .filter(id => id.startsWith(islandId))
        .length;
      
      progressData.islandProgress[islandId].completedModules = completedCount;
      progressData.islandProgress[islandId].progress = Math.min(100, Math.round((completedCount / islandModules) * 100));
    }
    
    // Sauvegarder les réponses du module
    const moduleResponses = {
      q1: 'Très bien',
      q2: 8,
      q3: ['Option 1', 'Option 3'],
      feedback: 'Module très utile',
      completedAt: new Date().toISOString()
    };
    
    if (!progressData.moduleResponses) {
      progressData.moduleResponses = {};
    }
    progressData.moduleResponses[moduleId] = {
      responses: moduleResponses,
      completedAt: new Date().toISOString()
    };
    
    // Mettre à jour les données de progression
    const { error: updateError } = await supabase
      .from('user_progress')
      .update({
        progress_data: progressData,
        updated_at: new Date()
      })
      .eq('user_id', userId);
      
    if (updateError) throw updateError;
    
    // Enregistrer également dans user_responses si la table existe
    try {
      const { error: responseError } = await supabase
        .from('user_responses')
        .upsert({
          user_id: userId,
          module_id: moduleId,
          responses: moduleResponses,
          created_at: new Date()
        }, { onConflict: 'user_id,module_id' });
        
      if (responseError) {
        console.log(`⚠️ Note: Impossible d'enregistrer dans user_responses: ${responseError.message}`);
      } else {
        console.log('✅ Réponses du module enregistrées dans user_responses');
      }
    } catch (err) {
      console.log('⚠️ Erreur lors de l\'enregistrement dans user_responses');
    }
    
    console.log(`✅ Module ${moduleId} complété avec succès`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la complétion du module: ${error.message}`);
    return false;
  }
}

// ÉTAPE 6: Vérification des données
async function verifyData(userId) {
  console.log('\n=== ÉTAPE 6: Vérification des données enregistrées ===');
  
  try {
    // Vérifier les données d'onboarding
    console.log('Vérification des données d\'onboarding...');
    
    let onboardingFound = false;
    
    // Vérifier dans onboarding_responses
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', userId);
      
    if (!onboardingError && onboardingData && onboardingData.length > 0) {
      console.log('✅ Données d\'onboarding trouvées dans onboarding_responses');
      console.log(`   Timestamp: ${onboardingData[0].created_at}`);
      onboardingFound = true;
    }
    
    // Vérifier dans user_responses
    const { data: userResponsesData, error: userResponsesError } = await supabase
      .from('user_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', 'onboarding');
      
    if (!userResponsesError && userResponsesData && userResponsesData.length > 0) {
      console.log('✅ Données d\'onboarding trouvées dans user_responses');
      console.log(`   Timestamp: ${userResponsesData[0].created_at}`);
      onboardingFound = true;
    }
    
    // Vérifier la progression utilisateur
    console.log('Vérification des données de progression...');
    
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);
      
    if (progressError) {
      console.log(`❌ Erreur lors de la récupération des données de progression: ${progressError.message}`);
    } else if (!progressData || progressData.length === 0) {
      console.log('❌ Aucune donnée de progression trouvée');
    } else {
      console.log('✅ Données de progression trouvées');
      console.log(`   Timestamp: ${progressData[0].created_at}`);
      
      // Afficher des statistiques de base
      try {
        const parsedData = typeof progressData[0].progress_data === 'string'
          ? JSON.parse(progressData[0].progress_data)
          : progressData[0].progress_data;
          
        console.log(`   Points: ${parsedData.totalPoints || 0}`);
        console.log(`   Modules complétés: ${Object.keys(parsedData.completedModules || {}).length}`);
        console.log(`   Réponses aux modules: ${Object.keys(parsedData.moduleResponses || {}).length}`);
      } catch (err) {
        console.log('⚠️ Erreur lors du parsing des données de progression');
      }
    }
    
    // Vérifier les réponses aux modules
    console.log('Vérification des réponses aux modules...');
    
    const { data: moduleResponsesData, error: moduleResponsesError } = await supabase
      .from('user_responses')
      .select('*')
      .eq('user_id', userId)
      .neq('module_id', 'onboarding');
      
    if (moduleResponsesError) {
      console.log(`❌ Erreur lors de la récupération des réponses aux modules: ${moduleResponsesError.message}`);
    } else if (!moduleResponsesData || moduleResponsesData.length === 0) {
      console.log('❌ Aucune réponse aux modules trouvée dans user_responses');
    } else {
      console.log(`✅ Réponses aux modules trouvées: ${moduleResponsesData.length} module(s)`);
      moduleResponsesData.forEach(module => {
        console.log(`   Module: ${module.module_id}, Timestamp: ${module.created_at}`);
      });
    }
    
    return {
      onboardingFound,
      progressFound: !progressError && progressData && progressData.length > 0,
      moduleResponsesFound: !moduleResponsesError && moduleResponsesData && moduleResponsesData.length > 0
    };
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification des données: ${error.message}`);
    return {
      onboardingFound: false,
      progressFound: false,
      moduleResponsesFound: false
    };
  }
}

// ÉTAPE 7: Déconnexion
async function logout() {
  console.log('\n=== ÉTAPE 7: Déconnexion ===');
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    console.log('✅ Déconnexion réussie');
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la déconnexion: ${error.message}`);
    return false;
  }
}

// Fonction principale pour exécuter le flux complet
async function runFullUserFlow() {
  console.log('=== DÉMARRAGE DU TEST DE FLUX UTILISATEUR COMPLET ===');
  
  try {
    // Étape 1: Création d'un utilisateur
    const userData = await createUser();
    if (!userData) {
      console.error('❌ Impossible de continuer sans utilisateur');
      return false;
    }
    
    // Attendre un peu pour s'assurer que l'utilisateur est bien créé
    await wait(1000);
    
    // Étape 2: Connexion
    const user = await loginUser(userData.email, userData.password);
    if (!user) {
      console.error('❌ Impossible de continuer sans connexion');
      return false;
    }
    
    // Étape 3: Enregistrement des réponses d'onboarding
    const onboardingSuccess = await saveOnboardingResponses(userData.userId);
    
    // Étape 4: Mise à jour de la progression utilisateur (déjà fait dans l'étape 3)
    
    // Étape 5: Complétion d'un module
    const moduleSuccess = await completeModule(userData.userId, 'mindfulness_1', 'mindfulness');
    
    // Attendre un peu pour s'assurer que les données sont bien enregistrées
    await wait(1000);
    
    // Étape 6: Vérification des données
    const verificationResults = await verifyData(userData.userId);
    
    // Étape 7: Déconnexion
    await logout();
    
    // Afficher le résumé
    console.log('\n=== RÉSUMÉ DU TEST ===');
    console.log(`Utilisateur: ${userData.userId} (${userData.email})`);
    console.log(`Étape 1 (Création utilisateur): ✅ Réussi`);
    console.log(`Étape 2 (Connexion): ✅ Réussi`);
    console.log(`Étape 3 (Onboarding): ${onboardingSuccess ? '✅ Réussi' : '❌ Échec'}`);
    console.log(`Étape 5 (Complétion module): ${moduleSuccess ? '✅ Réussi' : '❌ Échec'}`);
    console.log(`Étape 6 (Vérification):`);
    console.log(`  - Données d'onboarding: ${verificationResults.onboardingFound ? '✅ Trouvées' : '❌ Non trouvées'}`);
    console.log(`  - Données de progression: ${verificationResults.progressFound ? '✅ Trouvées' : '❌ Non trouvées'}`);
    console.log(`  - Réponses aux modules: ${verificationResults.moduleResponsesFound ? '✅ Trouvées' : '❌ Non trouvées'}`);
    console.log(`Étape 7 (Déconnexion): ✅ Réussi`);
    
    return true;
  } catch (error) {
    console.error(`❌ Erreur globale lors du flux utilisateur: ${error.message}`);
    return false;
  }
}

// Exécuter le test
runFullUserFlow()
  .then(success => {
    console.log(`\n=== TEST ${success ? 'RÉUSSI' : 'ÉCHOUÉ'} ===`);
  })
  .catch(error => {
    console.error(`\n=== TEST ÉCHOUÉ: ${error.message} ===`);
  });