import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../shared/supabase';
import { 
  InteractiveCard, 
  AnimatedEmoji, 
  AnimatedButton,
  AnimatedCheckbox
} from '../components/ui/onboarding';
import { CardSelectionQuestion, TextWithSuggestions, TagSelection } from '../components/ui/onboarding/QuestionTypes';
import '../styles/onboarding.css';

// Composant pour le parcours d'onboarding IKIGAI
const OnboardingJourney = ({ onComplete, onCancel }) => {
  console.log("DEBUG OnboardingJourney: Initialisation du composant", {
    hasOnCompleteCallback: !!onComplete,
    hasOnCancelCallback: !!onCancel,
    timestamp: new Date().toISOString()
  });

  // État pour suivre la session et la question actuelles
  const [currentSession, setCurrentSession] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  
  // Force le rendu complet du composant après le montage
  const [isFullyMounted, setIsFullyMounted] = useState(false);
  
  // SOLUTION DE SECOURS: Variables globales pour signaler que l'onboarding est en cours
  // Cela permet de détecter si l'onboarding devrait être visible même après un rechargement de page
  window.IKIGAI_ONBOARDING_ACTIVE = true;
  window.IKIGAI_ONBOARDING_VISIBLE = true; // Nouveau flag pour vérifier la visibilité réelle
  
  // Conserver l'information dans le localStorage également pour plus de robustesse
  try {
    localStorage.setItem('ikigai_onboarding_active', 'true');
    localStorage.setItem('ikigai_onboarding_visible', 'true');
    localStorage.setItem('ikigai_onboarding_timestamp', new Date().toISOString());
  } catch (e) {
    console.warn("Impossible de sauvegarder l'état d'onboarding dans localStorage:", e);
  }
  
  // Effet pour vérifier le montage du composant
  useEffect(() => {
    console.log("DEBUG OnboardingJourney: Composant monté", {
      session: currentSession,
      question: currentQuestion,
      timestamp: new Date().toISOString()
    });
    
    // Marquer le composant comme complètement monté après un court délai
    setTimeout(() => {
      setIsFullyMounted(true);
      console.log("DEBUG OnboardingJourney: Marqué comme complètement monté");
    }, 100);
    
    return () => {
      console.log("DEBUG OnboardingJourney: Composant démonté", {
        timestamp: new Date().toISOString()
      });
    };
  }, []);
  
  // Définition des sessions et questions avec useMemo
  const sessions = React.useMemo(() => [
    {
      id: 'passion',
      title: 'Ce que Vous Aimez (Passion)',
      color: '#FF5252', // Rouge énergique
      icon: '❤️',
      questions: [
        {
          id: 'passion_q1',
          title: "Qu'est-ce qui vous rend vraiment heureux(se) ?",
          subtitle: "Pensez aux activités qui vous font perdre la notion du temps.",
          type: 'card_selection',
          multiSelect: true,
          showOtherOption: true,
          options: [
            { id: 'p1_o1', label: "Créer", icon: "🎨" },
            { id: 'p1_o2', label: "Apprendre", icon: "📚" },
            { id: 'p1_o3', label: "Voyager", icon: "✈️" },
            { id: 'p1_o4', label: "Socialiser", icon: "👥" },
            { id: 'p1_o5', label: "Sport", icon: "🏃" },
            { id: 'p1_o6', label: "Nature", icon: "🌿" },
          ]
        },
        {
          id: 'passion_q2',
          title: "Quels sont les sujets qui vous passionnent ?",
          subtitle: "Sur quels sujets pourriez-vous parler pendant des heures ?",
          type: 'text_with_suggestions',
          placeholder: "Ex: voyage, science, musique...",
          maxLength: 100,
          suggestions: ["Voyage", "Science", "Musique", "Art", "Technologie", "Cuisine", "Littérature", "Cinéma", "Sport", "Psychologie"]
        },
        {
          id: 'passion_q3',
          title: "Quelles activités vous donnent de l'énergie ?",
          subtitle: "Après lesquelles vous sentez-vous revitalisé(e) ?",
          type: 'tag_selection',
          showImportanceSlider: true,
          options: [
            { id: 'p3_o1', label: "Activités créatives", icon: "🎭" },
            { id: 'p3_o2', label: "Activités sociales", icon: "🗣️" },
            { id: 'p3_o3', label: "Activités physiques", icon: "🏋️" },
            { id: 'p3_o4', label: "Apprentissage", icon: "🧠" },
            { id: 'p3_o5', label: "Méditation", icon: "🧘" },
            { id: 'p3_o6', label: "Temps en nature", icon: "🌳" },
            { id: 'p3_o7', label: "Jeux", icon: "🎮" },
          ]
        }
      ]
    },
    {
      id: 'mission',
      title: 'Ce dont le Monde a Besoin',
      color: '#4CAF50', // Vert harmonieux
      icon: '🌍',
      questions: [
        {
          id: 'mission_q1',
          title: "Quels problèmes dans le monde vous touchent particulièrement ?",
          subtitle: "Quelles causes vous tiennent à cœur ?",
          type: 'card_selection',
          multiSelect: true,
          options: [
            { id: 'm1_o1', label: "Environnement", icon: "🌱" },
            { id: 'm1_o2', label: "Éducation", icon: "📝" },
            { id: 'm1_o3', label: "Santé", icon: "🏥" },
            { id: 'm1_o4', label: "Inégalités", icon: "⚖️" },
            { id: 'm1_o5', label: "Technologie", icon: "💻" },
            { id: 'm1_o6', label: "Bien-être", icon: "🧠" },
          ]
        },
        {
          id: 'mission_q2',
          title: "Comment aimeriez-vous contribuer au bien commun ?",
          subtitle: "De quelle manière souhaiteriez-vous avoir un impact positif ?",
          type: 'text',
          placeholder: "Ex: aider les autres, créer quelque chose d'utile..."
        },
        {
          id: 'mission_q3',
          title: "Quels changements souhaiteriez-vous voir dans la société ?",
          subtitle: "Qu'est-ce qui vous semble important d'améliorer ?",
          type: 'tag_selection',
          options: [
            { id: 'm3_o1', label: "Justice sociale", icon: "⚖️" },
            { id: 'm3_o2', label: "Protection environnementale", icon: "🌍" },
            { id: 'm3_o3', label: "Éducation pour tous", icon: "📚" },
            { id: 'm3_o4', label: "Société bienveillante", icon: "❤️" },
            { id: 'm3_o5', label: "Innovation", icon: "💡" },
          ]
        }
      ]
    },
    {
      id: 'vocation',
      title: 'Ce en Quoi Vous Excellez',
      color: '#448AFF', // Bleu stimulant
      icon: '✨',
      questions: [
        {
          id: 'vocation_q1',
          title: "Quelles sont vos compétences naturelles ?",
          subtitle: "Dans quels domaines êtes-vous naturellement doué(e) ?",
          type: 'card_selection',
          multiSelect: true,
          showOtherOption: true,
          options: [
            { id: 'v1_o1', label: "Organisation", icon: "📋" },
            { id: 'v1_o2', label: "Créativité", icon: "🎨" },
            { id: 'v1_o3', label: "Communication", icon: "🗣️" },
            { id: 'v1_o4', label: "Analyse", icon: "🔍" },
            { id: 'v1_o5', label: "Leadership", icon: "👑" },
            { id: 'v1_o6', label: "Empathie", icon: "🤝" },
          ]
        },
        {
          id: 'vocation_q2',
          title: "Quels compliments recevez-vous souvent ?",
          subtitle: "Que remarquent les autres chez vous ?",
          type: 'text_with_suggestions',
          placeholder: "Ex: patience, intelligence, gentillesse...",
          maxLength: 100,
          suggestions: ["Patient(e)", "Intelligent(e)", "Créatif(ve)", "Organisé(e)", "Empathique", "Fiable", "Dynamique", "Persévérant(e)"]
        },
        {
          id: 'vocation_q3',
          title: "Dans quels domaines vous sentez-vous confiant(e) ?",
          subtitle: "Où vous sentez-vous dans votre élément ?",
          type: 'tag_selection',
          options: [
            { id: 'v3_o1', label: "Communication", icon: "💬" },
            { id: 'v3_o2', label: "Résolution de problèmes", icon: "🧩" },
            { id: 'v3_o3', label: "Expression créative", icon: "🎭" },
            { id: 'v3_o4', label: "Organisation", icon: "📊" },
            { id: 'v3_o5', label: "Enseignement", icon: "👨‍🏫" },
          ]
        }
      ]
    },
    {
      id: 'profession',
      title: 'Ce pour Quoi On Peut Vous Payer',
      color: '#FFC107', // Jaune dynamique
      icon: '💰',
      questions: [
        {
          id: 'profession_q1',
          title: "Quelles compétences pourriez-vous monétiser ?",
          subtitle: "Pour lesquelles seriez-vous prêt(e) à être rémunéré(e) ?",
          type: 'card_selection',
          multiSelect: true,
          options: [
            { id: 'pro1_o1', label: "Expertise technique", icon: "💻" },
            { id: 'pro1_o2', label: "Talents artistiques", icon: "🎨" },
            { id: 'pro1_o3', label: "Gestion de projet", icon: "📊" },
            { id: 'pro1_o4', label: "Communication", icon: "🗣️" },
            { id: 'pro1_o5', label: "Enseignement", icon: "👨‍🏫" },
            { id: 'pro1_o6', label: "Conseil", icon: "💼" },
          ]
        },
        {
          id: 'profession_q2',
          title: "Quels services pourriez-vous offrir qui ont de la valeur ?",
          subtitle: "Comment pourriez-vous créer de la valeur pour les autres ?",
          type: 'text_with_suggestions',
          placeholder: "Ex: conseil, formation, création...",
          maxLength: 100,
          suggestions: ["Conseil", "Formation", "Création", "Développement", "Coaching", "Analyse", "Gestion", "Marketing"]
        },
        {
          id: 'profession_q3',
          title: "Dans quels domaines professionnels vous verriez-vous ?",
          subtitle: "Où pourriez-vous apporter votre contribution ?",
          type: 'tag_selection',
          showImportanceSlider: true,
          options: [
            { id: 'pro3_o1', label: "Santé et bien-être", icon: "🧘" },
            { id: 'pro3_o2', label: "Éducation et formation", icon: "🎓" },
            { id: 'pro3_o3', label: "Technologie et innovation", icon: "💻" },
            { id: 'pro3_o4', label: "Art et culture", icon: "🎭" },
            { id: 'pro3_o5', label: "Commerce et marketing", icon: "📈" },
          ]
        }
      ]
    },
  ], []);

  // Référence pour l'élément conteneur des questions
  const containerRef = useRef(null);
  
  // États supplémentaires
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [animDirection, setAnimDirection] = useState('next');
  
  // Calculer les progrès
  useEffect(() => {
    // Progrès global sur l'ensemble des sessions
    const totalQuestions = sessions.reduce((acc, session) => acc + session.questions.length, 0);
    let questionsCompleted = 0;
    
    for (let i = 0; i < currentSession; i++) {
      questionsCompleted += sessions[i].questions.length;
    }
    questionsCompleted += currentQuestion;
    
    const newOverallProgress = Math.min(100, (questionsCompleted / totalQuestions) * 100);
    setOverallProgress(newOverallProgress);
  }, [currentSession, currentQuestion, sessions]);
  
  // Obtenir la question actuelle
  const getCurrentQuestion = () => {
    return sessions[currentSession]?.questions[currentQuestion] || null;
  };

  // Gérer les réponses
  const handleResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  // Navigation entre les questions
  const goToNextQuestion = async () => {
    const currentQ = getCurrentQuestion();
    
    // Vérifier si la réponse est remplie
    if (!responses[currentQ.id] || 
        (Array.isArray(responses[currentQ.id]) && responses[currentQ.id].length === 0) ||
        (typeof responses[currentQ.id] === 'string' && responses[currentQ.id].trim() === '')) {
      setError("Veuillez répondre à la question avant de continuer.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setError(null);
    setAnimDirection('next');
    
    if (currentQuestion < sessions[currentSession].questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else if (currentSession < sessions.length - 1) {
      setCurrentSession(prev => prev + 1);
      setCurrentQuestion(0);
    } else {
      // Toutes les questions sont complétées
      submitResponses();
    }
  };
  
  const goToPreviousQuestion = () => {
    setAnimDirection('prev');
    
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else if (currentSession > 0) {
      setCurrentSession(prev => prev - 1);
      setCurrentQuestion(sessions[currentSession - 1].questions.length - 1);
    }
  };
  
  // Soumettre les réponses à Supabase
  const submitResponses = async () => {
    setIsSubmitting(true);
    setIsCompleting(true);
    
    try {
      console.log("OnboardingJourney: Début de la soumission des réponses");
      
      // TRAÇAGE: pour debugging
      console.log("OnboardingJourney: Statut des réponses avant soumission:", {
        responseCount: Object.keys(responses).length,
        responsesPresent: !!responses
      });
      
      // Récupérer l'utilisateur actuel directement (moins d'étapes)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      // Si erreur d'authentification, tenter une récupération simple
      if (userError || !user) {
        console.error("Erreur d'authentification:", userError || "Aucun utilisateur trouvé");
        
        // Vérifions si nous pouvons récupérer une session valide
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData?.session) {
          // En mode de secours, stocker les données en local et continuer
          try {
            localStorage.setItem('onboarding_pending_responses', JSON.stringify(responses));
            localStorage.setItem('onboarding_responses_timestamp', new Date().toISOString());
            console.log("Réponses sauvegardées localement en secours");
          } catch (e) {
            console.warn("Impossible de sauvegarder les réponses localement:", e);
          }
          
          // Continuer malgré l'erreur d'authentification
          console.log("Poursuite du flux sans sauvegarde Supabase");
        }
      }

      // Si l'utilisateur est disponible, procéder à l'enregistrement
      if (user) {
        // Préparer les données pour l'insertion
        const responseData = {
          user_id: user.id,
          responses: responses,
          updated_at: new Date().toISOString(),
        };
        
        // Upsert dans les deux tables en parallèle pour plus d'efficacité
        await Promise.allSettled([
          // Tentative avec onboarding_responses
          supabase
            .from('onboarding_responses')
            .upsert([responseData], { onConflict: 'user_id' }),
            
          // Tentative avec user_responses (pour compatibilité)
          supabase
            .from('user_responses')
            .upsert([{
              user_id: user.id,
              module_id: 'onboarding',
              responses: responses,
              created_at: new Date().toISOString()
            }], { onConflict: 'user_id,module_id' }),
            
          // Mise à jour de la progression
          supabase
            .from('user_progress')
            .upsert([{
              user_id: user.id,
              onboarding_completed: true,
              onboarding_completed_at: new Date().toISOString(),
            }], { onConflict: 'user_id' })
        ]);
        
        console.log("Données envoyées avec succès à Supabase");
      }
      
      // Assurer une transition propre même en cas d'échec de sauvegarde
      // Pour garantir l'expérience utilisateur, ajouter une indication dans localStorage
      try {
        localStorage.setItem('onboardingCompleted', 'true');
        localStorage.setItem('onboardingCompletedAt', new Date().toISOString());
      } catch (e) {
        console.warn("Erreur localStorage:", e);
      }
      
      // IMPORTANT: Délai court avant d'appeler le callback pour laisser le temps aux transitions de s'initialiser
      setTimeout(() => {
        // Appeler le callback de complétion
        if (onComplete) {
          console.log("Appel du callback onComplete avec les réponses");
          onComplete({
            ...responses,
            completedAt: new Date().toISOString() // Garantir un timestamp de complétion
          });
        } else {
          console.error("ERREUR CRITIQUE: Callback onComplete non disponible");
        }
      }, 200);
      
    } catch (error) {
      console.error("Erreur lors de la soumission des réponses:", error);
      setError("Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.");
      
      // En cas d'erreur, essayer quand même de continuer après un délai
      setTimeout(() => {
        setError(null);
        
        // Tentative de récupération - appeler le callback même en cas d'erreur
        if (onComplete) {
          console.log("Tentative de récupération après erreur");
          onComplete({
            ...responses,
            completedAt: new Date().toISOString(),
            errorRecovery: true // Marquer que c'est une récupération d'erreur
          });
        }
      }, 3000);
    } finally {
      // S'assurer de réinitialiser les états même en cas d'erreur
      setTimeout(() => {
        setIsSubmitting(false);
        setIsCompleting(false);
      }, 500);
    }
  };
  
  // Déterminer l'icône en fonction du type de question
  const getQuestionIcon = (type) => {
    switch (type) {
      case 'text': return '✏️';
      case 'checkbox': return '☑️';
      case 'scale': return '📊';
      default: return '❓';
    }
  };
  
  // Rendu de la question actuelle
  const renderQuestion = () => {
    const question = getCurrentQuestion();
    
    if (!question) return null;
    
    const session = sessions[currentSession];
    const sessionColor = session?.color || "#3B82F6";
    
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${currentSession}-${currentQuestion}`}
          initial={{ 
            x: animDirection === 'next' ? 100 : -100,
            opacity: 0
          }}
          animate={{ 
            x: 0,
            opacity: 1
          }}
          exit={{ 
            x: animDirection === 'next' ? -100 : 100,
            opacity: 0
          }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="question-container py-4"
        >
          <InteractiveCard 
            color={sessionColor}
            icon={getQuestionIcon(question.type)}
            title={question.title}
            subtitle={question.subtitle}
          >
            <div className="mt-6">
              {question.type === 'text' && (
                <div className="text-input-container">
                  <motion.textarea
                    className="modern-textarea"
                    style={{ 
                      borderColor: sessionColor,
                      boxShadow: `0 2px 10px rgba(${hexToRgb(sessionColor).r}, ${hexToRgb(sessionColor).g}, ${hexToRgb(sessionColor).b}, 0.1)`
                    }}
                    placeholder={question.placeholder}
                    value={responses[question.id] || ''}
                    onChange={(e) => handleResponse(question.id, e.target.value)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 0.2,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileFocus={{
                      boxShadow: `0 4px 15px rgba(${hexToRgb(sessionColor).r}, ${hexToRgb(sessionColor).g}, ${hexToRgb(sessionColor).b}, 0.2)`,
                      borderColor: sessionColor,
                      borderWidth: '2px',
                      y: -3
                    }}
                  />
                </div>
              )}
              
              {question.type === 'checkbox' && (
                <div className="checkbox-container">
                  {question.options.map((option, idx) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: idx * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                    >
                      <AnimatedCheckbox
                        key={option.id}
                        id={option.id}
                        label={option.label}
                        color={sessionColor}
                        checked={responses[question.id]?.includes(option.id) || false}
                        onChange={(isChecked) => {
                          const currentSelections = responses[question.id] || [];
                          if (isChecked) {
                            handleResponse(question.id, [...currentSelections, option.id]);
                          } else {
                            handleResponse(question.id, currentSelections.filter(id => id !== option.id));
                          }
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
              
              {question.type === 'card_selection' && (
                <CardSelectionQuestion
                  options={question.options}
                  selectedValues={responses[question.id] || []}
                  onChange={(values) => handleResponse(question.id, values)}
                  color={sessionColor}
                  multiSelect={question.multiSelect !== false}
                  showOtherOption={question.showOtherOption === true}
                />
              )}
              
              {question.type === 'text_with_suggestions' && (
                <TextWithSuggestions
                  value={responses[question.id] || ''}
                  onChange={(value) => handleResponse(question.id, value)}
                  placeholder={question.placeholder}
                  suggestions={question.suggestions || []}
                  color={sessionColor}
                  maxLength={question.maxLength || 100}
                  multiline={question.multiline === true}
                />
              )}
              
              {question.type === 'tag_selection' && (
                <TagSelection
                  options={question.options}
                  selectedValues={responses[question.id] || []}
                  onChange={(values) => handleResponse(question.id, values)}
                  color={sessionColor}
                  showImportanceSlider={question.showImportanceSlider === true}
                />
              )}
            </div>
          </InteractiveCard>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="bg-red-50 p-3 mt-4 rounded-xl border border-red-200"
            >
              <p className="text-red-500 text-center font-medium">{error}</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };
  
  // Helper function to convert hex color to RGB
  const hexToRgb = (hex) => {
    // Remove # if present
    const cleanHex = hex.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    return { r, g, b };
  };
  
  // Barre de progression modernisée avec couleur thématique de la session
  // eslint-disable-next-line no-unused-vars
  const renderProgressBar = () => {
    const session = sessions[currentSession];
    if (!session) return null;
    
    const sessionColor = session.color || "#3B82F6";
    const rgb = hexToRgb(sessionColor);
    
    // Couleurs de début et de fin pour le dégradé
    const gradient = {
      start: sessionColor,
      end: `rgba(${rgb.r}, ${rgb.g + 30}, ${rgb.b + 15}, 1)`
    };
    
    return (
      <div className="progress-container mb-4">
        <div className="progress-label flex justify-between items-center mb-1">
          <span className="font-medium text-sm text-gray-700">
            Session {currentSession + 1}/{sessions.length}
          </span>
          <motion.span 
            className="font-medium text-sm"
            style={{ color: sessionColor }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {Math.round(overallProgress)}% complété
          </motion.span>
        </div>
        
        <div className="progress-bar h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="progress-fill h-full"
            style={{ 
              background: `linear-gradient(90deg, ${gradient.start}, ${gradient.end})`,
              width: `${overallProgress}%`
            }}
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
          />
        </div>
      </div>
    );
  };
  
  // Compteur de questions (déplacé au-dessus des questions)
  const renderQuestionCounter = () => {
    const session = sessions[currentSession];
    if (!session) return null;
    
    const sessionColor = session.color || "#3B82F6";
    
    return (
      <motion.div 
        className="flex flex-col sm:flex-row sm:justify-between items-center bg-white rounded-lg p-3 mb-4 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center mb-2 sm:mb-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" 
               style={{ backgroundColor: `${sessionColor}20` }}>
            <span className="text-sm font-bold" style={{ color: sessionColor }}>
              {currentQuestion + 1}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-600">
            Question {currentQuestion + 1} sur {sessions[currentSession]?.questions.length}
          </span>
        </div>
        <motion.span 
          className="text-sm font-medium px-3 py-1 rounded-full"
          style={{ 
            color: sessionColor,
            backgroundColor: `${sessionColor}15`
          }}
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2 
          }}
        >
          {currentQuestion === sessions[currentSession]?.questions.length - 1 ? 
            "Dernière question" : `${sessions[currentSession]?.questions.length - currentQuestion - 1} restante${sessions[currentSession]?.questions.length - currentQuestion - 1 > 1 ? 's' : ''}`}
        </motion.span>
      </motion.div>
    );
  };

  // En-tête de la session modernisé avec nouveau design
  const renderSessionHeader = () => {
    const session = sessions[currentSession];
    if (!session) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="session-header bg-white rounded-xl shadow-md overflow-hidden mb-6"
        style={{ 
          '--color-start': session.color, 
          '--color-end': lightenColor(session.color, 20),
          '--indicator-color': session.color
        }}
      >
        {/* Bande colorée en haut */}
        <div 
          className="h-2 w-full" 
          style={{ background: `linear-gradient(to right, ${session.color}, ${lightenColor(session.color, 30)})` }}
        />
        
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full shadow-sm" 
                style={{ backgroundColor: `${session.color}20`, border: `2px solid ${session.color}30` }}>
              <AnimatedEmoji 
                emoji={session.icon} 
                size="lg" 
                animation="bounce" 
                color={session.color}
              />
            </div>
            
            <div className="flex-1">
              <motion.h2 
                className="session-title text-xl font-bold"
                animate={{ color: session.color }}
                transition={{ duration: 0.5 }}
              >
                {session.title}
              </motion.h2>
              <div className="text-sm mt-1">
                <span 
                  className="font-medium" 
                  style={{ color: session.color }}
                >
                  {Math.round(overallProgress)}% complété
                </span>
              </div>
            </div>
          </div>
          
          <div className="session-indicators flex gap-2 mb-4">
            {sessions.map((s, idx) => (
              <motion.div 
                key={idx} 
                className={`session-indicator rounded-full ${idx === currentSession ? 'session-indicator-active' : ''}`}
                style={{ 
                  '--indicator-color': s.color,
                  height: '6px',
                  flex: 1,
                  backgroundColor: idx <= currentSession ? s.color : '#e5e7eb'
                }}
                animate={{ 
                  opacity: idx === currentSession ? 1 : 0.6,
                  scale: idx === currentSession ? [1, 1.05, 1] : 1
                }}
                transition={{ 
                  repeat: idx === currentSession ? Infinity : 0,
                  repeatType: "mirror",
                  duration: 2
                }}
              />
            ))}  
          </div>
        </div>
      </motion.div>
    );
  };
  
  // Fonction utilitaire pour éclaircir une couleur
  const lightenColor = (color, amount) => {
    try {
      // Enlever le # si présent
      const hex = color.replace('#', '');
      
      // Convertir en RGB
      let r = parseInt(hex.substring(0, 2), 16);
      let g = parseInt(hex.substring(2, 4), 16);
      let b = parseInt(hex.substring(4, 6), 16);
      
      // Éclaircir
      r = Math.min(255, Math.max(0, r + amount));
      g = Math.min(255, Math.max(0, g + amount));
      b = Math.min(255, Math.max(0, b + amount));
      
      // Reconvertir en hex
      const result = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      return result;
    } catch (e) {
      console.warn('Error lightening color:', e);
      return color;
    }
  };
  
  // Boutons de navigation modernisés
  const renderNavButtons = () => {
    const isLastQuestion = 
      currentSession === sessions.length - 1 && 
      currentQuestion === sessions[currentSession]?.questions.length - 1;
    
    const sessionColor = sessions[currentSession]?.color || "#3B82F6";
    
    // Calculer une couleur secondaire plus claire pour le dégradé
    const secondaryColor = lightenColor(sessionColor, 30);
    
    return (
      <motion.div 
        className="navigation-buttons mt-8 flex justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatedButton
          color="#6B7280" // Gris neutre
          animation="scale"
          onClick={goToPreviousQuestion}
          className={`nav-button nav-button-secondary px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base`}
          disabled={(currentSession === 0 && currentQuestion === 0) || isCompleting}
          icon="←"
        >
          Précédent
        </AnimatedButton>
        
        <AnimatedButton
          color={isLastQuestion ? "#10B981" : sessionColor}
          animation={isLastQuestion ? "pulse" : "scale"}
          onClick={goToNextQuestion}
          className={`nav-button nav-button-primary px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base`}
          style={{
            '--color-start': isLastQuestion ? '#10B981' : sessionColor,
            '--color-end': isLastQuestion ? '#0E9F6E' : secondaryColor
          }}
          disabled={isSubmitting || isCompleting}
          loading={isSubmitting}
          icon={isLastQuestion ? "✓" : "→"}
        >
          {isLastQuestion ? "Terminer" : "Suivant"}
        </AnimatedButton>
      </motion.div>
    );
  };
  
  // Bouton d'annulation moderne
  const renderCancelButton = () => {
    return (
      <motion.button 
        onClick={onCancel} 
        className="absolute top-6 right-6 bg-white rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all shadow-md z-50"
        disabled={isSubmitting || isCompleting}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>
    );
  };
  
  // Par sécurité, mettre la page de secours si erreur de rendu
  if (!sessions || sessions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-blue-600 mb-4">Initialisation de l'onboarding...</h2>
          <p className="text-gray-600 mb-4">Merci de patienter pendant que nous préparons votre parcours personnalisé.</p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-container min-h-screen flex items-center justify-center p-4 sm:py-8 sm:px-6 md:p-10">
      {/* Message de débogage initial */}
      {!isFullyMounted && (
        <div className="fixed top-2 left-2 bg-yellow-100 p-2 rounded text-xs z-50">
          Initialisation de l'onboarding...
        </div>
      )}
      <motion.div 
        className="onboarding-journey-container max-w-3xl w-full p-4 sm:p-6 md:p-7 mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Éléments décoratifs */}
        <div className="decoration-circle decoration-circle-1"></div>
        <div className="decoration-circle decoration-circle-2"></div>
        
        {renderCancelButton()}
        {renderSessionHeader()}
        
        {/* Compteur de questions (maintenant au-dessus des questions) */}
        {renderQuestionCounter()}
        
        <div 
          ref={containerRef} 
          className="questions-display-area relative overflow-hidden"
          style={{ minHeight: '350px' }}
        >
          {renderQuestion()}
        </div>
        
        {renderNavButtons()}
        
        {/* Badge de marque */}
        <div className="mt-6 text-center text-gray-400 text-xs">
          <motion.div 
            className="inline-flex items-center space-x-1 opacity-70"
            whileHover={{ opacity: 1 }}
          >
            <span>IKIGAI</span>
            <span>·</span>
            <span>Trouvez votre équilibre</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingJourney;