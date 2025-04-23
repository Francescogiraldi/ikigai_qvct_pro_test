// Script pour vérifier les erreurs de lint dans le projet

const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Vérification des erreurs de lint dans le code source...');

try {
  // --quiet pour n'afficher que les erreurs, pas les warnings
  const result = execSync('npx eslint ./src --ext .js,.jsx --quiet', { encoding: 'utf8' });
  console.log('✅ Aucune erreur de lint détectée!');
  if (result) {
    console.log(result);
  }
} catch (error) {
  console.error('❌ Des erreurs de lint ont été détectées:');
  console.error(error.stdout);
  // Ne pas échouer à cause des warnings, seulement les erreurs
  const hasErrors = error.stdout && error.stdout.includes('error');
  process.exit(hasErrors ? 1 : 0);
}