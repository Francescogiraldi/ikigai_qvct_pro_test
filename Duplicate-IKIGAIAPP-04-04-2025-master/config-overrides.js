const webpack = require('webpack');
const path = require('path');

// Configuration personnalisée pour Jest
const jestConfig = (config) => {
  // Inclure les tests uniquement dans le dossier tests/
  config.testMatch = [
    '<rootDir>/tests/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ];
  // Optionnel: Définir la racine des tests pour éviter les conflits
  config.roots = ['<rootDir>/tests'];
  return config;
};

module.exports = function override(config, env) {
  // Ajouter les polyfills pour les modules Node.js dans un environnement navigateur
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "stream": require.resolve("stream-browserify"),
    "zlib": require.resolve("browserify-zlib"),
    "path": require.resolve("path-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "buffer": require.resolve("buffer/"),
    "crypto": require.resolve("crypto-browserify"),
    "https": require.resolve("https-browserify"),
    "http": require.resolve("stream-http"),
    "url": require.resolve("url/"),
    "vm": require.resolve("vm-browserify"),
    "util": require.resolve("util/"),
    "assert": false,
    "process": false,
    "fs": false,
    "net": false,
    "tls": false
  };

  // Ajouter des plugins pour fournir les variables globales nécessaires
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: require.resolve('process/browser'),
      Buffer: ['buffer', 'Buffer'],
    })
  ];
  
  // Ajouter une règle pour gérer les modules ESM
  if (env === 'production') {
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false
      }
    });
  }

  // Ajout d'alias pour résoudre l'erreur process/browser
  config.resolve.alias = {
    ...config.resolve.alias,
    'process/browser': require.resolve('process/browser'),
  };

  return config;
};

// Exporter la configuration Jest
module.exports.jest = jestConfig;