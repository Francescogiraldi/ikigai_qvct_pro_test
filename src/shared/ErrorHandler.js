/**
 * Gestionnaire d'erreurs centralisé
 */
import Logger from './Logger';

class ErrorHandler {
  // Cartographie des codes d'erreur vers des messages utilisateur
  static errorMessages = {
    // Erreurs d'authentification
    'auth/invalid-email': "Format d'email invalide.",
    'auth/user-not-found': "Identifiants incorrects.",
    'auth/wrong-password': "Identifiants incorrects.",
    'auth/email-already-in-use': "Cette adresse email est déjà utilisée.",
    'auth/weak-password': "Le mot de passe est trop faible.",
    'auth/invalid-login-credentials': "Identifiants incorrects.",
    '23505': "Cet utilisateur existe déjà.",
    
    // Erreurs API
    'network-error': "Problème de connexion au serveur. Vérifiez votre connexion internet.",
    'timeout': "La requête a pris trop de temps. Veuillez réessayer.",
    
    // Erreurs génériques
    'default': "Une erreur s'est produite. Veuillez réessayer."
  };
  
  // Traiter une erreur et obtenir un message approprié
  static getErrorMessage(error) {
    // Si l'erreur a un code spécifique
    if (error.code && this.errorMessages[error.code]) {
      return this.errorMessages[error.code];
    }
    
    // Si l'erreur est une chaîne simple, la retourner
    if (typeof error === 'string') {
      return error;
    }
    
    // Si l'erreur a un message
    if (error.message) {
      return error.message;
    }
    
    // Message par défaut
    return this.errorMessages.default;
  }
  
  // Gérer une erreur de manière centralisée
  static handle(error, context = '') {
    // Logger l'erreur complète (uniquement visible en développement)
    Logger.error(`Erreur dans ${context}:`, error);
    
    // Retourner un objet d'erreur standardisé
    return {
      success: false,
      message: this.getErrorMessage(error),
      // N'inclure le code d'erreur qu'en développement
      ...(process.env.NODE_ENV !== 'production' && error.code ? { code: error.code } : {})
    };
  }
}

export default ErrorHandler;