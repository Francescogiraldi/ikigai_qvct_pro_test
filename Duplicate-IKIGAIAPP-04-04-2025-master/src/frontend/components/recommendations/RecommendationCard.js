import React from 'react';

/**
 * Composant pour afficher une recommandation personnalisée avec design amélioré
 * et support pour les nouvelles catégories et métadonnées
 */
const RecommendationCard = ({ recommendation, onSelect }) => {
  // Extraire les propriétés de la recommandation
  const { type, title, category, reason, score, description, tags = [] } = recommendation;

  // Définir les couleurs en fonction de la catégorie
  const getCategoryStyles = (category) => {
    switch (category) {
      case 'mindfulness':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          icon: '🧘',
          badge: 'bg-blue-100 text-blue-800'
        };
      case 'productivity':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          icon: '⚡',
          badge: 'bg-green-100 text-green-800'
        };
      case 'stress':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
          icon: '🌿',
          badge: 'bg-purple-100 text-purple-800'
        };
      case 'balance':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          icon: '⚖️',
          badge: 'bg-amber-100 text-amber-800'
        };
      case 'wellbeing':
        return {
          bg: 'bg-pink-50',
          text: 'text-pink-700',
          border: 'border-pink-200',
          icon: '💝',
          badge: 'bg-pink-100 text-pink-800'
        };
      case 'social':
        return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          border: 'border-indigo-200',
          icon: '👥',
          badge: 'bg-indigo-100 text-indigo-800'
        };
      case 'growth':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200',
          icon: '🌱',
          badge: 'bg-orange-100 text-orange-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: '✨',
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const styles = getCategoryStyles(recommendation.category);

  return (
    <div 
      className={`p-4 rounded-xl ${styles.bg} border ${styles.border} cursor-pointer transition-transform hover:scale-102 hover:shadow-md`}
      onClick={() => onSelect && onSelect(recommendation)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.text} mr-3 text-xl`}>
            {styles.icon}
          </div>
          <div>
            <h3 className={`font-bold ${styles.text} mb-1`}>{title}</h3>
            <p className="text-gray-600 text-sm mb-2">{reason}</p>
            
            {description && (
              <p className="text-gray-500 text-xs mt-1 mb-2">{description}</p>
            )}
            
            <div className="flex flex-wrap gap-1 mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${styles.badge}`}>
                {styles.icon} {category}
              </span>
              
              {type === 'module' && (
                <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-500">
                  Module recommandé
                </span>
              )}
              
              {score >= 8 && (
                <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">
                  Priorité élevée
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end ml-2">
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-end mb-2">
              {tags.slice(0, 2).map((tag, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-white/80 text-gray-600 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="mt-auto">
            <button className={`text-sm ${styles.text} font-medium hover:underline mt-2`}>
              {type === 'module' ? 'Démarrer →' : 'En savoir plus →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;