// Service d'authentification pour l'application IKIGAI
// Gère les connexions, inscriptions et déconnexions d'utilisateurs

import { supabase, handleSupabaseError } from '../../shared/supabase';

class AuthService {
  // Récupérer l'utilisateur actuel
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }
  
  // Inscription avec email et mot de passe
  static async signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      // Vérifier s'il y a une erreur
      if (error) {
        throw error;
      }
      
      // Vérifier si data.user existe
      if (!data || !data.user) {
        throw new Error("Erreur lors de l'inscription. Veuillez réessayer.");
      }
      
      return {
        user: data.user,
        success: true,
        message: 'Inscription réussie! Vérifiez votre email pour confirmer votre compte.'
      };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      
      // Utiliser la fonction utilitaire pour obtenir un message d'erreur approprié
      const errorMessage = handleSupabaseError(error);
      
      return {
        user: null,
        success: false,
        message: errorMessage || "Erreur lors de l'inscription. Veuillez réessayer."
      };
    }
  }
  
  // Connexion avec email et mot de passe
  static async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // Vérifier s'il y a une erreur
      if (error) {
        throw error;
      }
      
      // Vérifier si data.user existe
      if (!data || !data.user) {
        throw new Error("Erreur lors de la connexion. Veuillez vérifier vos identifiants.");
      }
      
      return {
        user: data.user,
        success: true,
        message: 'Connexion réussie!'
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      
      // Utiliser la fonction utilitaire pour obtenir un message d'erreur approprié
      const errorMessage = handleSupabaseError(error);
      
      return {
        user: null,
        success: false,
        message: errorMessage || "Identifiants incorrects. Veuillez réessayer."
      };
    }
  }
  
  // Connexion avec Google OAuth
  static async signInWithGoogle() {
    try {
      const redirectUrl = window.location.origin;
      console.log('URL de redirection OAuth configurée:', redirectUrl);
      
      // Générer un identifiant unique pour cette session d'auth
      const authSessionId = `google_auth_${Date.now()}`;
      
      // Vérifier si l'onboarding a déjà été complété
      // en interrogeant directement Supabase pour éviter les incohérences
      let needsOnboarding = true;
      try {
        // Vérifier si nous avons des informations locales sur l'onboarding
        const existingOnboardingStatus = localStorage.getItem('onboardingCompleted');
        if (existingOnboardingStatus === 'true') {
          needsOnboarding = false;
          console.log('Connexion Google - Statut local d\'onboarding confirmé comme complété');
        }
      } catch (storageError) {
        console.warn('Erreur lors de la vérification du statut d\'onboarding:', storageError);
      }
      
      // Stocker l'information pour le retour OAuth
      sessionStorage.setItem('oauthSession', JSON.stringify({
        id: authSessionId,
        timestamp: Date.now(),
        needsOnboarding: needsOnboarding
      }));
      
      // Options pour Supabase OAuth avec persistance de session
      const options = {
        redirectTo: redirectUrl,
        persistSession: true,
        queryParams: {
          // Passer des paramètres supplémentaires qui nous aideront à identifier cette session
          session_id: authSessionId
        }
      };
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: options
      });
      
      // Vérifier s'il y a une erreur
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        message: 'Redirection vers Google...'
      };
    } catch (error) {
      console.error('Erreur lors de la connexion avec Google:', error);
      
      // Utiliser la fonction utilitaire pour obtenir un message d'erreur approprié
      const errorMessage = handleSupabaseError(error);
      
      return {
        success: false,
        message: errorMessage || "Erreur lors de la connexion avec Google. Veuillez réessayer."
      };
    }
  }
  
  // Déconnexion
  static async signOut() {
    try {
      // Nettoyer les données de session dans localStorage et sessionStorage
      // avant de déclencher la déconnexion Supabase
      try {
        // Liste des clés à supprimer de localStorage (liées à l'authentification et l'onboarding)
        const localStorageKeysToRemove = [
          'authSessionId', 
          'onboardingCompleted',
          'isReconnecting'
        ];
        
        // Supprimer les clés spécifiques de localStorage
        localStorageKeysToRemove.forEach(key => {
          if (localStorage.getItem(key) !== null) {
            localStorage.removeItem(key);
          }
        });
        
        // Liste des clés à supprimer de sessionStorage
        const sessionStorageKeysToRemove = [
          'onboardingCompleted',
          'authSessionId',
          'oauthSession'
        ];
        
        // Supprimer les clés spécifiques de sessionStorage
        sessionStorageKeysToRemove.forEach(key => {
          if (sessionStorage.getItem(key) !== null) {
            sessionStorage.removeItem(key);
          }
        });
        
        // Supprimer les cookies liés à l'onboarding
        document.cookie = 'onboardingRequired=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'authSessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        console.log('Nettoyage des données de session effectué avant déconnexion');
      } catch (cleanupError) {
        console.warn('Erreur lors du nettoyage des données de session:', cleanupError);
      }
      
      // Ensuite déclencher la déconnexion Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Déconnexion sur tous les appareils et onglets
      });
      
      // Vérifier s'il y a une erreur
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        message: 'Déconnexion réussie!'
      };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      
      // Utiliser la fonction utilitaire pour obtenir un message d'erreur approprié
      const errorMessage = handleSupabaseError(error);
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }
  
  // Vérifier si un utilisateur est connecté
  static async isAuthenticated() {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }
  
  // Réinitialisation de mot de passe
  static async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      // Vérifier s'il y a une erreur
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        message: 'Email de réinitialisation envoyé avec succès!'
      };
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      
      // Utiliser la fonction utilitaire pour obtenir un message d'erreur approprié
      const errorMessage = handleSupabaseError(error);
      
      return {
        success: false,
        message: errorMessage || "Erreur lors de l'envoi de l'email de réinitialisation. Veuillez réessayer."
      };
    }
  }
}

export default AuthService;