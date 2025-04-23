import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../shared/supabase';
import ErrorHandler from '../../shared/ErrorHandler';
import API from '../../backend/api';
import './SignupPage/SignupPageResponsive.css'; // Import des styles responsifs
import LegalPages from './LegalPages'; // Import du composant pour les pages légales

const SignupPage = ({ onComplete, onCancel }) => {
  // État pour déterminer si l'utilisateur est en mode connexion ou inscription
  const [isLoginMode, setIsLoginMode] = useState(false);
  // État pour la modal de mot de passe oublié
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState(null);
  // État pour les pages légales
  const [currentLegalPage, setCurrentLegalPage] = useState(null);
  
  // Vérifier si l'utilisateur vient de se déconnecter
  useEffect(() => {
    const isReconnecting = localStorage.getItem('isReconnecting');
    if (isReconnecting === 'true') {
      setIsLoginMode(true);
      // Réinitialiser le flag après utilisation
      localStorage.removeItem('isReconnecting');
    }
  }, []);
  // États pour les champs du formulaire
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [status, setStatus] = useState('');
  const [otherStatus, setOtherStatus] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // État pour les critères de mot de passe
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Fonction pour valider le format de l'adresse email
  const validateEmail = (email) => {
    if (!email || email.trim() === '') return false;
    
    // Expression régulière améliorée pour vérifier le format d'email
    // Vérifie la présence d'un @ suivi d'un nom de domaine et d'une extension valide (.com, .fr, etc.)
    // L'extension doit comporter au moins 2 caractères après le point
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    
    // Vérification supplémentaire pour s'assurer que le domaine est complet
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    if (!parts[0] || parts[0].trim() === '') return false; // Vérifie que le nom d'utilisateur n'est pas vide
    
    const domain = parts[1];
    if (!domain || domain.trim() === '') return false; // Vérifie que le domaine n'est pas vide
    
    // Vérifie que le domaine contient au moins un point et que l'extension après le dernier point est valide
    const domainParts = domain.split('.');
    if (domainParts.length < 2) return false;
    if (!domainParts[0] || domainParts[0].trim() === '') return false; // Vérifie que le nom de domaine n'est pas vide
    if (!domainParts[domainParts.length - 1] || domainParts[domainParts.length - 1].length < 2) return false; // Vérifie l'extension
    
    // Vérifie que l'email correspond au format attendu
    return emailRegex.test(email);
  };

  // Fonction pour gérer le mot de passe oublié
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError(null);
    setForgotPasswordSuccess(false);
    
    try {
      // Vérifier que l'email est valide
      if (!validateEmail(forgotPasswordEmail)) {
        throw new Error("Veuillez saisir une adresse email valide.");
      }
      
      // Utiliser l'API pour réinitialiser le mot de passe
      const result = await API.auth.resetPassword(forgotPasswordEmail);
      
      if (!result.success) {
        throw new Error(result.message || "Erreur lors de l'envoi de l'email de réinitialisation.");
      }
      
      // Succès
      setForgotPasswordSuccess(true);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      setForgotPasswordError(error.message || "Une erreur s'est produite lors de la réinitialisation du mot de passe.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };
  
  // Fonction pour gérer le changement du mot de passe
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    // Vérifier les critères de sécurité du mot de passe
    setPasswordCriteria({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword)
    });
  };
  
  // Fonction pour gérer le changement de l'email
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Ne pas afficher d'erreur si le champ est vide (l'utilisateur est en train de saisir)
    if (!newEmail || newEmail.trim() === '') {
      setEmailError('');
      return;
    }
    
    // Vérifier le format de l'email à chaque changement
    if (!validateEmail(newEmail)) {
      // Analyse plus détaillée pour donner un message d'erreur plus précis
      if (!newEmail.includes('@')) {
        setEmailError('Veuillez inclure le symbole @ dans votre adresse email.');
      } else {
        const parts = newEmail.split('@');
        if (parts.length === 2) {
          if (!parts[1] || parts[1].trim() === '') {
            setEmailError('Veuillez saisir la partie manquante après le symbole "@". L\'adresse "' + newEmail + '" est incomplète.');
          } else if (!parts[1].includes('.')) {
            setEmailError('L\'adresse email doit contenir un nom de domaine avec une extension (exemple: .com, .fr).');
          } else {
            setEmailError('Format d\'adresse email invalide. Exemple correct: utilisateur@domaine.fr');
          }
        } else {
          setEmailError('Format d\'adresse email invalide. Exemple correct: utilisateur@domaine.fr');
        }
      }
    } else {
      setEmailError('');
    }
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Réinitialiser les erreurs précédentes
    setSuccessMessage(''); // Réinitialiser les messages de succès
    
    // Vérifier que l'email est présent et valide avant de soumettre
    if (!email || email.trim() === '') {
      setEmailError('Veuillez saisir une adresse email.');
      return;
    }
    
    if (!validateEmail(email)) {
      // Analyse détaillée pour donner un message d'erreur précis
      if (!email.includes('@')) {
        setEmailError('Veuillez inclure le symbole @ dans votre adresse email.');
      } else {
        const parts = email.split('@');
        if (parts.length === 2) {
          if (!parts[1] || parts[1].trim() === '') {
            setEmailError('Veuillez saisir la partie manquante après le symbole "@". L\'adresse "' + email + '" est incomplète.');
          } else if (!parts[1].includes('.')) {
            setEmailError('L\'adresse email doit contenir un nom de domaine avec une extension (exemple: .com, .fr).');
          } else {
            setEmailError('Format d\'adresse email invalide. Exemple correct: utilisateur@domaine.fr');
          }
        } else {
          setEmailError('Format d\'adresse email invalide. Exemple correct: utilisateur@domaine.fr');
        }
      }
      return;
    }
    
    // Vérifier que le mot de passe a une longueur minimale et répond aux critères de sécurité
    if (!password || password.trim().length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    
    // En mode inscription, vérifier les critères de sécurité supplémentaires
    if (!isLoginMode) {
      if (!/[A-Z]/.test(password)) {
        setError("Le mot de passe doit contenir au moins une lettre majuscule.");
        return;
      }
      if (!/[a-z]/.test(password)) {
        setError("Le mot de passe doit contenir au moins une lettre minuscule.");
        return;
      }
      if (!/[0-9]/.test(password)) {
        setError("Le mot de passe doit contenir au moins un chiffre.");
        return;
      }
      if (!/[^A-Za-z0-9]/.test(password)) {
        setError("Le mot de passe doit contenir au moins un caractère spécial.");
        return;
      }
      // Vérifier les champs obligatoires pour l'inscription
      if (!firstName || !lastName || !age || !status) {
        setError("Veuillez remplir tous les champs obligatoires pour l'inscription.");
        return;
      }
    }
    
    setLoading(true);
    
    try {
      let result;
      if (isLoginMode) {
        // En mode connexion
        result = await API.auth.signIn(email, password);
        if (result.success && result.user) {
          setSuccessMessage('Connexion réussie!');
          if (onComplete) {
            onComplete(result.user); // Passer l'utilisateur à l'étape suivante
          }
        } else {
          setError(result.message || "Erreur lors de la connexion.");
        }
      } else {
        // En mode inscription
        result = await API.auth.signUp(email, password, firstName, lastName, age, status);

        if (result.success && result.user) {
          // Inscription réussie, afficher un message de succès et préparer la redirection
          console.log("Inscription réussie, préparation de la redirection vers onboarding");
          setSuccessMessage(result.message || 'Inscription réussie!'); // Afficher un message de succès
          
          // Forcer un délai avant la redirection pour assurer que les états sont correctement mis à jour
          // Ajouter des logs de débogage pour diagnostiquer les problèmes de transition
          console.log("DEBUG: Préparation de la redirection avec les données utilisateur:", {
            userId: result.user?.id,
            userEmail: result.user?.email,
            timestamp: new Date().toISOString(),
            success: result.success
          });
          
          setTimeout(() => {
            if (onComplete) {
              console.log("DEBUG: Exécution de la redirection vers onboarding");
              onComplete(result.user); // Passer l'utilisateur à l'étape suivante (onboarding)
              
              // Vérifier après l'appel si la transition s'est bien passée
              setTimeout(() => {
                console.log("DEBUG: Vérification post-redirection - État actuel:", {
                  document_location: window.location.href,
                  timing: performance.now(),
                  memory: window.performance?.memory ? {
                    usedJSHeapSize: window.performance.memory.usedJSHeapSize,
                    totalJSHeapSize: window.performance.memory.totalJSHeapSize
                  } : "Non disponible"
                });
              }, 200);
            } else {
              console.error("DEBUG: Fonction onComplete manquante - La redirection ne peut pas être effectuée");
            }
          }, 500); // Délai de 500ms pour assurer la stabilité de la transition
        } else {
          // Gérer les erreurs d'inscription ou le cas où l'utilisateur n'est pas retourné
          setError(result.message || "Une erreur s'est produite lors de l'inscription.");
        }
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      // Utiliser le gestionnaire d'erreurs pour un message plus précis si possible
      const handledError = ErrorHandler.handle(error, isLoginMode ? 'Connexion' : 'Inscription');
      setError(handledError.message || `Une erreur s'est produite lors de ${isLoginMode ? 'la connexion' : 'l\'inscription'}.`);
    } finally {
      setLoading(false); // Assurer que le chargement est désactivé dans tous les cas
    }
  };

  // Fonction pour gérer la connexion avec Google en utilisant le service d'auth
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      // Pour un nouvel utilisateur (en mode inscription), on doit s'assurer que l'onboarding n'est pas complété
      if (!isLoginMode) {
        localStorage.setItem('onboardingCompleted', 'false');
      }
      
      // Utiliser le service d'authentification plutôt que Supabase directement
      const result = await API.auth.signInWithGoogle();
      
      if (!result.success) {
        throw new Error(result.message || "Erreur lors de la connexion avec Google");
      }
      
      // Si la connexion est réussie, nous n'avons pas besoin de faire autre chose
      // La redirection sera automatique après l'authentification OAuth
    } catch (error) {
      console.error('Erreur lors de la connexion avec Google:', error);
      
      // Utiliser le gestionnaire d'erreurs centralisé
      const errorResult = ErrorHandler.handle(error, 'Connexion Google');
      
      // Définir le message d'erreur à afficher
      setError(errorResult.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 signup-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden signup-form-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* En-tête */}
        <div className="bg-blue-50 p-5">
          <h2 className="text-2xl font-bold text-blue-600">{isLoginMode ? 'Connexion' : 'Inscription'}</h2>
          <p className="text-blue-500">
            {isLoginMode 
              ? 'Connectez-vous pour accéder à votre parcours IKIGAI' 
              : 'Créez votre compte pour commencer votre parcours IKIGAI'}
          </p>
        </div>

        {/* Formulaire */}
        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Champs d'inscription uniquement */}
            {!isLoginMode && (
              <>
                {/* Nom */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Prénom */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Âge (optionnel) */}
                <div className="relative">
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Âge (optionnel)</label>
                  <div className="relative">
                    <input
                      type="number"
                      id="age"
                      min="1"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute right-3 top-2 cursor-help group">
                      <span className="text-gray-400 text-lg">?</span>
                      <div className="absolute hidden group-hover:block right-0 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                        Fournir votre âge garantit que vous obtenez la bonne expérience IKIGAI. Pour plus de détails, consultez notre <a href="/confidentialite" className="text-blue-300 hover:underline">Politique de confidentialité</a>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Statut */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionnez votre statut</option>
                    <option value="Cadre">Cadre</option>
                    <option value="Manager">Manager</option>
                    <option value="Salarié">Salarié</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                {/* Autre statut (conditionnel) */}
                {status === 'Autre' && (
                  <div>
                    <label htmlFor="otherStatus" className="block text-sm font-medium text-gray-700 mb-1">Précisez votre statut</label>
                    <input
                      type="text"
                      id="otherStatus"
                      value={otherStatus}
                      onChange={(e) => setOtherStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
              </>
            )}

            {/* Email - toujours affiché */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full px-3 py-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            {/* Mot de passe - toujours affiché */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength="8"
              />
              
              {/* Critères de mot de passe (uniquement en mode inscription) */}
              {!isLoginMode && password.length > 0 && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-1">Votre mot de passe doit contenir :</p>
                  <ul className="space-y-1 text-xs">
                    <li className={`flex items-center ${passwordCriteria.length ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-1">{passwordCriteria.length ? '✓' : '○'}</span> Au moins 8 caractères
                    </li>
                    <li className={`flex items-center ${passwordCriteria.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-1">{passwordCriteria.uppercase ? '✓' : '○'}</span> Au moins 1 lettre majuscule
                    </li>
                    <li className={`flex items-center ${passwordCriteria.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-1">{passwordCriteria.lowercase ? '✓' : '○'}</span> Au moins 1 lettre minuscule
                    </li>
                    <li className={`flex items-center ${passwordCriteria.number ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-1">{passwordCriteria.number ? '✓' : '○'}</span> Au moins 1 chiffre
                    </li>
                    <li className={`flex items-center ${passwordCriteria.special ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-1">{passwordCriteria.special ? '✓' : '○'}</span> Au moins 1 caractère spécial
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Message de succès */}
            {successMessage && (
              <div className="p-3 bg-green-50 text-green-600 rounded-md font-medium">
                {successMessage}
              </div>
            )}
            
            {/* Message d'erreur - protection renforcée contre les objets vides */}
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md">
                {typeof error === 'string' 
                  ? error 
                  : error instanceof Error 
                    ? error.message 
                    : typeof error === 'object' 
                      ? (Object.keys(error).length === 0 
                          ? "Le service d'authentification est temporairement indisponible. Veuillez réessayer plus tard."
                          : JSON.stringify(error) === '{}' 
                            ? "Le service d'authentification est temporairement indisponible. Veuillez réessayer plus tard."
                            : "Une erreur de connexion s'est produite. Veuillez vérifier vos identifiants et réessayer.")
                      : "Une erreur s'est produite. Veuillez réessayer."}
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading 
                ? (isLoginMode ? 'Connexion en cours...' : 'Inscription en cours...') 
                : (isLoginMode ? 'Se connecter' : 'S\'inscrire')}
            </button>
            
            {/* Lien Mot de passe oublié (uniquement en mode connexion) */}
            {isLoginMode && (
              <div className="text-center mt-2">
                <button 
                  type="button" 
                  className="text-blue-600 hover:underline text-sm focus:outline-none"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
          </form>

          {/* Lien pour basculer entre connexion et inscription */}
          <div className="text-center mt-4">
            <button 
              type="button" 
              className="text-blue-600 hover:underline focus:outline-none"
              onClick={() => setIsLoginMode(!isLoginMode)}
            >
              {isLoginMode 
                ? "Vous n'avez pas de compte ? Inscrivez-vous" 
                : "Déjà inscrit ? Connectez-vous"}
            </button>
          </div>
          
          {/* Séparateur */}
          <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">ou</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Bouton Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-700 font-medium flex items-center justify-center space-x-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            <span>{isLoginMode ? 'Se connecter avec Google' : 'S\'inscrire avec Google'}</span>
          </button>

          {/* Lien pour annuler */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onCancel}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Retour
            </button>
          </div>
          
          {/* Footer avec liens légaux */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-500">
              <span>© 2025 IKIGAI</span>
              <button 
                onClick={() => setCurrentLegalPage('copyright')} 
                className="hover:text-blue-600 hover:underline"
              >
                Copyright
              </button>
              <button 
                onClick={() => setCurrentLegalPage('legal')} 
                className="hover:text-blue-600 hover:underline"
              >
                Mentions légales
              </button>
              <button 
                onClick={() => setCurrentLegalPage('privacy')} 
                className="hover:text-blue-600 hover:underline"
              >
                Confidentialité
              </button>
              <button 
                onClick={() => setCurrentLegalPage('support')} 
                className="hover:text-blue-600 hover:underline"
              >
                Support
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Modal de mot de passe oublié */}
      {showForgotPassword && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && setShowForgotPassword(false)}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="bg-blue-50 p-5">
              <h2 className="text-xl font-bold text-blue-600">Mot de passe oublié</h2>
              <p className="text-blue-500">
                Saisissez votre adresse email pour recevoir un lien de réinitialisation
              </p>
            </div>
            
            {/* Formulaire */}
            <div className="p-5">
              {forgotPasswordSuccess ? (
                <div className="p-3 bg-green-50 text-green-600 rounded-md mb-4">
                  Un email de réinitialisation a été envoyé à {forgotPasswordEmail}. Veuillez vérifier votre boîte de réception.
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label htmlFor="forgotPasswordEmail" className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
                    <input
                      type="email"
                      id="forgotPasswordEmail"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  {forgotPasswordError && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-md">
                      {forgotPasswordError}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    disabled={forgotPasswordLoading}
                  >
                    {forgotPasswordLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                  </button>
                </form>
              )}
              
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Retour
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Affichage des pages légales */}
      {currentLegalPage && (
        <LegalPages 
          page={currentLegalPage} 
          onClose={() => setCurrentLegalPage(null)} 
        />
      )}
    </motion.div>
  );
};


export default SignupPage;