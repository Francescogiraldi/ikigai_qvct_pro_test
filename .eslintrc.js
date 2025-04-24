/* Fichier de configuration ESLint pour l'application IKIGAI */

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Désactiver temporairement les avertissements pour les variables non utilisées
    'no-unused-vars': ['warn', { 
      'vars': 'all', 
      'args': 'after-used',
      'ignoreRestSiblings': true,
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
    }],
    
    // Tolérer les console.log pendant le développement
    'no-console': 'off',
    
    // Règles React
    'react/prop-types': 'off', // Désactiver la vérification des prop-types pour simplifier
    'react/react-in-jsx-scope': 'off', // React est importé globalement
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Avertissements sur des pratiques risquées
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    
    // Meilleures pratiques
    'eqeqeq': ['warn', 'always'],
    'no-var': 'warn',
    'prefer-const': 'warn',
    
    // Afficher les erreurs mais pas bloquer le build
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  },
  // Ignorer certains fichiers
  ignorePatterns: ['build/**/*', 'node_modules/**/*', '*.test.js', '*.spec.js'],
  globals: {
    process: true,
  },
};
