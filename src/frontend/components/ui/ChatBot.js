import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AI_CONFIG } from '../../../config';

/**
 * Composant ChatBot unifié qui peut fonctionner en mode réel (API Gradio) ou en mode simulation
 * @param {Object} props - Les propriétés du composant
 * @param {boolean} props.useLocalMode - Si true, utilise des réponses prédéfinies au lieu de l'API Gradio
 * @param {Array} props.predefinedResponses - Tableau de réponses prédéfinies pour le mode local (simulation)
 */
const ChatBot = ({ useLocalMode = false, predefinedResponses = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Bonjour ! Je suis votre assistant IKIGAI. Comment puis-je vous aider aujourd\'hui ?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [gradioClient, setGradioClient] = useState(null);

  // Réponses prédéfinies par défaut pour le mode local
  const defaultResponses = [
    "Le concept d'IKIGAI est un schéma japonais qui vous aide à trouver votre raison d'être en identifiant ce que vous aimez, ce en quoi vous êtes bon, ce pour quoi vous pouvez être payé et ce dont le monde a besoin.",
    "La méditation est une excellente pratique pour réduire le stress et améliorer votre bien-être mental. Essayez de commencer par 5 minutes par jour.",
    "Pour améliorer votre équilibre vie professionnelle/personnelle, essayez de définir des limites claires et de prendre du temps pour des activités qui vous ressourcent.",
    "L'activité physique régulière est un pilier important du bien-être. Même une marche quotidienne de 30 minutes peut faire une grande différence.",
    "La gratitude est une pratique puissante pour améliorer votre bien-être. Essayez de noter trois choses pour lesquelles vous êtes reconnaissant chaque jour.",
    "Une bonne alimentation est fondamentale pour votre bien-être. Essayez d'incorporer plus de fruits, légumes et aliments complets dans votre régime.",
    "Le sommeil est essentiel pour votre santé mentale et physique. Visez 7-8 heures de sommeil de qualité chaque nuit.",
    "Les connections sociales positives sont importantes pour votre bien-être. Prenez le temps de cultiver des relations qui vous soutiennent et vous inspirent."
  ];

  // Utiliser les réponses prédéfinies fournies ou les réponses par défaut
  const localResponses = predefinedResponses.length > 0 ? predefinedResponses : defaultResponses;

  // État pour suivre si on est forcé en mode local à cause d'une erreur
  const [forcedLocalMode, setForcedLocalMode] = useState(false);
  
  // Détermine si on utilise le mode local (plus de référence à Client qui n'existe plus)
  const actuallyUseLocalMode = useLocalMode || forcedLocalMode;

  // Initialiser le client Gradio si on n'est pas en mode local
  useEffect(() => {
    // Déclaration d'une fonction pour initialiser le client Gradio
    const initGradioClient = async () => {
      // Si on est en mode local, on ne fait rien
      if (actuallyUseLocalMode) return;
      
      try {
        // Importer dynamiquement le client Gradio
        const gradioModule = await import('@gradio/client');
        const GradioClient = gradioModule.Client;
        
        // Utiliser l'endpoint depuis la configuration centralisée
        const endpoint = AI_CONFIG.chatbot.apiEndpoint;
        console.log("Tentative de connexion à l'API Gradio:", endpoint);
        
        const client = await GradioClient.connect(endpoint);
        setGradioClient(client);
        console.log("Connexion au client Gradio réussie");
      } catch (error) {
        console.error("Erreur de connexion au client Gradio:", error);
        // Si erreur, forcer le mode local
        setForcedLocalMode(true);
        // Informer l'utilisateur de ce changement automatique
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "Je suis actuellement en mode hors ligne. Je vais utiliser mes connaissances locales pour vous aider."
        }]);
      }
    };

    // Si on n'est pas en mode local et que le client Gradio n'a pas encore été initialisé
    if (!actuallyUseLocalMode && !gradioClient) {
      initGradioClient();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useLocalMode, forcedLocalMode, actuallyUseLocalMode, gradioClient]);

  // Scroll automatique vers le bas quand de nouveaux messages sont ajoutés
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Gérer l'envoi de message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Utiliser le message de l'utilisateur
    const userMessage = { role: 'user', content: inputMessage };
    const userMessageContent = inputMessage; // Copie du message pour l'utiliser après la réinitialisation du champ
    
    // Mettre à jour l'interface utilisateur
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Déterminer si on utilise le mode local ou l'API Gradio
    if (actuallyUseLocalMode) {
      // Mode local avec réponses prédéfinies
      try {
        setTimeout(() => {
          // Choisir une réponse aléatoire
          const randomResponse = localResponses[Math.floor(Math.random() * localResponses.length)];
          
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: randomResponse
          }]);
          setIsLoading(false);
        }, 1000); // Reduire légèrement le délai
      } catch (error) {
        console.error("Erreur inattendue en mode local:", error);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "Je suis désolé, une erreur s'est produite. Veuillez réessayer."
        }]);
        setIsLoading(false);
      }
    } else {
      // Mode API Gradio
      try {
        // Vérifier si le client Gradio est déjà initialisé
        if (gradioClient) {
          // Utiliser le message système depuis la configuration centralisée
          const systemMessage = AI_CONFIG.chatbot.systemPrompt;
          
          console.log("Envoi du message à Gradio:", userMessageContent);
          
          // Appel à l'API Gradio avec gestion des erreurs plus détaillée
          const result = await gradioClient.predict(0, [
            userMessageContent,
            systemMessage,
          ]);

          console.log("Réponse de l'API Gradio:", result);
          
          if (result && result.data) {
            // Ajouter la réponse de l'assistant (structure adaptée en fonction du format de réponse)
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: Array.isArray(result.data) && result.data.length > 0 
                ? result.data[0] 
                : (typeof result.data === 'string' 
                    ? result.data 
                    : "Je suis désolé, je n'ai pas pu générer une réponse. Veuillez réessayer.")
            }]);
          } else {
            throw new Error("Réponse Gradio invalide");
          }
        } else {
          // Tenter d'initialiser le client dynamiquement
          try {
            const gradioModule = await import('@gradio/client');
            const GradioClient = gradioModule.Client;
            
            // Utiliser l'endpoint depuis la configuration centralisée
            const endpoint = AI_CONFIG.chatbot.apiEndpoint;
            console.log("Tentative de connexion à l'API Gradio:", endpoint);
            
            const client = await GradioClient.connect(endpoint);
            setGradioClient(client);
            console.log("Connexion au client Gradio réussie");
            
            // Traiter le message après l'initialisation
            setTimeout(() => {
              setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "Connexion établie. Comment puis-je vous aider ?"
              }]);
              setIsLoading(false);
            }, 1000);
            
            return; // Sortir de la fonction pour éviter d'ajouter un message en double
          } catch (error) {
            console.error("Impossible d'initialiser le client Gradio:", error);
            // Passer en mode local pour les prochaines interactions
            setForcedLocalMode(true);
            
            // Informer l'utilisateur de ce changement
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: "Je ne peux pas me connecter à l'API en ce moment. Je vais passer en mode hors ligne pour vous aider avec mes connaissances locales."
            }]);
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'appel à l'API:", error);
        
        // Passer en mode local pour les prochaines interactions
        setForcedLocalMode(true);
        
        // Message d'erreur approprié
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "Désolé, je rencontre des difficultés avec ma connexion. Je vais passer en mode hors ligne pour continuer à vous aider."
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Envoyer message avec touche Entrée
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Bouton flottant pour ouvrir le chat */}
      <motion.button 
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center text-2xl z-30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        💬
      </motion.button>

      {/* Fenêtre de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-md h-[500px] flex flex-col overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-3 bg-blue-500 text-white">
                <div className="flex items-center">
                  <span className="text-xl mr-2">🤖</span>
                  <span className="font-bold">Assistant IKIGAI</span>
                </div>
                <button 
                  className="text-white hover:bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center"
                  onClick={() => setIsOpen(false)}
                >
                  ✕
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 shadow-sm rounded-tl-none'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm rounded-tl-none">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "200ms" }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "400ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t p-3 bg-white">
                <div className="flex items-center">
                  <textarea
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Écrivez votre message..."
                    rows="2"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <motion.button
                    className="ml-2 bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </motion.button>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  {actuallyUseLocalMode ? "Assistant IKIGAI (Mode hors ligne)" : "Propulsé par Gradio API"}
                  {forcedLocalMode && " - Basculement automatique en mode hors ligne"}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;