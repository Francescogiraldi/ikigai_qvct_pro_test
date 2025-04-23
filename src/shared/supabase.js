import { createClient } from '@supabase/supabase-js';
import CSRFProtection from './CSRFProtection';

// Configuration Supabase depuis les variables d'environnement
const getSupabaseConfig = () => {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

  // Log sécurisé - sans exposer les valeurs
  console.log("Configuration Supabase: URL et clé " + 
    (url && key ? "définies" : "manquantes"));

  // Si les variables d'environnement ne sont pas définies, bloquer l'application
  if (!url || !key) {
    // Bloquer l'application si les variables sont manquantes
    throw new Error('Variables d\'environnement Supabase manquantes. L\'application ne peut pas fonctionner sans elles.');
  }

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
       
       if (requiresAuth) { 
         // Récupérer la session active 
         const { data } = await supabase.auth.getSession(); 
         const session = data?.session; 
         
         // Assurer que les headers sont initialisés 
         if (!options.headers) options.headers = {}; 
         
         // Ajouter les headers d'authentification si disponibles 
         if (session?.access_token) { 
           options.headers['Authorization'] = `Bearer ${session.access_token}`; 
           console.log(`Requête authentifiée: ${url.split('/').pop()}`); 
         } else { 
           console.warn(`Requête sans token: ${url.split('/').pop()}`); 
         } 
         
         // Toujours inclure apikey dans les headers 
         options.headers['apikey'] = supabaseAnonKey; 
       } 
       
       // Définir un timeout raisonnable pour les requêtes 
       const controller = new AbortController(); 
       const timeoutId = setTimeout(() => controller.abort(), 30000); 
       
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

    // Force manuellement la mise à jour de la session
    if (access_token) {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token,
        refresh_token,
        expires_at: session.expires_at
      }));
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