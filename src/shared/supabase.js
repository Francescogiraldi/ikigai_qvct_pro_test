import { createClient } from '@supabase/supabase-js';
import CSRFProtection from './CSRFProtection';

// Configuration Supabase depuis les variables d'environnement
const getSupabaseConfig = () => {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

  // Log sécurisé - sans exposer les valeurs
  console.log("DEBUG Supabase: Vérification de la configuration", {
    urlDefined: !!url,
    keyDefined: !!key,
    timestamp: new Date().toISOString()
  });

  // Si les variables d'environnement ne sont pas définies, bloquer l'application
  if (!url || !key) {
    // Erreur détaillée pour faciliter le débogage
    console.error("DEBUG Supabase: Variables d'environnement manquantes", {
      REACT_APP_SUPABASE_URL_defined: !!process.env.REACT_APP_SUPABASE_URL,
      REACT_APP_SUPABASE_ANON_KEY_defined: !!process.env.REACT_APP_SUPABASE_ANON_KEY,
      env_keys: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')).join(', ')
    });
    
    // Bloquer l'application si les variables sont manquantes
    throw new Error('Variables d\'environnement Supabase manquantes. L\'application ne peut pas fonctionner sans elles.');
  }

  console.log("DEBUG Supabase: Configuration réussie");
  return { supabaseUrl: url, supabaseAnonKey: key };
};

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

// Options de configuration avec prise en charge explicite des headers
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  storage: {
    // Ajouter ces options pour améliorer la gestion des redirections
    storageKey: 'supabase.auth.token', // S'assurer que la clé de stockage est explicite
  },
  global: {
    headers: {
      // Ajout explicite de l'API key comme header
      apikey: supabaseAnonKey
    },
   fetch: async (url, options = {}) => { 
     try { 
       // Vérifier si nous avons besoin d'un token d'authentification 
       const requiresAuth = url.includes('/auth/v1/') || 
                           url.includes('/rest/v1/') || 
                           url.includes('/storage/v1/'); 
       
       // CORRECTION: Éviter la boucle infinie en n'appelant pas getSession si la requête est déjà pour getSession
       if (requiresAuth && !url.includes('/auth/v1/token')) { 
         // Récupérer le token depuis localStorage ou sessionStorage directement pour éviter la boucle
         let accessToken = null;
         try {
           const storedSession = localStorage.getItem('supabase.auth.token');
           if (storedSession) {
             const parsedSession = JSON.parse(storedSession);
             accessToken = parsedSession?.currentSession?.access_token;
           }
         } catch (e) {
           console.warn("Erreur lors de la récupération du token:", e);
         }
         
         // Assurer que les headers sont initialisés 
         if (!options.headers) options.headers = {}; 
         
         // Ajouter les headers d'authentification si disponibles 
         if (accessToken) { 
           options.headers['Authorization'] = `Bearer ${accessToken}`; 
           console.log(`Requête authentifiée: ${url.split('/').pop()}`); 
         } else { 
           console.warn(`Requête sans token: ${url.split('/').pop()}`); 
         } 
         
         // Toujours inclure apikey dans les headers 
         options.headers['apikey'] = supabaseAnonKey; 
       } 
       
       // Définir un timeout plus court pour les requêtes (10s au lieu de 30s)
       const controller = new AbortController(); 
       const timeoutId = setTimeout(() => controller.abort(), 10000); 
       
       const response = await fetch(url, { 
         ...options, 
         signal: controller.signal 
       }); 
       
       clearTimeout(timeoutId); 
       return response; 
     } catch (error) { 
       console.error(`Erreur fetch: ${error.message}`); 
       throw error; 
     } 
   }
  }
};

// Création du client Supabase avec les options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);

// Ajouter ceci après l'initialisation du client Supabase
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Événement d\'authentification:', event);

  if (event === 'SIGNED_IN' && session) {
    // Force le token JWT à être correctement enregistré et formaté
    const { access_token, refresh_token } = session;

    // Log sécurisé - confirme la présence du token sans l'afficher
    console.log('Token JWT obtenu:', access_token ? 'Présent' : 'Absent');

    // IMPORTANT - déclencher un événement pour signaler la connexion
    try {
      const authEvent = new CustomEvent('supabase:auth:signIn', {
        detail: { success: true, timestamp: new Date().toISOString() }
      });
      window.dispatchEvent(authEvent);
      console.log("Événement de connexion dispatché");
    } catch (e) {
      console.error("Erreur lors du dispatch de l'événement de connexion:", e);
    }

    // SOLUTION DE SECOURS: Forcer un état dans localStorage
    try {
      localStorage.setItem('ikigai_lastSignIn', new Date().toISOString());
      // Forcer également une variable globale qui sera détectable même en cas de problème de localStorage
      window.IKIGAI_AUTH_STATE = {
        signedIn: true,
        timestamp: new Date().toISOString()
      };
    } catch (storageError) {
      console.warn("Erreur lors de la sauvegarde de l'état d'authentification:", storageError);
    }
  }
});

// Fonction pour préparer les en-têtes avec protection CSRF
export const prepareCSRFHeaders = (headers = {}) => {
  return CSRFProtection.prepareHeaders(headers);
};

// Fonction utilitaire pour traiter les erreurs Supabase
export const handleSupabaseError = (error) => {
  // Éviter d'afficher directement l'objet d'erreur qui pourrait contenir des caractères JSON non formatés
  console.error("Traitement d'erreur Supabase:", typeof error === 'object' ? JSON.stringify(error) : error);
  
  // Cas 1: Si l'erreur est undefined ou null
  if (!error) {
    return "Une erreur s'est produite. Veuillez réessayer.";
  }
  
  // Cas 2: Si l'erreur est un objet vide, retourner un message explicite
  if (typeof error === 'object' && (Object.keys(error).length === 0 || JSON.stringify(error) === '{}' || error.toString() === '[object Object]')) {
    console.warn("Objet d'erreur vide détecté", error);
    return "Le service d'authentification est temporairement indisponible. Veuillez réessayer plus tard.";
  }
  
  // Cas 3: Si l'erreur est un objet avec un code spécifique de Supabase
  if (error.code) {
    switch (error.code) {
      case 'auth/invalid-email':
        return "Format d'email invalide.";
      case 'auth/user-not-found':
        return "Identifiants incorrects.";
      case 'auth/wrong-password':
        return "Identifiants incorrects.";
      case 'auth/email-already-in-use':
        return "Cette adresse email est déjà utilisée.";
      case 'auth/weak-password':
        return "Le mot de passe doit contenir au moins 8 caractères avec au moins une majuscule, une minuscule, un chiffre et un caractère spécial.";
      case 'auth/invalid-login-credentials':
        return "Identifiants incorrects. Vérifiez votre email et mot de passe.";
      case '23505': // Postgres unique violation
        return "Cet utilisateur existe déjà.";
      default:
        // Pour les autres codes, utiliser le message s'il est disponible
        return error.message || `Erreur (${error.code}): Veuillez réessayer.`;
    }
  }
  
  // Cas 4: Si l'erreur a un message, l'utiliser
  if (error.message) {
    return error.message;
  }
  
  // Cas 5: Si l'erreur est une chaîne, l'utiliser directement
  if (typeof error === 'string') {
    return error;
  }
  
  // Cas 6: Dernier recours, si l'erreur est d'un format non reconnu, ne pas afficher d'objets
  if (typeof error === 'object') {
    return "Une erreur s'est produite. Veuillez réessayer.";
  }
  
  // Message par défaut pour tout autre cas
  return "Une erreur s'est produite. Veuillez réessayer.";
};