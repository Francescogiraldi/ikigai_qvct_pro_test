import React, { useState, Suspense, Component, useEffect } from 'react';
import Logo from '../components/ui/Logo';
import Character from '../components/ui/Character';
import WellnessScore from '../components/ui/WellnessScore';
import StreakCounter from '../components/ui/StreakCounter';
import XPBar from '../components/ui/XPBar';
import IslandCard from '../components/islands/IslandCard';
import ChallengeCard from '../components/challenges/ChallengeCard';
import QuickExerciseCard from '../components/challenges/QuickExerciseCard';
import RecommendationsSection from '../components/recommendations/RecommendationsSection';
import ProfilePage from '../pages/ProfilePage';
import DailyFeeling from '../components/ui/DailyFeeling'; // Importer DailyFeeling
import ExerciseModal from '../components/ui/ExerciseModal'; // Importer la modale
import { AI_CONFIG } from '../../config';
import { supabase } from '../../shared/supabase';
// Suppression des imports non utilisés: motion et AnimatePresence

// Composant ErrorBoundary pour capturer les erreurs dans les composants enfants
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    console.error("ErrorBoundary a capturé une erreur:", error);
    // Mettre à jour l'état pour afficher le fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Vous pouvez aussi journaliser l'erreur
    console.error("ErrorBoundary - détails:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Vous pouvez afficher n'importe quelle UI de secours
      return this.props.fallback || <div>Une erreur est survenue.</div>;
    }

    return this.props.children;
  }
}

// Import du ChatBot avec API Gradio (avec lazy loading)
const ChatBot = React.lazy(() => import('../components/ui/ChatBot'));

const HomePage = ({ 
  progress, 
  islands, 
  exercises, 
  challenges, 
  onSelectIsland, 
  onCompleteChallenge, 
  onLogout, 
  userSettings, 
  onUpdateSettings 
}) => {
  const [activeTab, setActiveTab] = useState('discover');
  const [userFirstName, setUserFirstName] = useState('');
  const [userId, setUserId] = useState(null); // Ajouter un état pour userId
  const [selectedExercise, setSelectedExercise] = useState(null); // État pour l'exercice sélectionné
  const [isModalOpen, setIsModalOpen] = useState(false); // État pour la visibilité de la modale
  
  // Récupérer le prénom et l'ID de l'utilisateur depuis Supabase
  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (user.user_metadata && user.user_metadata.first_name) {
            setUserFirstName(user.user_metadata.first_name);
          }
          setUserId(user.id); // Stocker l'ID utilisateur
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des données utilisateur:', err);
      }
    };
    
    getUserData();
  }, []);
  
  // Callback pour gérer la soumission du sentiment quotidien (optionnel)
  const handleDailyFeelingSubmit = (value) => {
    console.log(`Sentiment quotidien soumis : ${value}`);
    // Vous pouvez ajouter ici une logique supplémentaire si nécessaire
    // Par exemple, mettre à jour le score de bien-être
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Ajouter le composant DailyFeeling ici */}
      <DailyFeeling userId={userId} onSubmit={handleDailyFeelingSubmit} />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center">
            <div className="bg-blue-50 px-3 py-1 rounded-full flex items-center mr-2">
              <span className="text-blue-600 font-bold mr-1">{progress?.totalPoints || 0}</span>
              <span className="text-blue-500 text-xs">pts</span>
            </div>
            
            <div className="flex items-center bg-orange-50 px-3 py-1 rounded-full">
              <span className="text-orange-500 mr-1">🔥</span>
              <span className="text-orange-600 font-bold">{progress?.streak || 0}</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Welcome greeting with wellness score */}
        <div className="mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {userFirstName ? `Bonjour ${userFirstName} !` : 'Bonjour !'}
                </h1>
                <p className="text-gray-600">Comment vous sentez-vous aujourd&apos;hui ?</p>
              </div>
              <Character character="🧘" emotion="happy" />
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <WellnessScore score={progress?.wellnessScore || 65} />
              <StreakCounter streak={progress?.streak || 0} />
              <XPBar points={progress?.totalPoints || 0} level={Math.floor((progress?.totalPoints || 0) / 500) + 1} />
            </div>
          </div>
        </div>
        
        {/* Tab navigation */}
        <div className="flex mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
          <button 
            className={`flex-1 py-3 font-medium text-center transition-colors ${activeTab === 'discover' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('discover')}
          >
            Découvrir
          </button>
          <button 
            className={`flex-1 py-3 font-medium text-center transition-colors ${activeTab === 'challenges' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('challenges')}
          >
            Défis
          </button>
          <button 
            className={`flex-1 py-3 font-medium text-center transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profil
          </button>
        </div>
        
        {/* Tab content */}
        {activeTab === 'discover' && (
          <div>
            {/* Featured content */}
            <div className="mb-8">
              <div 
                className="relative overflow-hidden rounded-2xl shadow-lg mb-6 flex items-end h-48 p-6"
                style={{ 
                  backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%), url('https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              >
                <div className="z-10 text-white">
                  <h2 className="text-xl font-bold mb-1">Parcourez les îles du bien-être</h2>
                  <p className="text-white text-opacity-80 mb-3">Découvrez les parcours thématiques pour améliorer votre équilibre</p>
                </div>
              </div>
            </div>
            
            {/* Recommandations personnalisées */}
            <RecommendationsSection onSelectModule={(module) => {
              // Trouver l'île correspondante et naviguer vers le module
              const island = islands.find(i => i.id === module.islandId);
              if (island) {
                onSelectIsland(island, module.id);
              }
            }} />
            
            {/* Islands */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">🏝️</span> 
                Parcours bien-être
              </h2>
              
              <div className="space-y-4">
                {islands.map((island, index) => {
                  const islandProgressData = progress?.islandProgress?.[island.id] || { progress: 0, completedModules: 0 };
                  
                  return (
                    <IslandCard 
                      key={island.id}
                      island={island}
                      progress={islandProgressData.progress || 0}
                      completedModules={islandProgressData.completedModules || 0}
                      isUnlocked={true} // All islands unlocked for demo
                      onClick={() => onSelectIsland(island)}
                    />
                  );
                })}
              </div>
            </div>
            
            {/* Quick exercises */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">⚡</span> 
                Exercices rapides
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                {exercises.map(exercise => (
                  <QuickExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onStart={() => {
                      setSelectedExercise(exercise); // Mettre à jour l'exercice sélectionné
                      setIsModalOpen(true); // Ouvrir la modale
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Afficher la modale si elle est ouverte */}
        {isModalOpen && selectedExercise && (
          <ExerciseModal
            exercise={selectedExercise}
            onClose={() => setIsModalOpen(false)} // Fonction pour fermer la modale
          />
        )}
        
        {/* Challenges tab */}
        {activeTab === 'challenges' && (
          <div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-5 text-white mb-6">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-2xl mr-3">
                  🔥
                </div>
                <div>
                  <h2 className="font-bold text-lg mb-1">Défis quotidiens</h2>
                  <p className="text-blue-100">
                    Complétez ces défis pour améliorer votre bien-être et maintenir votre série
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              {challenges.map((challenge) => (
                <ChallengeCard 
                  key={challenge.id}
                  challenge={challenge}
                  onComplete={onCompleteChallenge}
                  isCompleted={progress?.completedChallenges?.includes(challenge.id)}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Profile tab */}
        {activeTab === 'profile' && (
          <ProfilePage 
            progress={progress} 
            onLogout={onLogout} 
            userSettings={userSettings} 
            onUpdateSettings={onUpdateSettings}
          />
        )}
      </main>
      
      {/* Footer navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg py-2 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="flex justify-between">
            <button 
              className={`flex flex-col items-center px-4 py-1 ${activeTab === 'discover' ? 'text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('discover')}
            >
              <span className="text-2xl">🧭</span>
              <span className="text-xs mt-1">Découvrir</span>
            </button>
            
            <button 
              className={`flex flex-col items-center px-4 py-1 ${activeTab === 'challenges' ? 'text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('challenges')}
            >
              <span className="text-2xl">🔥</span>
              <span className="text-xs mt-1">Défis</span>
            </button>
            
            <button 
              className={`flex flex-col items-center px-4 py-1 ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="text-2xl">👤</span>
              <span className="text-xs mt-1">Profil</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Chatbot avec API Gradio, chargement asynchrone et gestion d'erreurs */}
      <Suspense fallback={<div className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-gray-300 animate-pulse"></div>}>
        <ErrorBoundary fallback={<div className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center">💬</div>}>
          <ChatBot useLocalMode={!AI_CONFIG.chatbot.enabled} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};

export default HomePage;