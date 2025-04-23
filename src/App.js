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
    const initApp = async () => {
      try {
        // Vérifier si nous sommes sur la page de réinitialisation de mot de passe
        const pathname = window.location.pathname;
        const hash = window.location.hash;
        
        if (pathname === '/reset-password' || hash.includes('type=recovery')) {
          setShowResetPassword(true);
          setIsLoading(false);
          return; // Ne pas continuer le chargement des autres données
        }
        
        // Charger le contenu statique
        const allIslands = API.content.getAllIslands();
        const allChallenges = API.content.getAllChallenges();
        const allExercises = API.content.getAllExercises();
        const allModules = API.content.getAllModules();
        
        setIslands(allIslands);
        setChallenges(allChallenges);
        setExercises(allExercises);
        setModules(allModules);
        
        // Vérifier si l'utilisateur est connecté
        const isAuth = await API.auth.isAuthenticated();
        
        // Charger la progression
        const userProgress = await API.progress.getProgress();
        setProgress(userProgress);
        
        // Charger les paramètres utilisateur
        const settings = await API.progress.getUserSettings();
        if (settings) {
          setUserSettings(settings);
          // Apply dark mode immediately
          if (settings.darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } else {
           // Apply default dark mode state if no settings found
           if (userSettings.darkMode) {
             document.documentElement.classList.add('dark');
           } else {
             document.documentElement.classList.remove('dark');
           }
        }
        
        // Détecter un retour d'inscription/connexion via Google
        const isOAuthRedirect = window.location.hash && 
                               (window.location.hash.includes('access_token') || 
                                window.location.hash.includes('error'));
                                
        if (isOAuthRedirect) {
          console.log("Détection d'un retour d'authentification OAuth");
          // Nettoyer l'URL après détection du retour OAuth
          window.history.replaceState(null, document.title, window.location.pathname);
        }
        
        // Récupérer les données de session OAuth si elles existent
        let oauthSession = null;
        try {
          const storedSession = sessionStorage.getItem('oauthSession');
          if (storedSession) {
            oauthSession = JSON.parse(storedSession);
            console.log("Session OAuth détectée:", oauthSession);
            // Nettoyer la session après l'avoir récupérée
            sessionStorage.removeItem('oauthSession');
          }
        } catch (error) {
          console.warn("Erreur lors de la récupération de la session OAuth:", error);
        }
        
        // Vérifier si l'onboarding est complété depuis les données de progression
        // Avec une approche plus robuste pour éviter les incohérences
        let isOnboardingCompleted = false;
        
        // D'abord vérifier dans les données de progression (la source la plus fiable)
        if (userProgress && userProgress.moduleResponses && 
            userProgress.moduleResponses.onboarding && 
            userProgress.moduleResponses.onboarding.completedAt) {
          isOnboardingCompleted = true;
          console.log("Onboarding confirmé comme complété dans les données utilisateur");
        }
        
        // Si non complété dans les données utilisateur, vérifier SecureStorage
        // mais uniquement si les données utilisateur sont vides (nouvel utilisateur)
        if (!isOnboardingCompleted && 
            (!userProgress.moduleResponses || !Object.keys(userProgress.moduleResponses).length)) {
          const secureStorageStatus = SecureStorage.getItem('onboardingCompleted');
          if (secureStorageStatus === 'true') {
            isOnboardingCompleted = true;
            console.log("Onboarding confirmé comme complété dans SecureStorage");
          }
        }
        
        console.log("État final onboarding:", isOnboardingCompleted ? "Complété" : "Non complété");
        
        if (isAuth) {
          // Utilisateur connecté
          console.log("Utilisateur authentifié");
          
          // Gestion spécifique pour les retours OAuth
          if (isOAuthRedirect && oauthSession) {
            // Si la session indique que l'onboarding est nécessaire et qu'il n'est pas déjà complété
            // dans les données de progression
            if (oauthSession.needsOnboarding && !isOnboardingCompleted) {
              console.log("Redirection vers l'onboarding après authentification OAuth");
              setShowWelcome(false);
              setShowSignup(false);
              setShowOnboarding(true);
              setIsLoading(false);
              return;
            }
          }
          
          if (isOnboardingCompleted) {
            // Si l'utilisateur est inscrit et a complété l'onboarding, afficher la page principale
            setShowWelcome(false);
            setShowSignup(false);
            setShowOnboarding(false);
            console.log("Affichage de la page principale - Onboarding déjà complété");
          } else {
            // Si l'utilisateur est inscrit mais n'a pas complété l'onboarding
            setShowOnboarding(true);
            setShowWelcome(false);
            setShowSignup(false);
            console.log("Affichage de l'onboarding - Onboarding non complété");
          }
        } else {
          // Utilisateur non connecté
          console.log("Utilisateur non authentifié");
          // Toujours afficher d'abord la page d'accueil (WelcomePage) pour les utilisateurs non connectés
          setShowWelcome(true);
          setShowSignup(false);
          setShowOnboarding(false);
          console.log("Affichage de la page d'accueil - Utilisateur non connecté");
          
          // Stocker l'état d'onboarding pour une utilisation ultérieure
          if (isOnboardingCompleted) {
            SecureStorage.setItem('onboardingCompleted', 'true');
          }
        }
        
        // Nettoyer SecureStorage après utilisation
        SecureStorage.removeItem('onboardingCompleted');
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
      } finally {
        setIsLoading(false);
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
      
      // Désactiver TOUS les autres écrans d'abord
      setShowWelcome(false);
      setShowSignup(false);
      setShowOnboarding(false);
      setSelectedIsland(null);
      setIsLoading(false);
      
      // IMPORTANT: Activer la page d'analyse AVANT de stocker les réponses
      // pour éviter les problèmes de timing avec le rendu conditionnel
      setShowOnboardingAnalysis(true);
      console.log("Activation de la page d'analyse d'onboarding");
      
      // Ensuite seulement stocker les réponses
      setOnboardingResponses(responsesWithTimestamp);
      
      // Marquer l'onboarding comme complété dans localStorage pour référence future
      localStorage.setItem('onboardingCompleted', 'true');
      
      console.log("Activation de la page d'analyse complétée. État:", {
        showOnboardingAnalysis: true,
        showOnboarding: false,
        showSignup: false,
        showWelcome: false,
        isLoading: false,
        responsesStored: !!responsesWithTimestamp
      });
      
    } catch (error) {
      console.error("Erreur lors de la complétion de l'onboarding:", error);
      // En cas d'erreur, continuer vers la page principale
      setShowOnboarding(false);
      setShowOnboardingAnalysis(false);
      setIsLoading(false);
    }
  };
  
  // Gérer la fin de l'analyse
  const handleAnalysisComplete = async (responses) => {
    try {
      console.log("App: Analyse terminée pour les réponses:", responses);
      
      // Ajouter des points pour avoir complété l'onboarding
      const updatedProgress = {...progress};
      updatedProgress.totalPoints = (updatedProgress.totalPoints || 0) + 200;
      
      // S'assurer que moduleResponses.onboarding existe et est marqué comme complété
      if (!updatedProgress.moduleResponses) {
        updatedProgress.moduleResponses = {};
      }
      if (!updatedProgress.moduleResponses.onboarding) {
        updatedProgress.moduleResponses.onboarding = {};
      }
      updatedProgress.moduleResponses.onboarding = {
        ...responses,
        completedAt: responses.completedAt || new Date().toISOString()
      };
      
      try {
        await API.progress.saveProgress(updatedProgress);
        setProgress(updatedProgress);
      } catch (saveError) {
        console.warn("Erreur lors de la sauvegarde de la progression:", saveError);
        // Continuer malgré l'erreur
      }
      
      // Fermer la page d'analyse et passer à l'application principale
      setShowOnboardingAnalysis(false);
      setOnboardingResponses(null);
      
      // S'assurer que tous les autres écrans sont désactivés
      setShowWelcome(false);
      setShowSignup(false);
      setShowOnboarding(false);
      
      // Léger délai pour laisser React mettre à jour les états
      setTimeout(() => {
        console.log("Transition vers la page principale terminée");
      }, 100);
      
    } catch (error) {
      console.error("Erreur lors de la finalisation de l'analyse:", error);
      // En cas d'erreur, continuer vers la page principale
      setShowOnboardingAnalysis(false);
      setOnboardingResponses(null);
      setShowWelcome(false);
      setShowSignup(false);
      setShowOnboarding(false);
    }
  };
  
  // Affichage pendant le chargement
  if (isLoading) {
    // Log pour debugging
    console.log("DEBUG App.js: Affichage de l'écran de chargement", {
      timestamp: new Date().toISOString(),
      showWelcome, 
      showSignup, 
      showOnboarding, 
      showOnboardingAnalysis,
      selectedIsland
    });
    
    // Capture du temps de démarrage pour le debug
    const loadingStartTime = Date.now();
    
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
        <div className="mt-2 text-xs text-gray-400">
          {/* Timer pour afficher le temps d'attente */}
          <span id="loading-timer">{Math.floor((Date.now() - loadingStartTime) / 1000)}s</span>
          <script dangerouslySetInnerHTML={{
            __html: `
              // Script pour mettre à jour le compteur toutes les secondes
              setInterval(() => {
                const timer = document.getElementById('loading-timer');
                if (timer) {
                  const seconds = Math.floor((Date.now() - ${loadingStartTime}) / 1000);
                  timer.textContent = seconds + 's';
                  // Alerter si le chargement prend trop de temps
                  if (seconds > 10) {
                    timer.style.color = 'red';
                    console.warn("DEBUG: Temps de chargement anormalement long: " + seconds + "s");
                  }
                }
              }, 1000);
            `
          }} />
        </div>
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
    console.log("DEBUG App.js: Rendu du composant OnboardingJourney");
    try {
      return (
        <OnboardingJourney 
          onComplete={handleOnboardingComplete}
          onCancel={() => {
            console.log("DEBUG App.js: Annulation d'onboarding");
            setShowOnboarding(false);
            setShowSignup(true);
          }}
        />
      );
    } catch (error) {
      console.error("DEBUG App.js: Erreur lors du rendu de OnboardingJourney:", error);
      // Fallback en cas d'erreur
      return (
        <div className="flex items-center justify-center h-screen flex-col bg-red-50">
          <div className="p-4 bg-white rounded-lg shadow-lg max-w-md text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Erreur lors du chargement</h2>
            <p className="text-gray-600 mb-4">Une erreur s'est produite lors du chargement du parcours d'onboarding.</p>
            <button 
              onClick={() => {
                console.log("DEBUG App.js: Tentative de rechargement");
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Recharger l'application
            </button>
          </div>
        </div>
      );
    }
  }
  
  // PRIORITÉ 4: Si la page d'inscription est active, l'afficher
  if (showSignup) {
    return (
      <SignupPage
        onComplete={async (userData) => {
          try {
            console.log("Démarrage de la redirection après inscription/connexion", {
              userData: userData ? {
                id: userData.id,
                email: userData.email,
                timestamp: new Date().toISOString()
              } : "Données utilisateur manquantes"
            });
            
            // D'abord effacer l'état de connexion pour garantir que nous sommes bien en transition
            setShowSignup(false);
            setIsLoading(true); // Ajouter un état de chargement pendant la transition
            console.log("DEBUG App.js: États mis à jour - showSignup=false, isLoading=true");
            
            // Attendre un court instant pour laisser React mettre à jour les états
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Récupérer les données de progression
            console.log("DEBUG App.js: Récupération des données de progression");
            let userProgress;
            let progressError = null;
            
            try {
              userProgress = await API.progress.getProgress();
              console.log("DEBUG App.js: Données de progression récupérées:", userProgress);
            } catch (error) {
              progressError = error;
              console.error("DEBUG App.js: Erreur lors de la récupération des données de progression:", error);
              
              // Tentative de récupération avec un délai supplémentaire
              try {
                console.log("DEBUG App.js: Nouvelle tentative de récupération après délai...");
                await new Promise(resolve => setTimeout(resolve, 1000));
                userProgress = await API.progress.getProgress();
                console.log("DEBUG App.js: Nouvelle tentative réussie, données récupérées:", userProgress);
              } catch (retryError) {
                console.error("DEBUG App.js: Échec de la nouvelle tentative:", retryError);
                // Initialiser avec un objet vide en dernier recours
                userProgress = {}; 
              }
            }
            
            // Si on a une erreur et un objet vide, utiliser une structure minimale
            if (progressError && (!userProgress || Object.keys(userProgress).length === 0)) {
              console.warn("DEBUG App.js: Utilisation d'une structure minimale pour un nouvel utilisateur");
              userProgress = {
                totalPoints: 0,
                streakDays: 0,
                lastActive: new Date().toISOString(),
                completedModules: {},
                completedChallenges: {},
                moduleResponses: {},
                badges: []
              };
            }
            
            // Déterminer si l'onboarding est complété
            let isOnboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';
            
            if (localStorage.getItem('onboardingCompleted') === null && userProgress) {
              isOnboardingCompleted = !!(userProgress.moduleResponses && 
                                       userProgress.moduleResponses.onboarding && 
                                       userProgress.moduleResponses.onboarding.completedAt);
            }
            
            console.log("État d'onboarding:", isOnboardingCompleted ? "Complété" : "Non complété");
            
            // Toujours effacer l'item du localStorage après utilisation
            localStorage.removeItem('onboardingCompleted');
          
            // Pour un nouvel utilisateur, forcer l'onboarding quelle que soit la valeur
            // Pour un utilisateur existant, vérifier dans les données de progression
            const forceOnboarding = userData && userData.app_metadata?.provider === 'email' && 
                                    (!userData.created_at || 
                                    new Date(userData.created_at).getTime() > (Date.now() - 5 * 60 * 1000)); // 5 minutes
            
            console.log("DEBUG App.js: Décision de redirection", {
              isOnboardingCompleted,
              forceOnboarding,
              userData: userData ? {
                provider: userData.app_metadata?.provider,
                created_at: userData.created_at
              } : null
            });
            
            // Mettre à jour les états pour la redirection
            if (isOnboardingCompleted && !forceOnboarding) {
              // Si l'onboarding est déjà complété, aller à la page principale
              console.log("Redirection vers la page principale");
              setShowOnboarding(false);
              setShowOnboardingAnalysis(false);
            } else {
              // Sinon, aller à l'onboarding
              console.log("Redirection vers l'onboarding");
              
              // IMPORTANT: Désactiver tous les autres états avant d'activer l'onboarding
              // pour éviter les conflits de rendu
              setShowSignup(false);
              setShowWelcome(false);
              setSelectedIsland(null);
              setShowOnboardingAnalysis(false);
              
              // Attendre que React mette à jour les états
              await new Promise(resolve => setTimeout(resolve, 50));
              
              // Ensuite seulement activer l'onboarding
              setShowOnboarding(true);
              
              // Log de debug pour vérifier l'état après mise à jour
              console.log("DEBUG App.js: État d'onboarding défini sur true, vérification...");
              
              // IMPORTANT: S'assurer que isLoading est passé à false APRÈS le changement d'état
              setTimeout(() => {
                setIsLoading(false);
                console.log("DEBUG App.js: isLoading défini à false après activation de l'onboarding");
              }, 100);
            }
            
            // Vérifier les états après le rendu
            setTimeout(() => {
              console.log("DEBUG App.js: États finaux après transition", {
                showOnboarding: showOnboarding,
                showSignup: showSignup,
                isLoading: isLoading,
                showOnboardingAnalysis: showOnboardingAnalysis,
                isOnboardingCompleted: isOnboardingCompleted,
                timestamp: new Date().toISOString()
              });
            }, 200);
            
            // Sécurité: s'assurer que isLoading est réinitialisé même en cas de problème
            setTimeout(() => {
              if (isLoading) {
                console.warn("FAILSAFE: Reset isLoading qui est resté bloqué à true");
                setIsLoading(false);
              }
            }, 3000);
            
          } catch (error) {
            console.error("Erreur lors de la redirection après authentification:", error);
            // En cas d'erreur, afficher l'onboarding par défaut
            setShowSignup(false);
            setShowOnboarding(true);
            setIsLoading(false);
          }
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