/**
 * Gestionnaire de sessions centralisé pour IKIGAI
 * 
 * Ce module gère les sessions utilisateur de manière sécurisée avec:
 * - Stockage chiffré des données de session via SecureStorage
 * - Gestion d'expiration et de renouvellement automatique
 * - Synchronisation avec Supabase Auth
 * - Prise en charge du mode hors ligne
 */
import SecureStorage from './SecureStorage';
import { supabase } from './supabase';

class SessionManager {
  // Clés de stockage
  static SESSION_KEY = 'ikigai_session';
  static SESSION_EXPIRY_KEY = 'ikigai_session_expiry';
  static SESSION_DATA_KEY = 'ikigai_session_data';
  static ONBOARDING_STATUS_KEY = 'ikigai_onboarding_status';
  
  // Durée de session par défaut (4 heures en millisecondes)
  static DEFAULT_SESSION_DURATION = 4 * 60 * 60 * 1000;
  
  /**
   * Crée une nouvelle session utilisateur
   * @param {Object} userData Données de l'utilisateur
   * @param {number} duration Durée de validité en ms
   * @returns {Object} La session créée
   */
  static createSession(userData, duration = this.DEFAULT_SESSION_DURATION) {
    // Nettoyer d'abord toute session existante
    this.clearSession();
    
    // Créer la nouvelle session
    const session = {
      user: userData,
      created: Date.now(),
      lastActivity: Date.now()
    };
    
    // Calculer l'expiration
    const expiry = Date.now() + duration;
    
    // Stocker la session, l'expiration et synchroniser avec localStorage pour compatibilité
    SecureStorage.setItem(this.SESSION_KEY, session);
    SecureStorage.setItem(this.SESSION_EXPIRY_KEY, expiry);
    
    // Stocker un indicateur minimal dans localStorage (sans données sensibles)
    try {
      localStorage.setItem('ikigai_has_session', 'true');
      localStorage.setItem('ikigai_session_created', Date.now().toString());
    } catch (e) {
      console.warn("Impossible de stocker l'indicateur de session:", e);
    }
    
    // Synchroniser avec Supabase en stockant la dernière activité
    try {
      if (userData?.id) {
        supabase
          .from('user_sessions')
          .upsert({
            user_id: userData.id,
            last_activity: new Date().toISOString(),
            user_agent: navigator.userAgent,
            is_active: true
          }, { onConflict: 'user_id' })
          .then(result => {
            if (result.error) {
              console.warn("Erreur de synchronisation de session:", result.error);
            }
          });
      }
    } catch (e) {
      console.warn("Erreur lors de la synchronisation Supabase:", e);
    }
    
    return session;
  }
  
  /**
   * Vérifie si la session actuelle est valide
   * @returns {boolean} Vrai si la session est valide
   */
  static isSessionValid() {
    const expiry = SecureStorage.getItem(this.SESSION_EXPIRY_KEY);
    const session = SecureStorage.getItem(this.SESSION_KEY);
    
    if (!expiry || !session) return false;
    
    // Vérifier si la session a expiré
    return Date.now() < expiry;
  }
  
  /**
   * Récupère les données de session actuelles
   * @returns {Object|null} Données de session ou null si aucune session valide
   */
  static getSession() {
    if (!this.isSessionValid()) {
      // Avant d'effacer, vérifier si on peut renouveler avec Supabase
      this.tryRenewSession();
      return null;
    }
    
    // Mettre à jour la dernière activité
    const session = SecureStorage.getItem(this.SESSION_KEY);
    if (session) {
      session.lastActivity = Date.now();
      SecureStorage.setItem(this.SESSION_KEY, session);
    }
    
    return session;
  }
  
  /**
   * Prolonge la durée de validité de la session actuelle
   * @param {number} duration Nouvelle durée en ms
   * @returns {boolean} Vrai si l'extension a réussi
   */
  static extendSession(duration = this.DEFAULT_SESSION_DURATION) {
    if (!this.isSessionValid()) return false;
    
    const expiry = Date.now() + duration;
    SecureStorage.setItem(this.SESSION_EXPIRY_KEY, expiry);
    
    // Mettre à jour la dernière activité
    const session = SecureStorage.getItem(this.SESSION_KEY);
    if (session) {
      session.lastActivity = Date.now();
      SecureStorage.setItem(this.SESSION_KEY, session);
      
      // Synchroniser avec Supabase
      try {
        if (session.user?.id) {
          supabase
            .from('user_sessions')
            .update({
              last_activity: new Date().toISOString(),
              is_active: true
            })
            .eq('user_id', session.user.id);
        }
      } catch (e) {
        // Ignorer les erreurs de synchronisation
      }
    }
    
    return true;
  }
  
  /**
   * Tente de renouveler une session expirée via Supabase
   * @returns {boolean} Vrai si le renouvellement a réussi
   */
  static async tryRenewSession() {
    try {
      // Timeout de sécurité pour éviter le blocage
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout lors du renouvellement de session")), 3000)
      );
      
      // Utiliser Promise.race pour limiter le temps d'attente
      const sessionPromise = supabase.auth.refreshSession();
      const result = await Promise.race([sessionPromise, timeoutPromise]);
      
      const { data, error } = result;
      
      if (error || !data || !data.session) {
        console.warn("Échec du renouvellement de session:", error?.message || "Pas de session valide retournée");
        return false;
      }
      
      // Créer une nouvelle session avec les données fraîches
      this.createSession(data.user);
      
      // Nettoyer les flags de session précédente
      try {
        localStorage.removeItem('ikigai_session_error');
        localStorage.removeItem('ikigai_session_recovery_attempt');
      } catch (e) {
        // Ignorer les erreurs de nettoyage
      }
      
      return true;
    } catch (e) {
      console.warn("Impossible de renouveler la session:", e);
      
      // Marquer l'erreur dans localStorage pour récupération ultérieure
      try {
        localStorage.setItem('ikigai_session_error', e.message || 'Unknown error');
        localStorage.setItem('ikigai_session_recovery_attempt', Date.now().toString());
      } catch (storageError) {
        // Ignorer les erreurs de stockage
      }
      
      return false;
    }
  }
  
  /**
   * Efface complètement la session actuelle
   */
  static clearSession() {
    // Récupérer l'ID utilisateur avant de supprimer la session
    let userId = null;
    try {
      const session = SecureStorage.getItem(this.SESSION_KEY);
      if (session?.user?.id) {
        userId = session.user.id;
      }
    } catch (e) {
      // Ignorer les erreurs
    }
    
    // Supprimer les données de session
    SecureStorage.removeItem(this.SESSION_KEY);
    SecureStorage.removeItem(this.SESSION_EXPIRY_KEY);
    SecureStorage.removeItem(this.SESSION_DATA_KEY);
    
    // Nettoyer localStorage
    try {
      localStorage.removeItem('ikigai_has_session');
      localStorage.removeItem('ikigai_session_created');
    } catch (e) {
      // Ignorer les erreurs
    }
    
    // Marquer la session comme inactive dans Supabase
    if (userId) {
      try {
        supabase
          .from('user_sessions')
          .update({
            is_active: false,
            logged_out_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      } catch (e) {
        // Ignorer les erreurs de synchronisation
      }
    }
  }
  
  /**
   * Stocke des données liées à la session (préférences, état)
   * @param {string} key Clé de stockage
   * @param {*} value Valeur à stocker
   * @returns {boolean} Vrai si le stockage a réussi
   */
  static setSessionData(key, value) {
    if (!this.isSessionValid()) return false;
    
    let sessionData = SecureStorage.getItem(this.SESSION_DATA_KEY) || {};
    sessionData[key] = value;
    
    return SecureStorage.setItem(this.SESSION_DATA_KEY, sessionData);
  }
  
  /**
   * Récupère des données liées à la session
   * @param {string} key Clé de stockage
   * @returns {*} Valeur stockée ou null
   */
  static getSessionData(key) {
    if (!this.isSessionValid()) return null;
    
    const sessionData = SecureStorage.getItem(this.SESSION_DATA_KEY) || {};
    return sessionData[key] || null;
  }
  
  /**
   * Gère spécifiquement l'état de l'onboarding
   * @param {boolean} isCompleted État de complétion
   * @param {Object} responses Réponses d'onboarding (optionnel)
   */
  static setOnboardingStatus(isCompleted, responses = null) {
    const status = {
      completed: isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : null,
      responses: responses
    };
    
    // Stocker dans SecureStorage
    SecureStorage.setItem(this.ONBOARDING_STATUS_KEY, status);
    
    // Stocker aussi dans localStorage pour redondance
    try {
      localStorage.setItem('onboardingCompleted', isCompleted ? 'true' : 'false');
      if (isCompleted) {
        localStorage.setItem('onboardingCompletedAt', status.completedAt);
      }
    } catch (e) {
      // Ignorer les erreurs
    }
  }
  
  /**
   * Récupère l'état de l'onboarding
   * @returns {Object} État de l'onboarding
   */
  static getOnboardingStatus() {
    // Essayer d'abord SecureStorage
    const status = SecureStorage.getItem(this.ONBOARDING_STATUS_KEY);
    
    if (status) {
      return status;
    }
    
    // Sinon essayer localStorage comme fallback
    try {
      const isCompleted = localStorage.getItem('onboardingCompleted') === 'true';
      const completedAt = localStorage.getItem('onboardingCompletedAt') || null;
      
      return {
        completed: isCompleted,
        completedAt: completedAt,
        responses: null // Pas de réponses dans localStorage pour raisons de sécurité
      };
    } catch (e) {
      // Par défaut, considérer que l'onboarding n'est pas complété
      return {
        completed: false,
        completedAt: null,
        responses: null
      };
    }
  }
}

export default SessionManager;