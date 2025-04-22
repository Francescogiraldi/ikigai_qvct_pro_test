import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Polyfills pour le client Gradio
window.global = window;
// Préserver les variables d'environnement existantes
window.process = window.process || {};
window.process.env = window.process.env || process.env || {};
global.process = global.process || {};
global.process.env = global.process.env || process.env || {};

// Polyfill Buffer amélioré pour éviter les erreurs de sauvegarde
if (typeof window !== 'undefined') {
  // Vérifier si Buffer existe déjà globalement
  if (!window.Buffer) {
    try {
      // Créer un polyfill minimal de Buffer pour les fonctionnalités essentielles
      window.Buffer = {
        from: (data, encoding) => {
          if (typeof data === 'string') {
            const encoder = new TextEncoder();
            return encoder.encode(data);
          }
          return new Uint8Array(data);
        },
        isBuffer: (obj) => false,
        alloc: (size) => new Uint8Array(size)
      };
      global.Buffer = window.Buffer;
      console.log('Polyfill Buffer initialisé avec succès');
    } catch (e) {
      console.warn('Erreur lors de l\'initialisation du polyfill Buffer:', e);
    }
  }
}

// Correction du polyfill Buffer pour éviter les erreurs dans les navigateurs modernes
try {
  // Importer le module buffer de manière compatible avec les navigateurs
  if (typeof window !== 'undefined') {
    // Vérifier si Buffer existe déjà
    if (!global.Buffer) {
      // Utiliser une approche plus sûre pour importer Buffer
      import('buffer').then(({ Buffer }) => {
        global.Buffer = Buffer;
      }).catch(err => {
        console.warn('Impossible de charger le module buffer:', err);
        // Fournir un Buffer minimal pour éviter les erreurs
        global.Buffer = global.Buffer || { isBuffer: () => false };
      });
    }
  }
} catch (e) {
  console.warn('Erreur lors de l\'initialisation de Buffer:', e);
  // Fallback en cas d'erreur
  global.Buffer = global.Buffer || { isBuffer: () => false };
}

// Enregistrement du service worker pour la PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker enregistré avec succès:', registration.scope);
      })
      .catch(error => {
        console.log('Échec de l\'enregistrement du Service Worker:', error);
      });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Mesure des performances pour le reporting
reportWebVitals();