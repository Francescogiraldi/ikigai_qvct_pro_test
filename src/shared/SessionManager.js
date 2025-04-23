/**
 * Gestionnaire de sessions
 */
import SecureStorage from './SecureStorage';

class SessionManager {
  // Clés de stockage
  static SESSION_KEY = 'ikigai_session';
  static SESSION_EXPIRY_KEY = 'ikigai_session_expiry';
  
  // Durée de session par défaut (4 heures en millisecondes)
  static DEFAULT_SESSION_DURATION = 4 * 60 * 60 * 1000;
  
  // Créer une nouvelle session
  static createSession(userData, duration = this.DEFAULT_SESSION_DURATION) {
    // Nettoyer d'abord toute session existante
    this.clearSession();
    
    // Créer la nouvelle session
    const session = {
      user: userData,
      created: Date.now(),
    };
    
    // Calculer l'expiration
    const expiry = Date.now() + duration;
    
    // Stocker la session et l'expiration
    SecureStorage.setItem(this.SESSION_KEY, session);
    SecureStorage.setItem(this.SESSION_EXPIRY_KEY, expiry);
    
    return session;
  }
  
  // Vérifier si une session est valide
  static isSessionValid() {
    const expiry = SecureStorage.getItem(this.SESSION_EXPIRY_KEY);
    const session = SecureStorage.getItem(this.SESSION_KEY);
    
    if (!expiry || !session) return false;
    
    // Vérifier si la session a expiré
    return Date.now() < expiry;
  }
  
  // Obtenir les données de session
  static getSession() {
    if (!this.isSessionValid()) {
      this.clearSession();
      return null;
    }
    
    return SecureStorage.getItem(this.SESSION_KEY);
  }
  
  // Prolonger la session
  static extendSession(duration = this.DEFAULT_SESSION_DURATION) {
    if (!this.isSessionValid()) return false;
    
    const expiry = Date.now() + duration;
    SecureStorage.setItem(this.SESSION_EXPIRY_KEY, expiry);
    return true;
  }
  
  // Effacer la session
  static clearSession() {
    SecureStorage.removeItem(this.SESSION_KEY);
    SecureStorage.removeItem(this.SESSION_EXPIRY_KEY);
  }
}

export default SessionManager;