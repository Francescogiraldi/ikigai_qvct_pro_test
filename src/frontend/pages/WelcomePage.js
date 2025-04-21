import React from 'react';
import Button from '../components/ui/Button';
import Character from '../components/ui/Character';

const WelcomePage = ({ onStart, onSignIn }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center mb-4">
          <Character character="🧘" emotion="happy" size="text-6xl" />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-3">Bienvenue sur IKIGAI</h2>
        
        <p className="text-gray-600 text-center mb-6">
          Votre assistant personnel pour améliorer votre bien-être au travail et trouver votre équilibre.
        </p>
        
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-blue-800 mb-2 flex items-center text-center">
            <span className="text-xl mr-2">✨</span>
            Comment ça fonctionne
          </h3>
          
          <ul className="text-blue-700 space-y-3">
            <li className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2 shrink-0">
                1
              </div>
              <span>Explorez les îles thématiques selon vos besoins</span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2 shrink-0">
                2
              </div>
              <span>Complétez des modules pour progresser</span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2 shrink-0">
                3
              </div>
              <span>Relevez des défis quotidiens</span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2 shrink-0">
                4
              </div>
              <span>Collectez des badges et progressez en niveau</span>
            </li>
          </ul>
          
          <p className="text-blue-700 mt-4 text-xs text-center">
            Vos réponses sont analysées par un modèle d'Intelligence Artificielle soigneusement sélectionné et adapté à vos besoins.
          </p>
          
          <p className="text-blue-700 mt-2 text-xs text-center">
            La confidentialité de vos données est assurée et conforme aux normes RGPD.
          </p>
        </div>
        
        <div className="flex flex-col space-y-3">
          <Button color="#4EAAF0" onClick={onStart} size="lg">
            Commencer votre parcours
          </Button>
          
          <button
            className="text-sm text-blue-600 hover:underline text-center"
            onClick={onSignIn}
          >
            Déjà inscrit(e) ? Se connecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;