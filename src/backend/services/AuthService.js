// Service d'authentification pour l'application IKIGAI
// Gère les connexions, inscriptions et déconnexions d'utilisateurs

import { supabase } from '../../shared/supabase';
import ErrorHandler from '../../shared/ErrorHandler';
import Validator from '../../shared/Validator';
import SessionManager from '../../shared/SessionManager';

// Fonction utilitaire pour envoyer un email de bienvenue via le webhook Make
async function sendWelcomeEmail(email, userData, type = 'email') {
  try {
    // Extraire le nom selon le format des données utilisateur
    let nom = '';
    if (type === 'email') {
      // Pour l'inscription par email, userData est l'objet data
      nom = userData?.user?.user_metadata?.full_name || '';
    } else {
      // Pour l'authentification Google, userData est l'objet user
      nom = userData?.user_metadata?.full_name || userData?.user_metadata?.name || '';
    }

    await fetch(process.env.REACT_APP_WELCOME_EMAIL_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        nom: nom,
        prénom: prénom,
        âge: âge,
        statut: statut,
        date_inscription: new Date().toISOString(),
        type_inscription: type
      })
    });
    console.log(`Email de bienvenue envoyé avec succès via Make (${type})`);
    return true;
  } catch (webhookError) {
    console.error(`Erreur lors de l'envoi de l'email de bienvenue (${type}):`, webhookError);
    return false;
  }
}

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
  
  // Fonction de validation robuste des mots de passe
  static validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return { isValid: false, message: "Le mot de passe est requis" };
    }
    
    // Vérification de la longueur minimale
    if (password.length < 8) {
      return { isValid: false, message: "Le mot de passe doit contenir au moins 8 caractères" };
    }
    
    // Vérification des critères de complexité
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    if (!hasUppercase) {
      return { isValid: false, message: "Le mot de passe doit contenir au moins une lettre majuscule" };
    }
    
    if (!hasLowercase) {
      return { isValid: false, message: "Le mot de passe doit contenir au moins une lettre minuscule" };
    }
    
    if (!hasNumber) {
      return { isValid: false, message: "Le mot de passe doit contenir au moins un chiffre" };
    }
    
    if (!hasSpecial) {
      return { isValid: false, message: "Le mot de passe doit contenir au moins un caractère spécial" };
    }
    
    return { isValid: true, message: "Mot de passe valide" };
  }
  
  // Inscription avec email et mot de passe
  static async signUp(email, password) {
    try {
      // Validation des données
      const validation = Validator.validate(
        { email },
        {
          email: [{ type: 'required' }, { type: 'email' }]
        }
      );
      
      // Validation spécifique du mot de passe avec notre fonction robuste
      const passwordValidation = this.validatePassword(password);
      
      if (!validation.isValid) {
        return {
          user: null,
          success: false,
          message: Object.values(validation.errors)[0][0] // Premier message d'erreur
        };
      }
      
      if (!passwordValidation.isValid) {
        return {
          user: null,
          success: false,
          message: passwordValidation.message
        };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      // Ajouter la vérification pour la confirmation d'email
      if (!error && data && data.user) {
        // Vérifier si l'utilisateur doit confirmer son email
        if (data.user.identities && data.user.identities.length > 0 && !data.user.email_confirmed_at) {
          // Envoyer l'email de bienvenue même si la confirmation est requise
          await sendWelcomeEmail(email, data, 'email');
          return {
            user: data.user,
            success: true,
            message: 'Inscription réussie! Veuillez vérifier votre email pour confirmer votre compte avant de vous connecter.',
            requiresEmailConfirmation: true
          };
        }
      }
      
      // Vérifier s'il y a une erreur
      if (error) {
        throw error;
      }
      
      // Vérifier si data.user existe
      if (!data || !data.user) {
        throw new Error("Erreur lors de l'inscription. Veuillez réessayer.");
      }
      
      // Envoyer un email de bienvenue via le webhook Make
      await sendWelcomeEmail(email, data, 'email');
      
      return {
        user: data.user,
        success: true,
        message: 'Inscription réussie! Vérifiez votre email pour confirmer votre compte.'
      };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      
      // Utiliser le gestionnaire d'erreurs centralisé
      return ErrorHandler.handle(error, 'Inscription');
      
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
      
      // Si l'authentification réussit :
      if (data && data.user) {
        // Créer une session
        SessionManager.createSession(data.user);
      }
      
      return {
        user: data.user,
        success: true,
        message: 'Connexion réussie!'
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      
      // Utiliser le gestionnaire d'erreurs centralisé
      return ErrorHandler.handle(error, 'Connexion');
      
    }
  }
  
  // Connexion avec Google OAuth
  static async signInWithGoogle() {
    try {
      const redirectUrl = window.location.origin;
      console.log('URL de redirection OAuth configurée:', redirectUrl);
      
      // Générer un identifiant unique pour cette session d'auth
      const authSessionId = `google_auth_${Date.now()}`;
      
      // Vérifier si l'onboarding a déjà été complété en interrogeant directement Supabase
      let needsOnboarding = true;
      try {
        // Récupérer l'utilisateur actuel si déjà connecté (pour les reconnexions OAuth)
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.id) {
          // Vérifier dans la base de données si l'onboarding est complété
          const { data: userProgressData, error: progressError } = await supabase
            .from('user_progress')
            .select('progress_data')
            .eq('user_id', user.id)
            .single();
          
          if (!progressError && userProgressData?.progress_data) {
            // Analyser les données de progression
            const progressData = typeof userProgressData.progress_data === 'string' 
              ? JSON.parse(userProgressData.progress_data) 
              : userProgressData.progress_data;
            
            if (progressData?.moduleResponses?.onboarding?.completedAt) {
              needsOnboarding = false;
              console.log('Connexion Google - Statut d\'onboarding confirmé comme complété via Supabase');
            }
          }
          
          // Double vérification dans la table user_responses
          const { data: onboardingData, error: onboardingError } = await supabase
            .from('user_responses')
            .select('*')
            .eq('user_id', user.id)
            .eq('module_id', 'onboarding')
            .single();
            
          if (!onboardingError && onboardingData) {
            needsOnboarding = false;
            console.log('Connexion Google - Statut d\'onboarding confirmé comme complété via user_responses');
          }
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
      
      // Note: Pour l'authentification Google, l'email de bienvenue sera envoyé
      // après la redirection et l'authentification réussie
      // Nous ajoutons un flag dans la session pour indiquer qu'un email doit être envoyé
      sessionStorage.setItem('sendWelcomeEmail', 'true');
      
      return {
        success: true,
        message: 'Redirection vers Google...'
      };
    } catch (error) {
      console.error('Erreur lors de la connexion avec Google:', error);
      
      // Utiliser le gestionnaire d'erreurs centralisé
      return ErrorHandler.handle(error, 'Connexion Google');
      
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
      
      // Effacer la session
      SessionManager.clearSession();
      
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
      
      // Utiliser le gestionnaire d'erreurs centralisé
      return ErrorHandler.handle(error, 'Déconnexion');
      
    }
  }
  
  // Vérifier si un utilisateur est connecté
  static async isAuthenticated() {
    try {
      const user = await this.getCurrentUser();
      
      // Vérifier si nous devons envoyer un email de bienvenue après une authentification Google
      if (user && sessionStorage.getItem('sendWelcomeEmail') === 'true') {
        await sendWelcomeEmail(user.email, user, 'google');
        // Supprimer le flag pour éviter d'envoyer l'email plusieurs fois
        sessionStorage.removeItem('sendWelcomeEmail');
      }
      
      return !!user;
    } catch (error) {
      return false;
    }
  }
  
  // Réinitialisation de mot de passe avec email personnalisé via Make
  static async resetPassword(email) {
    try {
      // Générer un lien de réinitialisation via Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      // Vérifier s'il y a une erreur
      if (error) {
        throw error;
      }
      
      // Envoyer un email personnalisé via le webhook Make
      try {
        await fetch(process.env.REACT_APP_PASSWORD_RESET_WEBHOOK, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            date_demande: new Date().toISOString(),
            // Note: Le lien de réinitialisation est géré par Supabase et envoyé dans l'email par défaut
            // Make utilisera son propre template pour envoyer un email personnalisé
            app_url: window.location.origin
          })
        });
        console.log('Email de réinitialisation personnalisé envoyé avec succès via Make');
      } catch (webhookError) {
        console.error('Erreur lors de l\'envoi de l\'email personnalisé via Make:', webhookError);
        // Même en cas d'erreur du webhook, on continue car Supabase a déjà envoyé un email par défaut
      }
      
      return {
        success: true,
        message: 'Email de réinitialisation envoyé avec succès!'
      };
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      
      // Utiliser le gestionnaire d'erreurs centralisé
      return ErrorHandler.handle(error, 'Réinitialisation de mot de passe');
      
    }
  }
}

export default AuthService;