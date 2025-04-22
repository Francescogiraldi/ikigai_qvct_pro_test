import { createClient } from '@supabase/supabase-js';

// Configuration Supabase depuis les variables d'environnement
// Utilisation d'une fonction pour obtenir les clés de manière plus sécurisée
const getSupabaseConfig = () => {
  // Essayer d'abord de récupérer depuis les variables d'environnement
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  // Si les variables d'environnement ne sont pas définies, bloquer l'application
  if (!url || !key) {
    // Bloquer l'application si les variables sont manquantes
    throw new Error('Variables d\'environnement Supabase manquantes. L\'application ne peut pas fonctionner sans elles.');
  }
  
  return { supabaseUrl: url, supabaseAnonKey: key };
};

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

// Options de configuration supplémentaires pour éviter les problèmes d'erreurs vides
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    // Ajouter un gestionnaire global pour intercepter les erreurs
    headers: {},
    // Gestionnaire d'erreurs global
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        // Ajouter un timeout pour éviter les requêtes qui ne se terminent jamais
        signal: options.signal || (AbortSignal.timeout ? AbortSignal.timeout(30000) : undefined),
      })
      .catch(error => {
        console.error("Erreur de fetch Supabase:", error);
        // Retourner une erreur formatée
        if (error.name === 'AbortError') {
          throw new Error('La requête a pris trop de temps à s\'exécuter. Veuillez vérifier votre connexion internet.');
        }
        throw error;
      });
    }
  }
};

// Création du client Supabase avec les options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);

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