import React, { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabase';
import Logo from '../components/ui/Logo';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Vérifier si l'URL contient un token de réinitialisation
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes('type=recovery')) {
      setError("Lien de réinitialisation invalide. Veuillez demander un nouveau lien de réinitialisation.");
    }
  }, []);

  // Vérifier les critères du mot de passe
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    setPasswordCriteria({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword)
    });
  };

  // Vérifier si le mot de passe répond à tous les critères
  const isPasswordValid = () => {
    return passwordCriteria.length && 
           passwordCriteria.uppercase && 
           passwordCriteria.lowercase && 
           passwordCriteria.number && 
           passwordCriteria.special;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Réinitialiser les erreurs
    setError(null);
    
    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    
    // Vérifier que le mot de passe répond aux critères
    if (!isPasswordValid()) {
      setError("Le mot de passe doit respecter tous les critères de sécurité.");
      return;
    }
    
    setLoading(true);
    
    try {
      // Mettre à jour le mot de passe avec Supabase
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        throw error;
      }
      
      // Réinitialisation réussie
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
      
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
      setError("Une erreur est survenue lors de la réinitialisation du mot de passe. " + 
              (error.message || "Veuillez réessayer ou demander un nouveau lien."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Réinitialiser votre mot de passe
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Nouveau mot de passe
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                {/* Critères de mot de passe */}
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
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </label>
                <div className="mt-1">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                {/* Vérification de correspondance */}
                {confirmPassword && (
                  <p className={`mt-1 text-sm ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                    {password === confirmPassword ? 'Les mots de passe correspondent ✓' : 'Les mots de passe ne correspondent pas ✗'}
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading || !isPasswordValid() || password !== confirmPassword}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                              ${loading || !isPasswordValid() || password !== confirmPassword 
                                ? 'bg-blue-300 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                >
                  {loading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
                </button>
              </div>
              
              <div className="text-sm text-center mt-4">
                <a href="/" className="font-medium text-blue-600 hover:text-blue-500">
                  Retour à la page de connexion
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;