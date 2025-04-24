import React, { useState, useEffect } from 'react';
import './App.css';
import API from './backend/api';
import WelcomePage from './frontend/pages/WelcomePage';
import HomePage from './frontend/pages/HomePage';
import IslandView from './frontend/pages/IslandView';
import SignupPage from './frontend/pages/SignupPage';
import OnboardingJourney from './frontend/pages/OnboardingJourney';
import OnboardingAnalysisPage from './frontend/pages/OnboardingAnalysisPage';
import ResetPassword from './frontend/pages/ResetPassword';
import { LanguageProvider } from './frontend/context/LanguageContext';
import SecureStorage from './shared/SecureStorage';

function App() {
  const [progress, setProgress] = useState(null);
  const [islands, setIslands] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [modules, setModules] = useState([]);
  const [userSettings, setUserSettings] = useState({
    notifications: true,
    sounds: true,
    darkMode: false, // Default dark mode setting
    dataPrivacy: 'standard',
    language: 'fr',
    dailyReminders: false,
    meditationSounds: false
  });
  
  const [selectedIsland, setSelectedIsland] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showOnboardingAnalysis, setShowOnboardingAnalysis] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [onboardingResponses, setOnboardingResponses] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Charger les données initiales
  useEffect(() => {
    // Tracking pour l'initialisation
    window.IKIGAI_APP_INITIALIZING = true;
    
    const initApp = async () => {
      try {
        console.log("Initialisation de l'application...");
        
        // Vérifier si nous sommes sur la page de réinitialisation de mot de passe
        const pathname = window.location.pathname;
        const hash = window.location.hash;
        
        if (pathname === '/reset-password' || hash.includes('type=recovery')) {
          setShowResetPassword(true);
          setIsLoading(false);
          return; // Ne pas continuer le chargement des autres données
        }
        
        // Chargement en parallèle des données statiques et de l'authentification
        // pour améliorer les performances
        const [
          allIslands, 
          allChallenges, 
          allExercises, 
          allModules, 
          isAuth
        ] = await Promise.all([
          API.content.getAllIslands(),
          API.content.getAllChallenges(),
          API.content.getAllExercises(),
          API.content.getAllModules(),
          API.auth.isAuthenticated()
        ]);
        
        // Mettre à jour les états avec les données statiques immédiatement
        setIslands(allIslands);
        setChallenges(allChallenges);
        setExercises(allExercises);
        setModules(allModules);
        
        // Détecter un retour d'authentification OAuth
        const isOAuthRedirect = window.location.hash && 
                               (window.location.hash.includes('access_token') || 
                                window.location.hash.includes('error'));
                                
        if (isOAuthRedirect) {
          console.log("Détection d'un retour d'authentification OAuth");
          window.history.replaceState(null, document.title, window.location.pathname);
        }
        
        // Récupérer la session OAuth si disponible
        let oauthSession = null;
        try {
          const storedSession = sessionStorage.getItem('oauthSession');
          if (storedSession) {
            oauthSession = JSON.parse(storedSession);
            console.log("Session OAuth trouvée");
            sessionStorage.removeItem('oauthSession');
          }
        } catch (error) {
          console.warn("Erreur de récupération de session OAuth:", error);
        }
        
        let userProgress = null;
        let settings = null;
        
        // Si l'utilisateur est authentifié, charger ses données
        if (isAuth) {
          console.log("Utilisateur authentifié, chargement des données...");
          
          // Charger les données utilisateur en parallèle
          const [progressData, userSettings] = await Promise.all([
            API.progress.getProgress(),
            API.progress.getUserSettings()
          ]);
          
          userProgress = progressData;
          settings = userSettings;
          
          // Mettre à jour les états
          setProgress(userProgress);
          
          if (settings) {
            setUserSettings(settings);
            // Appliquer le mode sombre immédiatement
            if (settings.darkMode) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } else {
            // Appliquer le mode par défaut si pas de paramètres
            if (userSettings.darkMode) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        }
        
        // Vérification robuste du statut d'onboarding avec SessionManager
        let isOnboardingCompleted = false;
        
        // 1. Source primaire : données utilisateur (si disponibles)
        if (userProgress?.moduleResponses?.onboarding?.completedAt) {
          isOnboardingCompleted = true;
          console.log("Onboarding complété selon les données utilisateur");
          
          // Synchroniser avec SessionManager
          SessionManager.setOnboardingStatus(true, userProgress.moduleResponses.onboarding);
        } 
        // 2. Source secondaire : SessionManager
        else {
          const onboardingStatus = SessionManager.getOnboardingStatus();
          isOnboardingCompleted = onboardingStatus.completed;
          
          if (isOnboardingCompleted) {
            console.log("Onboarding complété selon SessionManager");
          }
        }
        
        console.log("Statut final onboarding:", isOnboardingCompleted ? "Complété" : "Non complété");
        
        // Décider quelle page afficher en fonction de l'authentification et de l'onboarding
        if (isAuth) {
          console.log("Décision de navigation pour utilisateur authentifié");
          
          // Cas spécial: retour OAuth avec besoin d'onboarding
          if (isOAuthRedirect && oauthSession && oauthSession.needsOnboarding && !isOnboardingCompleted) {
            console.log("Redirection vers onboarding post-OAuth");
            setShowWelcome(false);
            setShowSignup(false);
            setShowOnboarding(true);
          }
          // Cas standard: onboarding déjà complété
          else if (isOnboardingCompleted) {
            console.log("Navigation vers page principale (onboarding complété)");
            setShowWelcome(false);
            setShowSignup(false);
            setShowOnboarding(false);
          } 
          // Cas standard: onboarding à compléter
          else {
            console.log("Navigation vers onboarding (non complété)");
            setShowOnboarding(true);
            setShowWelcome(false);
            setShowSignup(false);
          }
        } 
        // Utilisateur non connecté
        else {
          console.log("Navigation pour utilisateur non authentifié");
          setShowWelcome(true);
          setShowSignup(false);
          setShowOnboarding(false);
          
          // Si l'onboarding a déjà été complété, le garder en mémoire
          if (isOnboardingCompleted) {
            SessionManager.setOnboardingStatus(true);
          }
        }
      } catch (error) {
        console.error("Erreur critique d'initialisation:", error);
        
        // En cas d'erreur critique, afficher la page d'accueil par défaut
        setShowWelcome(true);
        setShowSignup(false);
        setShowOnboarding(false);
      } finally {
        // Toujours désactiver le loader
        setIsLoading(false);
        window.IKIGAI_APP_INITIALIZING = false;
        console.log("Initialisation terminée");
      }
    };
    
    initApp();
  }, [userSettings.darkMode]); // Ajout de userSettings.darkMode comme dépendance
  
  // Fonction pour mettre à jour les paramètres globaux et appliquer les changements
  const updateGlobalSettings = async (newSettings) => {
    setUserSettings(newSettings);
    
    // Apply dark mode change with smooth transition
    document.documentElement.classList.add('transitioning');
    
    // Toggle the dark mode class
    if (newSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('transitioning');
    }, 500);
    
    // Appliquer le changement de langue si disponible
    if (newSettings.language) {
      // La langue sera gérée par le contexte LanguageContext
      // Cette ligne met à jour localStorage pour que le contexte puisse détecter le changement
      localStorage.setItem('ikigai_language', newSettings.language);
    }
    
    // Sauvegarder les paramètres dans Supabase
    try {
      await API.progress.saveUserSettings(newSettings);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
    }
  };

  // Gérer la complétion d'un module
  const handleCompleteModule = async (moduleId, islandId) => {
    try {
      const updatedProgress = await API.progress.completeModule(moduleId, islandId);
      setProgress(updatedProgress);
    } catch (error) {
      console.error("Erreur lors de la complétion du module:", error);
    }
  };
  
  // Gérer la complétion d'un défi
  const handleCompleteChallenge = async (challengeId) => {
    try {
      const updatedProgress = await API.progress.completeChallenge(challengeId);
      setProgress(updatedProgress);
    } catch (error) {
      console.error("Erreur lors de la complétion du défi:", error);
    }
  };
  
  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      // Effectuer la déconnexion
      const result = await API.auth.signOut();
      
      if (!result.success) {
        throw new Error(result.message || "Erreur lors de la déconnexion");
      }
      
      // Réinitialiser les états de l'application
      setProgress(null);
      setUserSettings({
        notifications: true,
        sounds: true,
        darkMode: false,
        dataPrivacy: 'standard',
        language: 'fr',
        dailyReminders: false,
        meditationSounds: false
      });
      
      // Réinitialiser les autres états de navigation
      setSelectedIsland(null);
      setShowOnboardingAnalysis(false);
      setOnboardingResponses(null);
      
      // Rediriger vers la page de connexion
      setShowSignup(true);
      setShowWelcome(false);
      setShowOnboarding(false);
      
      console.log("Déconnexion réussie, redirection vers la page de connexion");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      alert("Une erreur est survenue lors de la déconnexion: " + (error.message || "Veuillez réessayer."));
    }
  };
  
  // Fonction pour réinitialiser la progression - actuellement non utilisée
  // mais conservée pour une utilisation future potentielle
  /*
  const handleResetProgress = async () => {
    try {
      const resetProgress = API.progress.resetAllData();
      setProgress(resetProgress);
      console.log("Progression réinitialisée avec succès");
    } catch (error) {
      console.error("Erreur lors de la réinitialisation de la progression:", error);
    }
  };
  */
  
  // Gérer la complétion de l'onboarding
  const handleOnboardingComplete = async (responses) => {
    try {
      console.log("App: Complétion de l'onboarding avec réponses:", responses);
      
      // Ajouter un timestamp de complétion si non présent
      const responsesWithTimestamp = {
        ...responses,
        completedAt: responses.completedAt || new Date().toISOString()
      };
      
      // 1. Stocker les réponses d'abord pour qu'elles soient disponibles
      // immédiatement quand la page d'analyse sera affichée
      setOnboardingResponses(responsesWithTimestamp);
      
      // 2. Marquer l'onboarding comme complété dans différents stockages pour redondance
      try {
        // Dans localStorage pour persistance entre sessions
        localStorage.setItem('onboardingCompleted', 'true');
        localStorage.setItem('onboardingCompletedAt', responsesWithTimestamp.completedAt);
        
        // Dans sessionStorage pour la session courante
        sessionStorage.setItem('onboardingCompleted', 'true');
        
        // Dans une variable globale pour accès immédiat
        window.IKIGAI_ONBOARDING_COMPLETED = true;
        window.IKIGAI_ONBOARDING_TIMESTAMP = responsesWithTimestamp.completedAt;
      } catch (storageError) {
        console.warn("Erreur de stockage local:", storageError);
      }
      
      // 3. Effacer les flags de visibilité de l'onboarding
      try {
        localStorage.removeItem('ikigai_onboarding_active');
        localStorage.removeItem('ikigai_onboarding_visible');
        window.IKIGAI_ONBOARDING_ACTIVE = false;
        window.IKIGAI_ONBOARDING_VISIBLE = false;
      } catch (e) {
        console.warn("Erreur nettoyage variables onboarding:", e);
      }
      
      // 4. Désactiver TOUS les autres écrans en une seule opération atomique
      console.log("Désactivation des écrans précédents");
      setShowWelcome(false);
      setShowSignup(false);
      setShowOnboarding(false);
      setSelectedIsland(null);
      setIsLoading(false);
      
      // 5. IMPORTANT: Petit délai avant d'activer la page d'analyse pour permettre
      // au React de finaliser la mise à jour des états précédents
      console.log("Préparation de l'activation de la page d'analyse");
      setTimeout(() => {
        // Activer la page d'analyse d'onboarding
        setShowOnboardingAnalysis(true);
        console.log("Activation de la page d'analyse d'onboarding effectuée");
      }, 100);
      
    } catch (error) {
      console.error("Erreur lors de la complétion de l'onboarding:", error);
      
      // En cas d'erreur, utiliser une approche plus robuste
      // 1. Réinitialiser tous les écrans
      setShowWelcome(false);
      setShowSignup(false);
      setShowOnboarding(false);
      setShowOnboardingAnalysis(false);
      setIsLoading(false);
      
      // 2. Petit délai avant de rediriger vers la page d'analyse
      setTimeout(() => {
        // Stocker les réponses même en cas d'erreur
        if (!onboardingResponses && responses) {
          setOnboardingResponses({
            ...responses,
            completedAt: new Date().toISOString(),
            recoveryMode: true
          });
        }
        
        // Activer la page d'analyse en mode de secours
        setShowOnboardingAnalysis(true);
        console.log("Récupération après erreur: page d'analyse activée");
      }, 200);
    }
  };
  
  // Gérer la fin de l'analyse
  const handleAnalysisComplete = async (responses) => {
    // Marquer immédiatement la fonction comme en cours d'exécution pour éviter les appels multiples
    window.IKIGAI_ANALYSIS_COMPLETING = true;
    
    try {
      console.log("App: Analyse terminée pour les réponses");
      
      // 1. Préparation des données de progression avec robustesse
      let updatedProgress = {...(progress || {})};
      
      // Assurer que toutes les structures nécessaires existent
      updatedProgress.totalPoints = updatedProgress.totalPoints || 0;
      updatedProgress.moduleResponses = updatedProgress.moduleResponses || {};
      updatedProgress.completedModules = updatedProgress.completedModules || [];
      
      // Ajouter des points pour avoir complété l'onboarding
      updatedProgress.totalPoints += 200;
      
      // S'assurer que l'onboarding est marqué comme complété avec un timestamp
      updatedProgress.moduleResponses.onboarding = {
        ...responses,
        completedAt: responses.completedAt || new Date().toISOString(),
        pointsAwarded: 200
      };
      
      // Ajouter l'onboarding à la liste des modules complétés s'il n'y est pas déjà
      if (!updatedProgress.completedModules.includes('onboarding')) {
        updatedProgress.completedModules.push('onboarding');
      }
      
      // 2. Sauvegarder la progression de manière asynchrone - ne pas bloquer la suite
      API.progress.saveProgress(updatedProgress)
        .then(() => {
          console.log("Progression sauvegardée avec succès");
          // Mettre à jour l'état local uniquement après sauvegarde réussie
          setProgress(updatedProgress);
        })
        .catch(saveError => {
          console.warn("Erreur de sauvegarde:", saveError);
          // En cas d'échec, mettre quand même à jour l'état local
          setProgress(updatedProgress);
        });
      
      // 3. Nettoyer toutes les variables et états liés à l'onboarding
      try {
        // Nettoyer localStorage et sessionStorage
        const keysToRemove = [
          'onboarding_pending_responses',
          'onboarding_responses_timestamp',
          'ikigai_analysis_active',
          'ikigai_analysis_timestamp'
        ];
        
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          } catch (e) {
            // Ignorer les erreurs de nettoyage
          }
        });
        
        // Nettoyer les variables globales
        window.IKIGAI_ANALYSIS_ACTIVE = false;
        window.IKIGAI_ONBOARDING_ACTIVE = false;
      } catch (cleanupError) {
        console.warn("Erreur de nettoyage:", cleanupError);
      }
      
      // 4. IMPORTANT: Transition atomique vers la page principale
      // Nous utilisons un délai pour assurer que les autres états ont été traités
      console.log("Préparation transition page principale");
      
      // D'abord désactiver la page d'analyse
      setShowOnboardingAnalysis(false);
      
      // Ensuite, après un court délai, désactiver tous les autres états
      // pour s'assurer que les changements d'états sont traités correctement
      setTimeout(() => {
        // Réinitialiser complètement tous les états de navigation
        setOnboardingResponses(null);
        setShowWelcome(false);
        setShowSignup(false);
        setShowOnboarding(false);
        setIsLoading(false);
        setSelectedIsland(null);
        
        // Marquer que l'opération est terminée
        window.IKIGAI_ANALYSIS_COMPLETING = false;
        console.log("Transition vers la page principale terminée");
      }, 300);
      
    } catch (error) {
      console.error("Erreur critique lors de la finalisation de l'analyse:", error);
      
      // Plan de secours - réinitialiser tous les états
      setShowOnboardingAnalysis(false);
      setOnboardingResponses(null);
      setShowWelcome(false);
      setShowSignup(false);
      setShowOnboarding(false);
      setIsLoading(false);
      
      // Marquer que l'opération est terminée même en cas d'erreur
      window.IKIGAI_ANALYSIS_COMPLETING = false;
    }
  };
  
  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen flex-col bg-gray-50">
        <div className="flex items-center">
          <div className="flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 rounded-full w-9 h-9 text-white">
            <span className="text-xl">🧠</span>
          </div>
          <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500">IKIGAI</span>
        </div>
        <div className="mt-8 relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-gray-200"></div>
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-transparent border-l-transparent animate-spin border-blue-500"></div>
        </div>
        <span className="mt-4 text-gray-600">Chargement...</span>
      </div>
    );
  }
  
  // PRIORITÉ 0: Si nous sommes sur la page de réinitialisation de mot de passe
  if (showResetPassword) {
    console.log("Affichage de la page de réinitialisation de mot de passe");
    return <ResetPassword />;
  }
  
  // PRIORITÉ 1: Si l'analyse des réponses d'onboarding est active, afficher la page d'analyse en priorité
  if (showOnboardingAnalysis) {
    console.log("Affichage de la page d'analyse des réponses:", onboardingResponses);
    return (
      <OnboardingAnalysisPage 
        responses={onboardingResponses || {}}
        onAnalysisComplete={handleAnalysisComplete}
      />
    );
  }
  
  // PRIORITÉ 2: Si une île est sélectionnée, afficher sa vue
  if (selectedIsland) {
    return (
      <IslandView 
        island={selectedIsland} 
        onReturn={() => setSelectedIsland(null)} 
        globalProgress={progress} 
        onCompleteModule={handleCompleteModule}
        modules={modules}
      />
    );
  }
  
  // PRIORITÉ 3: Si l'onboarding est actif, l'afficher
  if (showOnboarding) {
    return (
      <OnboardingJourney 
        onComplete={handleOnboardingComplete}
        onCancel={() => {
          setShowOnboarding(false);
          setShowSignup(true);
        }}
      />
    );
  }
  
  // PRIORITÉ 4: Si la page d'inscription est active, l'afficher
  if (showSignup) {
    return (
      <SignupPage
        onComplete={async () => {
          // Récupérer les données de progression directement depuis l'API pour avoir les informations les plus à jour
          const userProgress = await API.progress.getProgress();
          
          // Récupérer l'état d'onboarding depuis localStorage ou le calculer depuis userProgress
          let isOnboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';
          
          // Si la valeur n'est pas dans localStorage, vérifier dans les données de progression
          if (localStorage.getItem('onboardingCompleted') === null) {
            isOnboardingCompleted = userProgress.moduleResponses && 
                                     userProgress.moduleResponses.onboarding && 
                                     userProgress.moduleResponses.onboarding.completedAt;
          }
          
          // Supprimer l'item du localStorage après utilisation
          localStorage.removeItem('onboardingCompleted');
          
          console.log("Après connexion - État onboarding:", isOnboardingCompleted ? "Complété" : "Non complété");
          console.log("Données onboarding:", userProgress.moduleResponses?.onboarding);
          
          setShowSignup(false);
          
          // Vérifier que userProgress est bien défini avant d'utiliser ses propriétés
          if (userProgress && Object.keys(userProgress).length > 0) {
            // Rediriger vers l'onboarding uniquement si l'utilisateur ne l'a pas déjà complété
            if (isOnboardingCompleted) {
              // Si l'onboarding est déjà complété, afficher directement la page principale
              setShowOnboarding(false);
              console.log("Redirection vers la page principale - Onboarding déjà complété");
            } else {
              // Sinon, afficher l'onboarding
              setShowOnboarding(true);
              console.log("Redirection vers l'onboarding - Onboarding non complété");
            }
          } else {
            // En cas de données manquantes, afficher l'onboarding par défaut
            setShowOnboarding(true);
            console.log("Redirection vers l'onboarding - Données de progression indisponibles");
          }
          
          // Nettoyer localStorage si présent
          localStorage.removeItem('onboardingCompleted');
        }}
        onCancel={() => {
          setShowSignup(false);
          setShowWelcome(true);
        }}
      />
    );
  }
  
  // Si la page d'accueil est active, l'afficher
  if (showWelcome) {
    return (
      <WelcomePage 
        onStart={() => {
          setShowWelcome(false);
          setShowSignup(true);
        }}
        onSignIn={() => {
          setShowWelcome(false);
          setShowSignup(true);
          localStorage.setItem('isReconnecting', 'true');
        }}
      />
    );
  }
  
  // Afficher la page principale enveloppée dans le contexte de langue
  return (
    <LanguageProvider>
      <div className={`App ${userSettings.darkMode ? 'dark' : ''}`}> 
        <HomePage 
          progress={progress}
          islands={islands}
          challenges={challenges}
          exercises={exercises}
          onSelectIsland={setSelectedIsland}
          onCompleteChallenge={handleCompleteChallenge}
          onLogout={handleLogout}
          userSettings={userSettings}
          onUpdateSettings={updateGlobalSettings}
        />
      </div>
    </LanguageProvider>
  );
}

export default App;