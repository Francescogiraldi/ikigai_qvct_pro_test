// Script pour explorer le schéma de la base de données Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mgegwthaogszzgflwery.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZWd3dGhhb2dzenpnZmx3ZXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMjUyMjIsImV4cCI6MjA1OTcwMTIyMn0.ojqRmmC1O4sFTJDydtdSQ15J5ywMyCNBAkMYAkqYQxM';

// Création du client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function exploreSchema() {
  console.log('🔍 Exploration du schéma de la base de données Supabase...');
  
  try {
    // Liste des tables à explorer
    const tables = [
      'user_progress',
      'user_responses',
      'onboarding_responses',
      'user_sessions',
      'profiles'
    ];
    
    console.log('\n📋 Exploration des tables...');
    
    for (const table of tables) {
      console.log(`\n🔹 Table: ${table}`);
      
      try {
        // Tenter de récupérer un enregistrement pour comprendre la structure
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`  ❌ Erreur lors de l'accès à la table: ${error.message}`);
          continue;
        }
        
        if (data && data.length > 0) {
          console.log('  ✅ Structure détectée:');
          const columns = Object.keys(data[0]);
          columns.forEach(col => {
            console.log(`    - ${col}: ${typeof data[0][col]}`);
          });
        } else {
          console.log('  ℹ️ Table vide, tentative de déduction de structure depuis les métadonnées...');
          
          // Si la table est vide, insérer un enregistrement test puis le supprimer
          // pour voir les contraintes
          try {
            const { error: testError } = await supabase
              .from(table)
              .insert([{}]);
              
            if (testError) {
              console.log(`  🧩 Erreur révélant des contraintes: ${testError.message}`);
              
              // Analyser l'erreur pour deviner la structure
              const nullConstraintMatch = testError.message.match(/null value in column "([^"]+)"/);
              if (nullConstraintMatch) {
                console.log(`    - ${nullConstraintMatch[1]}: NOT NULL (obligatoire)`);
              }
            }
          } catch (testErr) {
            console.log(`  ❓ Impossible de tester la structure: ${testErr.message}`);
          }
        }
      } catch (tableErr) {
        console.log(`  ❌ Erreur lors de l'exploration: ${tableErr.message}`);
      }
    }
    
    console.log('\n🎯 Exploration terminée!');
    
  } catch (error) {
    console.error('\n❌ Erreur globale:', error.message);
  }
}

// Exécuter l'exploration
exploreSchema();