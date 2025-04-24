import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../shared/supabase';

/**
 * Composant pour demander à l'utilisateur comment il se sent aujourd'hui
 * Affiche un pop-up avec une échelle de 1 à 10, des smileys et des couleurs
 * N'apparaît qu'une fois par jour
 */
const DailyFeeling = ({ onSubmit, userId }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  
  // Emojis du plus positif au plus négatif (réduits à 5 pour éviter la duplication)
  const emojis = ['😄', '🙂', '😐', '🙁', '😭'];
  
  // Couleurs du vert au rouge (réduites à 5 pour correspondre aux emojis)
  const colors = [
    '#22c55e', // vert
    '#86efac',
    '#facc15', // jaune
    '#f97316',
    '#dc2626'  // rouge
  ];
  
  useEffect(() => {
    const checkDailyFeeling = async () => {
      if (!userId) return;
      
      try {
        // Vérifier si l'utilisateur a déjà répondu aujourd'hui
        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        
        const { data, error } = await supabase
          .from('user_daily_feelings')
          .select('created_at')
          .eq('user_id', userId)
          .gte('created_at', today)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) throw error;
        
        // Si aucune donnée ou dernière entrée avant aujourd'hui, afficher le pop-up
        if (!data || data.length === 0) {
          setIsVisible(true);
        }
      } catch (err) {
        console.error('Erreur lors de la vérification du sentiment quotidien:', err);
        // En cas d'erreur, on affiche quand même le pop-up
        setIsVisible(true);
      }
    };
    
    // Vérifier après un court délai pour laisser la page se charger
    const timer = setTimeout(() => {
      checkDailyFeeling();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [userId]);
  
  const handleSubmit = async () => {
    if (!selectedValue || !userId) return;
    
    try {
      // Enregistrer le sentiment dans la base de données
      const { error } = await supabase
        .from('user_daily_feelings')
        .insert({
          user_id: userId,
          feeling_value: selectedValue,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Appeler le callback avec la valeur sélectionnée
      if (onSubmit) onSubmit(selectedValue);
      
      // Fermer le pop-up
      setIsVisible(false);
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du sentiment:', err);
    }
  };
  
  // Cette fonction n'est plus nécessaire car nous utilisons directement l'index
  // des tableaux emojis et colors
  
  if (!isVisible) return null;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <motion.div 
            className="bg-white rounded-xl p-5 shadow-lg max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">Comment vous sentez-vous aujourd&apos;hui ?</h2>
              <p className="text-gray-600 text-sm">Votre bien-être est important pour nous</p>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-3">
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="text-center">
                    <motion.div 
                      className="cursor-pointer"
                      whileHover={{ scale: 1.2, y: -5 }}
                      whileTap={{ scale: 0.9 }}
                      animate={selectedValue === value ? { 
                        scale: [1, 1.3, 1.2], 
                        y: -5,
                        transition: { repeat: Infinity, repeatType: "reverse", duration: 1.5 }
                      } : {}}
                      onClick={() => setSelectedValue(value)}
                    >
                      <div className="text-3xl mb-1">
                        {emojis[value-1]}
                      </div>
                      <div 
                        className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${selectedValue === value ? 'ring-2 ring-offset-2' : ''}`}
                        style={{ backgroundColor: colors[value-1] }}
                      >
                        {/* Suppression des notations numériques */}
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
              
              {/* Barre de progression visuelle */}
              {selectedValue && (
                <motion.div 
                  className="w-full h-2 bg-gray-100 rounded-full mt-4 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div 
                    className="h-full rounded-full"
                    style={{ 
                      background: "linear-gradient(to right, #22c55e, #4ade80, #86efac, #bef264, #facc15, #fb923c, #f97316, #ef4444, #dc2626, #b91c1c)",
                      width: `${(selectedValue / 10) * 100}%` 
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(selectedValue / 10) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.div>
              )}
            </div>
            
            <div className="flex justify-between">
              <button
                className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsVisible(false)}
              >
                Plus tard
              </button>
              
              <motion.button
                className={`px-6 py-2 rounded-lg font-bold text-white ${selectedValue ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                whileHover={selectedValue ? { scale: 1.05 } : {}}
                whileTap={selectedValue ? { scale: 0.95 } : {}}
                onClick={handleSubmit}
                disabled={!selectedValue}
              >
                Valider
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DailyFeeling;