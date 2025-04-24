import React, { useState, useEffect } from 'react';
import Badge from '../components/ui/Badge';
import { supabase } from '../../shared/supabase';
import API from '../../backend/api';

const ProfilePage = ({ 
  progress, 
  onLogout, 
  userSettings, 
  onUpdateSettings 
}) => {
  const [userFirstName, setUserFirstName] = useState('');
  
  // Calculate level based on points
  const level = Math.floor((progress?.totalPoints || 0) / 500) + 1;
  
  // Récupérer le prénom de l'utilisateur depuis Supabase
  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.user_metadata && user.user_metadata.first_name) {
          setUserFirstName(user.user_metadata.first_name);
        }
        
        // Settings are now fetched in App.js, remove local fetching logic
      } catch (err) {
        console.error('Erreur lors de la récupération des données utilisateur:', err);
      }
    };
    
    getUserData();
  }, []); // Only fetch user name once on component mount
  
  // Function to handle local setting changes before saving
  const handleSettingChange = (key, value) => {
    const newSettings = { ...userSettings, [key]: value };
    onUpdateSettings(newSettings); // Update global state immediately for UI feedback
  };

  return (
    <div>
      <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
        <div className="flex items-start">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl mr-4">
            🧘
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Votre Profil{userFirstName ? `: ${userFirstName}` : ''}</h2>
            <p className="text-gray-600 mb-2">Suivez votre progrès et parcours bien-être</p>
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium flex items-center mr-2">
                <span className="mr-1">⭐</span> Niveau {level}
              </div>
              <div className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                <span className="mr-1">🔥</span> Série de {progress?.streak || 0} jours
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* User stats */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">📊</span> Vos statistiques
        </h2>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Total points</div>
              <div className="text-xl font-bold text-blue-600">{progress?.totalPoints || 0}</div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Modules complétés</div>
              <div className="text-xl font-bold text-green-600">
                {Object.keys(progress?.completedModules || {}).length}
              </div>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Badges obtenus</div>
              <div className="text-xl font-bold text-purple-600">
                {progress?.badges?.length || 0}
              </div>
            </div>
            
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Défis complétés</div>
              <div className="text-xl font-bold text-orange-600">
                {progress?.completedChallenges?.length || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Badges collection */}
      {progress?.badges && progress.badges.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">🏆</span> Vos badges
          </h2>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              {progress.badges.map(badge => (
                <Badge
                  key={badge.id}
                  icon={badge.icon}
                  name={badge.name}
                  description={badge.description}
                  iconBgColor="#FFC107"
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-blue-50 p-4 rounded-xl">
          <p className="text-blue-800 flex items-center">
            <span className="text-xl mr-2">🏆</span>
            Complétez des modules pour gagner vos premiers badges !
          </p>
        </div>
      )}
      
      {/* Settings */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">⚙️</span> Paramètres
        </h2>
        
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-6"> {/* Increased space-y */} 
          {/* Notifications */}
          <div> {/* Removed border */} 
            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
              <span className="mr-2 text-yellow-500">🔔</span> Notifications
            </h3>
            <div className="space-y-3 pl-6"> {/* Indent options */} 
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Notifications push</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={userSettings.notifications}
                    onChange={() => handleSettingChange('notifications', !userSettings.notifications)}
                  />
                  {/* Updated toggle style */} 
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rappels quotidiens</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={userSettings.dailyReminders}
                    onChange={() => handleSettingChange('dailyReminders', !userSettings.dailyReminders)}
                  />
                  {/* Updated toggle style */} 
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Sons */}
          <div> {/* Removed border */} 
            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
              <span className="mr-2 text-purple-500">🔊</span> Sons
            </h3>
            <div className="space-y-3 pl-6"> {/* Indent options */} 
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sons de l&apos;application</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={userSettings.sounds}
                    onChange={() => handleSettingChange('sounds', !userSettings.sounds)}
                  />
                  {/* Updated toggle style */} 
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sons de méditation</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={userSettings.meditationSounds}
                    onChange={() => handleSettingChange('meditationSounds', !userSettings.meditationSounds)}
                  />
                  {/* Updated toggle style */} 
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Apparence */}
          <div> {/* Removed border */} 
            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
              <span className="mr-2 text-pink-500">🎨</span> Apparence
            </h3>
            <div className="space-y-3 pl-6"> {/* Indent options */} 
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Mode sombre</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={userSettings.darkMode}
                    onChange={() => handleSettingChange('darkMode', !userSettings.darkMode)}
                  />
                  {/* Updated toggle style */} 
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Sécurité et confidentialité */}
          <div> {/* Removed border */} 
            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
              <span className="mr-2 text-yellow-600">🔒</span> Sécurité et confidentialité
            </h3>
            <div className="space-y-3 pl-6"> {/* Indent options */} 
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Protection des données</span>
                {/* Updated select style */} 
                <select 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={userSettings.dataPrivacy}
                  onChange={(e) => handleSettingChange('dataPrivacy', e.target.value)}
                >
                  <option value="minimal">Minimale</option>
                  <option value="standard">Standard</option>
                  <option value="maximum">Maximum</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Langue */}
          <div> {/* Removed border */} 
            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
              <span className="mr-2 text-blue-500">🌐</span> Langue
            </h3>
            <div className="space-y-3 pl-6"> {/* Indent options */} 
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Langue de l&apos;application</span>
                {/* Updated select style */} 
                <select 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={userSettings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Boutons d'action */} 
          <div className="pt-4 space-y-3"> {/* Added padding-top */} 
            {/* Updated Save Button Style */}
            <button
              className="w-full py-3 text-left px-4 bg-green-100 text-green-800 rounded-lg flex justify-between items-center hover:bg-green-200 transition-colors font-medium"
              onClick={async () => {
                try {
                  // Vérifier que les userSettings sont valides avant de les enregistrer
                  if (!userSettings || typeof userSettings !== 'object') {
                    throw new Error('Paramètres utilisateur invalides');
                  }
                  
                  // S'assurer que tous les paramètres sont bien définis
                  // avec des valeurs par défaut si nécessaire
                  const settingsToSave = {
                    notifications: !!userSettings.notifications,
                    sounds: !!userSettings.sounds,
                    darkMode: !!userSettings.darkMode,
                    dataPrivacy: userSettings.dataPrivacy || 'standard',
                    language: userSettings.language || 'fr',
                    dailyReminders: !!userSettings.dailyReminders,
                    meditationSounds: !!userSettings.meditationSounds
                  };
                  
                  // Utiliser la nouvelle méthode API pour sauvegarder les paramètres
                  const success = await API.progress.saveUserSettings(settingsToSave);
                  
                  if (!success) {
                    throw new Error('Échec de la sauvegarde des paramètres');
                  }
                  
                  // Mettre à jour l'état global
                  onUpdateSettings(settingsToSave);
                  
                  // Informer l'utilisateur du succès
                  alert('Paramètres enregistrés avec succès!');
                } catch (error) {
                  console.error('Erreur lors de la sauvegarde des paramètres:', error);
                  alert('Erreur lors de la sauvegarde des paramètres: ' + (error.message || 'Veuillez réessayer'));
                }
              }}
            >
              <span>Enregistrer les paramètres</span>
              <span className="text-xl">💾</span>
            </button>
            
            {/* Updated Logout Button Style */}
            <button
              className="w-full py-3 text-left px-4 bg-blue-100 text-blue-800 rounded-lg flex justify-between items-center hover:bg-blue-200 transition-colors font-medium"
              onClick={onLogout}
            >
              <span>Se déconnecter</span>
              <span className="text-xl">🚪</span>
            </button>
            
            {/* Le bouton de réinitialisation de progression a été supprimé
            pour simplifier l'interface utilisateur */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;