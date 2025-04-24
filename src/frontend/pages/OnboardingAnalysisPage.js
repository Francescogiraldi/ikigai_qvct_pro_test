import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../backend/api';

/**
 * Page de chargement animée qui s'affiche pendant l'analyse des réponses d'onboarding par l'IA
 * et la génération des recommandations personnalisées
 */
const OnboardingAnalysisPage = ({ responses, onAnalysisComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [showParticles, setShowParticles] = useState(false);
  
  // Étapes de l'analyse avec des descriptions et icônes pour l'utilisateur
  const analysisSteps = [
    { text: "Traitement des réponses...", icon: "🔍" },
    { text: "Analyse de vos objectifs et préférences...", icon: "🎯" },
    { text: "Identification de vos forces et points d'intérêt...", icon: "💪" },
    { text: "Élaboration de recommandations personnalisées...", icon: "🌱" },
    { text: "Finalisation de votre profil...", icon: "✨" }
  ];

  // Effet d'animation de l'analyse
  useEffect(() => {
    // Animation du pourcentage de progression
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        // Calcul du prochain niveau de progression
        // Accélérer légèrement vers la fin pour éviter que l'utilisateur n'attende trop
        let increment = 1;
        if (prevProgress > 80) increment = 2;
        if (prevProgress > 90) increment = 3;
        
        const nextProgress = prevProgress + increment;
        
        // Changer l'étape en fonction de la progression
        if (nextProgress >= 20 && nextProgress < 40 && currentStep !== 1) {
          setCurrentStep(1);
        }
        else if (nextProgress >= 40 && nextProgress < 65 && currentStep !== 2) {
          setCurrentStep(2);
        }
        else if (nextProgress >= 65 && nextProgress < 85 && currentStep !== 3) {
          setCurrentStep(3);
          // Activer les particules à mi-parcours
          setShowParticles(true);
        }
        else if (nextProgress >= 85 && currentStep !== 4) {
          setCurrentStep(4);
        }
        
        // Arrêter l'intervalle une fois à 100%
        if (nextProgress >= 100) {
          clearInterval(interval);
          console.log("Animation de progression terminée à 100%");
        }
        
        return nextProgress > 100 ? 100 : nextProgress;
      });
    }, 60); // Vitesse de progression de l'animation légèrement ajustée
    
    // Ajouter un timeout de sécurité pour s'assurer que la progression atteint 100%
    const timeoutId = setTimeout(() => {
      setProgress(100);
      console.log("Timeout de sécurité: progression forcée à 100%");
    }, 20000); // 20 secondes maximum
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [currentStep]); // Dépendance sur currentStep pour réagir aux changements d'étape

  // Effet pour effectuer l'analyse réelle des données - Version améliorée
  useEffect(() => {
    // Variable pour suivre si le composant est monté
    let isMounted = true;
    // Références aux intervalles et timeouts pour le nettoyage
    let checkInterval = null;
    let safetyTimeout = null;
    let completionTimeout = null;
    let forceTimeout = null;
    
    // Éviter de démarrer plusieurs fois l'analyse avec protection renforcée
    if (window.IKIGAI_ANALYSIS_PERFORMING) {
      console.log("Analyse déjà en cours, ignorée");
      return;
    }
    
    // Vérifier si l'onboarding est déjà complet (double vérification)
    const isOnboardingAlreadyCompleted = localStorage.getItem('onboardingCompleted') === 'true' && 
                                        localStorage.getItem('ikigai_analysis_completed') === 'true';
    
    if (isOnboardingAlreadyCompleted) {
      console.log("Onboarding et analyse déjà marqués comme complétés, redirection rapide");
      // Délai minimal pour permettre l'affichage visuel
      setTimeout(() => {
        if (onAnalysisComplete && isMounted) {
          // Récupérer les réponses stockées ou utiliser des réponses minimales
          const storedResponses = localStorage.getItem('onboarding_pending_responses');
          const responsesToUse = storedResponses ? JSON.parse(storedResponses) : responses || {};
          onAnalysisComplete(responsesToUse);
        }
      }, 500);
      return;
    }
    
    // Marquer immédiatement l'analyse comme en cours
    window.IKIGAI_ANALYSIS_PERFORMING = true;
    localStorage.setItem('ikigai_analysis_active', 'true');
    
    const performAnalysis = async () => {
      try {
        // SÉCURITÉ: Toujours terminer l'analyse après un délai maximum (6s)
        forceTimeout = setTimeout(() => {
          if (isMounted) {
            console.log("FORCE TIMEOUT: Finalisation de l'analyse après 6s");
            setProgress(100);
            
            // Éviter les appels multiples
            if (!window.IKIGAI_ANALYSIS_COMPLETING) {
              window.IKIGAI_ANALYSIS_COMPLETING = true;
              
              // Récupérer les réponses à utiliser
              const responsesToComplete = responses || {};
              
              // S'assurer que l'animation est à 100%
              setTimeout(() => {
                if (isMounted && onAnalysisComplete) {
                  onAnalysisComplete(responsesToComplete);
                }
              }, 500);
            }
          }
        }, 6000); // Réduit à 6 secondes max pour une meilleure expérience utilisateur
        
        // Récupération robuste des réponses à analyser
        let responsesToUse = responses;
        
        // Si on n'a pas de réponses valides, tenter plusieurs méthodes de récupération
        if (!responsesToUse || Object.keys(responsesToUse).length === 0) {
          console.warn("Réponses vides, tentative de récupération");
          
          // Méthode 1: localStorage
          try {
            const storedResponses = localStorage.getItem('onboarding_pending_responses');
            if (storedResponses) {
              responsesToUse = JSON.parse(storedResponses);
              console.log("Réponses récupérées depuis localStorage");
            }
          } catch (e) {
            console.warn("Échec récupération localStorage:", e);
          }
          
          // Méthode 2: SessionManager (si disponible dans window)
          if ((!responsesToUse || Object.keys(responsesToUse).length === 0) && 
              window.SessionManager && typeof window.SessionManager.getOnboardingStatus === 'function') {
            try {
              const status = window.SessionManager.getOnboardingStatus();
              if (status && status.responses) {
                responsesToUse = status.responses;
                console.log("Réponses récupérées depuis SessionManager");
              }
            } catch (e) {
              console.warn("Échec récupération SessionManager:", e);
            }
          }
          
          // Solution de dernier recours: objet minimal
          if (!responsesToUse || Object.keys(responsesToUse).length === 0) {
            console.warn("Création d'un objet de réponses minimal");
            responsesToUse = {
              recoveryMode: true,
              timestamp: new Date().toISOString()
            };
          }
        }
        
        console.log("Démarrage de l'analyse avec", Object.keys(responsesToUse).length, "réponses");
        
        // OPTIMISATION: Lancer les opérations en parallèle sans bloquer l'UI
        Promise.resolve().then(async () => {
          try {
            // Sauvegarder les réponses dans le stockage
            await API.progress.saveModuleResponses('onboarding', responsesToUse)
              .then(() => console.log("Sauvegarde des réponses réussie"))
              .catch(e => console.warn("Échec sauvegarde, non bloquant:", e));
            
            // Analyse par le service IA (parallèle et non bloquant)
            const user = await API.auth.getCurrentUser().catch(() => null);
            if (user && user.id) {
              API.ai.analyzeUserResponses(user.id)
                .then(() => console.log("Analyse IA réussie"))
                .catch(e => console.warn("Erreur analyse IA (non bloquant):", e));
            }
          } catch (e) {
            console.warn("Erreur dans les opérations en arrière-plan (non bloquant):", e);
          }
        });
        
        // Observer la progression de l'animation pour une transition fluide
        const checkProgressAndFinish = () => {
          if (!isMounted) return true;
          
          if (progress >= 100) {
            console.log("Animation terminée, préparation de la finalisation");
            
            // Nettoyer les intervalles et timeouts actifs
            if (checkInterval) clearInterval(checkInterval);
            if (safetyTimeout) clearTimeout(safetyTimeout);
            if (forceTimeout) clearTimeout(forceTimeout);
            
            // Marquer la complétion dans localStorage pour éviter les répétitions
            try {
              localStorage.setItem('ikigai_analysis_completed', 'true');
              localStorage.setItem('ikigai_analysis_completed_at', new Date().toISOString());
            } catch (e) {
              console.warn("Erreur localStorage (non bloquant):", e);
            }
            
            // Attendre un court délai pour l'animation finale
            if (isMounted && !completionTimeout && !window.IKIGAI_ANALYSIS_COMPLETING) {
              completionTimeout = setTimeout(() => {
                if (!isMounted) return;
                
                console.log("Finalisation de l'analyse");
                
                // Protection contre appels multiples
                window.IKIGAI_ANALYSIS_COMPLETING = true;
                
                if (onAnalysisComplete) {
                  onAnalysisComplete(responsesToUse);
                } else {
                  console.error("Callback onAnalysisComplete non disponible");
                  window.location.href = '/'; // Redirection vers la page principale
                }
              }, 300); // Délai minimal pour la fluidité visuelle
            }
            return true;
          }
          return false;
        };
        
        // Vérifier immédiatement, puis configurer une vérification périodique
        if (!checkProgressAndFinish()) {
          checkInterval = setInterval(checkProgressAndFinish, 150);
          
          // Sécurité secondaire avec timer indépendant
          safetyTimeout = setTimeout(() => {
            if (!isMounted) return;
            
            console.log("Activation du filet de sécurité");
            setProgress(100); // Forcer la progression complète
            
            // Nettoyage des ressources
            if (checkInterval) clearInterval(checkInterval);
            if (forceTimeout) clearTimeout(forceTimeout);
            
            // Attendre un court délai avant de finaliser
            setTimeout(() => {
              if (isMounted && onAnalysisComplete && !window.IKIGAI_ANALYSIS_COMPLETING) {
                window.IKIGAI_ANALYSIS_COMPLETING = true;
                onAnalysisComplete(responsesToUse);
              }
            }, 200);
          }, 4000); // 4 secondes maximum
        }
      } catch (err) {
        console.error("Erreur critique lors de l'analyse:", err);
        
        if (isMounted) {
          setError("Une erreur est survenue. Finalisation de votre profil...");
          setProgress(100); // Forcer la progression
        }
        
        // Récupération rapide en cas d'erreur
        setTimeout(() => {
          if (!isMounted) return;
          
          if (onAnalysisComplete && !window.IKIGAI_ANALYSIS_COMPLETING) {
            window.IKIGAI_ANALYSIS_COMPLETING = true;
            // Utiliser les réponses disponibles ou un objet minimal
            const fallbackResponses = responses || { recoveryMode: true, timestamp: new Date().toISOString() };
            onAnalysisComplete(fallbackResponses);
          } else if (!onAnalysisComplete) {
            window.location.href = '/'; // Redirection de secours
          }
        }, 800);
      }
    };
    
    // Démarrer l'analyse
    performAnalysis();
    
    // Nettoyage à la démontage du composant
    return () => {
      isMounted = false;
      // Nettoyer toutes les ressources
      [checkInterval, safetyTimeout, completionTimeout, forceTimeout].forEach(timer => {
        if (timer) clearTimeout(timer);
      });
      
      console.log("Nettoyage des ressources de l'analyse");
      // Réinitialiser le flag d'analyse
      window.IKIGAI_ANALYSIS_PERFORMING = false;
    };
  }, []); // Dépendance vide pour n'exécuter qu'une seule fois

  // Composant pour les particules flottantes
  const FloatingParticles = () => {
    const particles = Array.from({ length: 20 }, (_, i) => i);
    const emojis = ['✨', '💫', '⭐', '🌈', '🔮', '💭', '🌱', '🌺', '🍀', '🦋'];
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((i) => {
          // Position et timing aléatoires
          const randomX = Math.random() * 100;
          const randomY = Math.random() * 100;
          const randomDuration = 5 + Math.random() * 10;
          const randomDelay = Math.random() * 5;
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
          const randomScale = 0.5 + Math.random();
          
          return (
            <motion.div
              key={i}
              className="absolute text-xl opacity-50"
              initial={{ 
                x: `${randomX}%`, 
                y: `${randomY}%`,
                opacity: 0,
                scale: 0
              }}
              animate={{ 
                x: [`${randomX}%`, `${randomX + (Math.random() * 20 - 10)}%`],
                y: [`${randomY}%`, `${randomY - 20}%`],
                opacity: [0, 0.3, 0],
                scale: [0, randomScale, 0]
              }}
              transition={{ 
                duration: randomDuration, 
                delay: randomDelay,
                repeat: Infinity,
                repeatType: "loop"
              }}
            >
              {randomEmoji}
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Notifier au montage que la page d'analyse est visible
  useEffect(() => {
    console.log("OnboardingAnalysisPage: Composant monté et visible");
    window.IKIGAI_ANALYSIS_ACTIVE = true;
    
    try {
      localStorage.setItem('ikigai_analysis_active', 'true');
      localStorage.setItem('ikigai_analysis_timestamp', new Date().toISOString());
    } catch (e) {
      console.warn("Impossible d'enregistrer l'état d'analyse dans localStorage:", e);
    }
    
    return () => {
      console.log("OnboardingAnalysisPage: Composant démonté");
      window.IKIGAI_ANALYSIS_ACTIVE = false;
      localStorage.removeItem('ikigai_analysis_active');
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-white to-blue-50 z-50 analysis-page-container">
      {/* Arrière-plan avec particules */}
      {showParticles && <FloatingParticles />}
      
      <motion.div 
        className="max-w-md w-full p-6 rounded-3xl bg-white shadow-xl relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)"
        }}
        transition={{ duration: 0.5 }}
      >
        {/* Effet de lumière radiale */}
        <div className="absolute inset-0 bg-gradient-to-tr from-green-50 via-blue-50 to-purple-50 opacity-50" />
        
        <div className="text-center mb-8 relative z-10">
          <motion.div 
            className="inline-block"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.div 
              className="flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 rounded-full w-20 h-20 mx-auto mb-6 text-white relative overflow-hidden"
              animate={{
                boxShadow: [
                  "0px 0px 20px rgba(103, 232, 249, 0.3)",
                  "0px 0px 30px rgba(103, 232, 249, 0.6)",
                  "0px 0px 20px rgba(103, 232, 249, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Cercles animés à l'intérieur de l'icône */}
              <motion.div
                className="absolute inset-0 opacity-30 bg-white rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              
              <motion.span 
                className="text-3xl relative z-10"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1] 
                }}
                transition={{ 
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, repeatType: "reverse" }
                }}
              >
                🧠
              </motion.span>
            </motion.div>
          </motion.div>
          
          <motion.h2 
            className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500"
            animate={{ 
              scale: [1, 1.03, 1],
              opacity: [0.9, 1, 0.9]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Analyse en cours
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 mb-6 max-w-sm mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Notre IA analyse vos réponses pour créer votre expérience IKIGAI personnalisée
          </motion.p>

          {/* Carte d'explication du processus */}
          <motion.div 
            className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-2xl mb-6 text-left shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="font-medium text-blue-700 mb-2 flex items-center">
              <motion.span 
                className="mr-2 text-xl inline-block"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                ✨
              </motion.span>
              Création de votre parcours personnalisé
            </h3>
            <p className="text-sm text-blue-600">
              Nous analysons vos réponses pour vous proposer des recommandations adaptées à vos besoins, 
              objectifs et préférences. Votre parcours IKIGAI sera entièrement personnalisé pour maximiser 
              votre bien-être et votre développement personnel.
            </p>
          </motion.div>
          
          {/* Étape actuelle de l'analyse avec animation de transition */}
          <div className="h-8 mb-4 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-base font-medium flex items-center justify-center text-blue-600 absolute inset-0"
              >
                <motion.span
                  className="mr-2 text-xl"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 1, repeat: 3 }}
                >
                  {analysisSteps[currentStep].icon}
                </motion.span>
                {analysisSteps[currentStep].text}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Barre de progression améliorée */}
          <div className="w-full h-3 bg-gray-100 rounded-full mb-4 overflow-hidden shadow-inner">
            <motion.div 
              className="h-full rounded-full relative"
              style={{ 
                background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)", 
                backgroundSize: "200% 100%",
                width: `${progress}%`
              }}
              animate={{ 
                backgroundPosition: ["0% 0%", "100% 0%"], 
                width: `${progress}%`
              }}
              transition={{ 
                backgroundPosition: { duration: 3, repeat: Infinity, repeatType: "reverse" },
                width: { duration: 0.5, ease: "easeOut" }
              }}
            >
              {/* Lueur sur la barre de progression */}
              <motion.div 
                className="absolute top-0 h-full w-5 bg-white"
                style={{ 
                  filter: "blur(6px)",
                  opacity: 0.5,
                  left: "100%" 
                }}
                animate={{ x: [-40, 0] }}
                transition={{ 
                  duration: 0.6, 
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              />
            </motion.div>
          </div>
          
          {/* Pourcentage de progression */}
          <motion.div 
            className="text-base font-medium"
            style={{ 
              background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
            animate={{ scale: progress === 100 ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.5 }}
          >
            {progress}% complété
          </motion.div>
          
          {/* Affichage des erreurs */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 text-sm font-medium text-red-500 bg-red-50 p-3 rounded-lg"
              >
                <span className="mr-2">⚠️</span>
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Animation des éléments en rotation */}
        <div className="flex justify-center mt-6 mb-4 relative z-10">
          <motion.div
            animate={{
              rotate: [0, 180],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className="relative w-12 h-12"
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2"
                initial={{
                  x: "-50%",
                  y: "-50%",
                }}
                animate={{
                  x: `-50%`,
                  y: `-50%`,
                  rotate: (i * 60) + [0, 40, 0],
                }}
                transition={{
                  rotate: {
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: i * 0.2,
                  }
                }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ 
                    backgroundColor: `hsl(${(i * 60) % 360}, 80%, 60%)`,
                    transformOrigin: "center center",
                    y: "-20px"
                  }}
                  animate={{
                    opacity: [0.2, 1, 0.2],
                    scale: [0.8, 1.5, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingAnalysisPage;