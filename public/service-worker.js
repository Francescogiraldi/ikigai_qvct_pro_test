// Donnez un nom à votre cache - idéalement incluez une version
const CACHE_NAME = 'ikigai-assistant-v1';

// Liste des ressources à mettre en cache immédiatement
const RESOURCES_TO_CACHE = [
  '/', // Page d'accueil
  '/index.html',
  '/index.css',
  '/offline.html',
  '/styles/main.css',
  '/App.css',
  '/scripts/main.js',
  '/manifest.json',
  '/images/logo.png',
  // Ajoutez ici toutes vos ressources essentielles
  // CSS, JavaScript, images, polices, etc.
];

// Installation du service worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installation en cours');

   // Combiner les opérations dans un seul waitUntil
   event.waitUntil(
    Promise.all([
      self.skipWaiting(),
      caches.open(CACHE_NAME).then(cache => {
        console.log('Service Worker: Mise en cache des ressources essentielles');
        return cache.addAll(RESOURCES_TO_CACHE);
      })
    ])
  );
}); // Correction: Suppression de la parenthèse supplémentaire

// Activation du service worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activation en cours');
  
  // Nettoyer les anciens caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Suppression de l\'ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Prendre le contrôle de toutes les pages client non contrôlées
  return self.clients.claim();
});

// Interception des requêtes réseau
self.addEventListener('fetch', event => {
    // Ne pas intercepter les requêtes pour le chrome-extension:// protocol
    if (event.request.url.startsWith('chrome-extension://')) {
      return;
    }
    
    event.respondWith(
      // Stratégie "Cache First, puis réseau"
      caches.match(event.request)
        .then(cachedResponse => {
          // Retourner la ressource du cache si elle existe
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Sinon, aller chercher sur le réseau
          return fetch(event.request)
            .then(networkResponse => {
              // Si la réponse est valide, la mettre en cache pour plus tard
              if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                const responseToCache = networkResponse.clone();
                
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              
              return networkResponse;
            })
            .catch(error => {
              // Vérifier si la requête concerne une page HTML
              if (event.request.mode === 'navigate') {
                // Retourner la page offline.html si disponible
                return caches.match('/offline.html');
              }
              
              // Pour les autres types de ressources non disponibles, retourner une erreur
              return new Response('Contenu non disponible hors ligne', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            });
        })
    );
});

// Gestion des notifications push (optionnel)
self.addEventListener('push', event => {
  console.log('Service Worker: Réception d\'une notification push');
  
  const title = 'IKIGAI - Votre assistant';
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification de IKIGAI',
    icon: '/images/logo.png',
    badge: '/images/badge.png'
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});