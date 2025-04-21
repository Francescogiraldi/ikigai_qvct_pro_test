// Script Node.js pour tester l'intégration Supabase
// Exécuter avec: node ./tests/run-supabase-tests.js

const { runSupabaseFlowTest, cleanupTestData } = require('./integration/supabase-flow-test');

// Configuration des options de test
const options = {
  cleanup: false, // Mettre à true pour nettoyer les données après le test
  verbose: true  // Afficher les détails de chaque étape
};

// Exécuter le test
console.log('=== Démarrage des tests d\'intégration Supabase ===');
runSupabaseFlowTest(options)
  .then(result => {
    console.log('=== Résultats des tests ===');
    console.log(`Statut: ${result.success ? 'SUCCÈS' : 'ÉCHEC'}`);
    console.log(`Email utilisé: ${result.email}`);
    console.log(`ID utilisateur: ${result.userId}`);
    
    if (options.cleanup && result.userId) {
      console.log('Nettoyage des données de test...');
      return cleanupTestData(result.userId).then(() => result);
    }
    return result;
  })
  .then(result => {
    if (!result.success) {
      console.error('Erreur:', result.error);
      process.exit(1);
    }
    console.log('Tests terminés avec succès');
  })
  .catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
