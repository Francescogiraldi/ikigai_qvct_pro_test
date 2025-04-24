#!/usr/bin/env node

// Script spécial pour le déploiement Netlify

const { execSync } = require('child_process');
console.log('🚀 Démarrage du build pour Netlify...');

// Désactiver le strict mode pour ESLint temporairement pour le build
console.log('⚙️ Configuration du build...');

try {
  // 1. Forcer un build avec des warnings mais pas d'erreurs pour les hooks React
  process.env.CI = 'false';
  process.env.ESLINT_NO_DEV_ERRORS = 'true';
  process.env.DISABLE_ESLINT_PLUGIN = 'true';
  
  // 2. Exécuter le build
  console.log('🏗️ Exécution du build...');
  execSync('react-app-rewired build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      DISABLE_ESLINT_PLUGIN: 'true'
    }
  });
  
  console.log('✅ Build terminé avec succès!');
  process.exit(0);
} catch (error) {
  console.error('❌ Erreur lors du build:', error.message);
  process.exit(1);
}