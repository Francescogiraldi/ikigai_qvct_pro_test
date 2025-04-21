// Script simplifié pour tester l'intégration Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mgegwthaogszzgflwery.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZWd3dGhhb2dzenpnZmx3ZXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMjUyMjIsImV4cCI6MjA1OTcwMTIyMn0.ojqRmmC1O4sFTJDydtdSQ15J5ywMyCNBAkMYAkqYQxM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test des tables Supabase
async function testTables() {
  console.log('\n=== Test des tables Supabase ===');
  const tables = ['user_progress', 'onboarding_responses', 'user_responses', 'user_recommendations'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table} disponible`);
      }
    } catch (err) {
      console.log(`❌ Table ${table}: ${err.message}`);
    }
  }
}

// Test d'authentification
async function testAuthentication() {
  console.log('\n=== Test d\'authentification Supabase ===');
  
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Test@123456';
  
  console.log(`Création d'un utilisateur test: ${testEmail}`);
  
  try {
    // Inscription
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError) {
      throw signUpError;
    }
    
    const userId = signUpData.user.id;
    console.log(`✅ Inscription réussie: ${userId}`);
    
    // Connexion
    console.log('Tentative de connexion...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      throw signInError;
    }
    
    console.log(`✅ Connexion réussie: ${signInData.user.id}`);
    
    // Déconnexion
    console.log('Déconnexion...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      throw signOutError;
    }
    
    console.log('✅ Déconnexion réussie');
    
    return userId;
  } catch (error) {
    console.error(`❌ Test d'authentification échoué: ${error.message}`);
    return null;
  }
}

// Test d'insertion de données
async function testDataInsertion(userId) {
  console.log('\n=== Test d\'insertion de données ===');
  
  if (!userId) {
    console.log('❌ Pas d\'ID utilisateur fourni, test d\'authentification requis d\'abord');
    return;
  }
  
  try {
    // Se reconnecter avec l'utilisateur
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'Test@123456';
    
    // D'abord créer un nouvel utilisateur pour le test d'insertion
    console.log('Création d\'un nouvel utilisateur pour le test d\'insertion...');
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (userError) {
      console.log(`❌ Erreur création utilisateur: ${userError.message}`);
      return;
    }
    
    userId = userData.user.id;
    console.log(`✅ Nouvel utilisateur créé: ${userId}`);
    
    // Tester l'insertion dans onboarding_responses
    console.log('Test d\'insertion dans onboarding_responses...');
    const onboardingData = {
      q1: 'Test réponse 1',
      q2: ['Option A', 'Option B'],
      q3: 7,
      completedAt: new Date().toISOString()
    };
    
    try {
      const { error: onboardingError } = await supabase
        .from('onboarding_responses')
        .insert({
          user_id: userId,
          responses: onboardingData,
          created_at: new Date()
        });
      
      if (onboardingError) {
        console.log(`❌ Erreur insertion onboarding_responses: ${onboardingError.message}`);
        
        // Essayer avec user_responses si onboarding_responses échoue
        console.log('Tentative avec user_responses...');
        const { error: userResponsesError } = await supabase
          .from('user_responses')
          .insert({
            user_id: userId,
            module_id: 'onboarding',
            responses: onboardingData,
            created_at: new Date()
          });
        
        if (userResponsesError) {
          console.log(`❌ Erreur insertion user_responses: ${userResponsesError.message}`);
        } else {
          console.log('✅ Données d\'onboarding enregistrées dans user_responses');
        }
      } else {
        console.log('✅ Données d\'onboarding enregistrées dans onboarding_responses');
      }
    } catch (err) {
      console.log(`❌ Erreur lors de l'insertion d'onboarding: ${err.message}`);
    }
    
    // Tester l'insertion dans user_progress
    console.log('Test d\'insertion dans user_progress...');
    try {
      const progressData = {
        userId: userId,
        totalPoints: 100,
        streak: 1,
        completedModules: {
          'module1': true
        },
        completedAt: new Date().toISOString()
      };
      
      const { error: progressError } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          progress_data: progressData,
          created_at: new Date()
        });
      
      if (progressError) {
        console.log(`❌ Erreur insertion user_progress: ${progressError.message}`);
      } else {
        console.log('✅ Données de progression enregistrées dans user_progress');
      }
    } catch (err) {
      console.log(`❌ Erreur lors de l'insertion de progression: ${err.message}`);
    }
  } catch (error) {
    console.error(`❌ Test global d'insertion échoué: ${error.message}`);
  }
}

// Fonction principale
async function runTests() {
  try {
    console.log('Démarrage des tests Supabase');
    
    // Tester les tables
    await testTables();
    
    // Tester l'authentification
    const userId = await testAuthentication();
    
    // Tester l'insertion de données si l'authentification a réussi
    if (userId) {
      await testDataInsertion(userId);
    }
    
    console.log('\n=== Tests terminés ===');
  } catch (error) {
    console.error(`Erreur globale: ${error.message}`);
  }
}

// Exécuter les tests
runTests();