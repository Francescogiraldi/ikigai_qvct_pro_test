import React, { useState, useEffect } from 'react';
import RecommendationCard from './RecommendationCard';
import API from '../../../backend/api';

/**
 * Section de recommandations personnalisées basées sur l'IA améliorée
 * Version optimisée pour le nouveau modèle d'IA
 */
const RecommendationsSection = ({ onSelectModule }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [analysisVersion, setAnalysisVersion] = useState('v1');
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  // Charger les recommandations au chargement du composant
  useEffect(() => {
    loadRecommendations();
  }, []);

  // Fonction pour charger les recommandations
  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await API.ai.getUserRecommendations();
      
      if (result.success) {
        setRecommendations(result.recommendations || []);
        setLastUpdated(result.generatedAt ? new Date(result.generatedAt) : new Date());
        setAnalysisVersion(result.analysisVersion || 'v1');
        // Réinitialiser l'état de feedback pour les nouvelles recommandations
        setFeedbackGiven(false);
      } else {
        setError(result.error || 'Impossible de charger les recommandations');
        setRecommendations([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des recommandations:', err);
      setError('Une erreur est survenue lors du chargement des recommandations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour générer de nouvelles recommandations
  const generateNewRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await API.ai.analyzeUserResponses();
      
      if (result.success) {
        setRecommendations(result.recommendations || []);
        setLastUpdated(new Date());
        setAnalysisVersion(result.analysisVersion || 'enhanced-v1');
        setFeedbackGiven(false);
      } else {
        setError(result.error || 'Impossible de générer de nouvelles recommandations');
      }
    } catch (err) {
      console.error('Erreur lors de la génération des recommandations:', err);
      setError('Une erreur est survenue lors de la génération des recommandations');
    } finally {
      setLoading(false);
    }
  };

  // Gérer la sélection d'une recommandation
  const handleSelectRecommendation = (recommendation) => {
    if (recommendation.type === 'module' && recommendation.id) {
      // Récupérer le module complet et le passer au handler
      const module = API.content.getModuleById(recommendation.id);
      if (module && onSelectModule) {
        // Enregistrer l'interaction avec la recommandation
        logRecommendationInteraction(recommendation.id, 'clicked');
        onSelectModule(module);
      }
    } else {
      // Pour les recommandations générales, afficher un modal avec plus d'informations
      logRecommendationInteraction(recommendation.title, 'viewed');
      alert(`Recommandation: ${recommendation.title}\n\n${recommendation.description || recommendation.reason}`);
    }
  };

  // Enregistrer l'interaction avec une recommandation
  const logRecommendationInteraction = async (recommendationId, action) => {
    try {
      // Simulation d'un appel API pour enregistrer l'interaction
      // Dans une implémentation réelle, cela serait relié à l'API Supabase
      console.log(`Interaction avec recommandation ${recommendationId}: ${action}`);
      
      // Ici vous pourriez appeler une vraie API pour enregistrer l'interaction
      // await API.ai.logRecommendationInteraction(recommendationId, action);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'interaction:', error);
    }
  };

  // Envoyer un feedback sur les recommandations
  const sendFeedback = async (isHelpful) => {
    try {
      // Simulation d'un appel API pour enregistrer le feedback
      console.log(`Feedback sur recommandations: ${isHelpful ? 'utile' : 'pas utile'}`);
      
      // Ici vous pourriez appeler une vraie API pour enregistrer le feedback
      // await API.ai.sendRecommendationFeedback(isHelpful);
      
      setFeedbackGiven(true);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du feedback:', error);
    }
  };

  // Formater la date de dernière mise à jour
  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    
    // Si c'est aujourd'hui, afficher l'heure
    const today = new Date();
    const isToday = lastUpdated.getDate() === today.getDate() && 
                   lastUpdated.getMonth() === today.getMonth() && 
                   lastUpdated.getFullYear() === today.getFullYear();
    
    if (isToday) {
      return `aujourd'hui à ${lastUpdated.getHours()}:${String(lastUpdated.getMinutes()).padStart(2, '0')}`;
    }
    
    // Sinon afficher la date
    return `le ${lastUpdated.getDate()}/${lastUpdated.getMonth() + 1}/${lastUpdated.getFullYear()}`;
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <span className="mr-2">✨</span> 
          Recommandations personnalisées
          {analysisVersion.includes('enhanced') && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              IA améliorée
            </span>
          )}
        </h2>
        
        <button 
          onClick={generateNewRecommendations}
          disabled={loading}
          className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors flex items-center"
        >
          {loading ? (
            <span>Chargement...</span>
          ) : (
            <>
              <span className="mr-1">🔄</span>
              <span>Actualiser</span>
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {recommendations.length > 0 ? (
        <>
          <div className="space-y-3 mb-3">
            {recommendations.map((recommendation, index) => (
              <RecommendationCard
                key={`${recommendation.id || recommendation.title}-${index}`}
                recommendation={recommendation}
                onSelect={handleSelectRecommendation}
              />
            ))}
          </div>
          
          {!feedbackGiven && (
            <div className="flex justify-center items-center mb-3 bg-gray-50 p-2 rounded-lg">
              <span className="text-sm text-gray-600 mr-2">Ces recommandations vous sont-elles utiles ?</span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => sendFeedback(true)}
                  className="text-sm px-3 py-1 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
                >
                  👍 Oui
                </button>
                <button 
                  onClick={() => sendFeedback(false)}
                  className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                >
                  👎 Non
                </button>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div>
              {analysisVersion.includes('enhanced') 
                ? 'Analyse avancée avec traitement de langage naturel' 
                : 'Analyse basée sur vos réponses'}
            </div>
            {lastUpdated && (
              <div>
                Mis à jour {formatLastUpdated()}
              </div>
            )}
          </div>
        </>
      ) : loading ? (
        <div className="bg-gray-50 rounded-xl p-8 flex justify-center items-center">
          <div className="text-gray-500">Chargement des recommandations...</div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">🔍</div>
          <h3 className="font-medium text-gray-700 mb-1">Aucune recommandation disponible</h3>
          <p className="text-gray-500 text-sm mb-4">Complétez plus de modules pour obtenir des recommandations personnalisées</p>
          <button 
            onClick={generateNewRecommendations}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Générer des recommandations
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendationsSection;