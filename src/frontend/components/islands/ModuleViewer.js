import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Character from '../ui/Character';
import Button from '../ui/Button';
import Quiz from './Quiz';
import StorageService from '../../../backend/services/StorageService';

const ModuleViewer = ({ module, onClose, onComplete, isCompleted, islandId, islandData }) => {
  const [currentStep, setCurrentStep] = useState(0); 
  const [showQuestions, setShowQuestions] = useState(false);
  const [responses, setResponses] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [characterEmotion, setCharacterEmotion] = useState("neutral");
  
  // Island data for character
  const color = islandData?.color || "#41D185";
  const character = islandData?.mascot || "🧘";
  
  // Load saved responses if any
  useEffect(() => {
    const loadResponses = async () => {
      try {
        const progress = await StorageService.getProgress();
        if (progress.moduleResponses && progress.moduleResponses[module.id]) {
          setResponses(progress.moduleResponses[module.id].responses || {});
        }
      } catch (error) {
        console.error("Erreur lors du chargement des réponses:", error);
        // Fallback sur localStorage en cas d'erreur
        const localProgress = StorageService.getProgressSync();
        if (localProgress.moduleResponses && localProgress.moduleResponses[module.id]) {
          setResponses(localProgress.moduleResponses[module.id].responses || {});
        }
      }
    };
    
    loadResponses();
  }, [module.id]);
  
  const handleChangeResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Make character react
    setCharacterEmotion("happy");
    setTimeout(() => setCharacterEmotion("neutral"), 1000);
  };
  
  const handleSubmit = async (isComplete = true) => {
    if (isComplete) {
      try {
        // Save responses and complete module
        await StorageService.saveModuleResponses(module.id, responses);
        onComplete(module.id, islandId);
        
        // Show completion animation
        setShowConfetti(true);
        setCharacterEmotion("excited");
        
        // Close after a delay
        setTimeout(() => {
          onClose();
        }, 3000);
      } catch (error) {
        console.error("Erreur lors de la sauvegarde des réponses:", error);
        // Fallback sur localStorage en cas d'erreur
        StorageService.saveModuleResponsesSync(module.id, responses);
        onComplete(module.id, islandId);
        
        // Show completion animation
        setShowConfetti(true);
        setCharacterEmotion("excited");
        
        // Close after a delay
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } else {
      // Move to next question
      setCurrentStep(prevStep => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setCurrentStep(prevStep => Math.max(0, prevStep - 1));
  };
  
  // Success view
  const renderSuccess = () => {
    return (
      <div className="text-center py-10">
        <div className="flex justify-center mb-4">
          <Character character={character} emotion="excited" size="text-6xl" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Module complété avec succès !</h3>
        <p className="text-gray-600 mb-6">
          Vous avez gagné {module.points} points et un nouveau badge.
        </p>
        <Button
          color={color}
          onClick={onClose}
          size="lg"
        >
          Retour aux modules
        </Button>
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{module.title}</h2>
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Module content */}
        <div className="p-6">
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(50)].map((_, i) => {
                const size = Math.random() * 8 + 2;
                const colors = [color, '#FFD700', '#FF6B6B', '#4EAAF0', '#41D185'];
                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `-${Math.random() * 20}%`,
                      width: size,
                      height: size,
                      backgroundColor: colors[Math.floor(Math.random() * colors.length)]
                    }}
                    animate={{
                      y: ['0%', '120%'],
                      rotate: [0, 360]
                    }}
                    transition={{
                      duration: Math.random() * 2 + 1,
                      ease: "easeOut",
                      delay: Math.random() * 0.5
                    }}
                  />
                );
              })}
            </div>
          )}
          
          {/* Character */}
          <div className="flex justify-center my-4">
            <Character character={character} emotion={characterEmotion} size="text-5xl" />
          </div>
          
          {showQuestions ? (
            isCompleted ? (
              renderSuccess()
            ) : (
              <Quiz 
                questions={module.questions || []}
                responses={responses}
                onChangeResponse={handleChangeResponse}
                onSubmit={handleSubmit}
                onBack={handleBack}
                currentStep={currentStep}
                totalSteps={module.questions?.length || 0}
                color={color}
                isCompleted={isCompleted}
              />
            )
          ) : (
            <>
              {/* Module content */}
              <div 
                className="bg-white p-4 rounded-xl mb-6" 
                dangerouslySetInnerHTML={{ __html: module.content }}
              />
              
              {/* Action buttons */}
              <div className="flex justify-center">
                {isCompleted ? (
                  <Button variant="secondary" onClick={onClose}>
                    Fermer
                  </Button>
                ) : (
                  <Button 
                    color={color} 
                    onClick={() => setShowQuestions(true)}
                    size="lg"
                  >
                    Commencer le questionnaire
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ModuleViewer;