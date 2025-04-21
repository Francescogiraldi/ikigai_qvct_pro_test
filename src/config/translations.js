// Configuration des traductions pour l'application IKIGAI
// Ce fichier centralise tous les textes traduits de l'application

export const translations = {
  fr: {
    // Messages communs
    common: {
      welcome: "Bienvenue",
      save: "Enregistrer",
      cancel: "Annuler",
      confirm: "Confirmer",
      loading: "Chargement...",
      error: "Une erreur est survenue",
      success: "Opération réussie",
      retry: "Réessayer",
      close: "Fermer"
    },

    // Page d'accueil
    home: {
      greeting: "Bonjour !",
      feelingQuestion: "Comment vous sentez-vous aujourd'hui ?",
      discoverTab: "Découvrir",
      challengesTab: "Défis",
      profileTab: "Profil",
      wellnessJourneys: "Parcours bien-être",
      quickExercises: "Exercices rapides"
    },

    // Profil
    profile: {
      title: "Votre Profil",
      subtitle: "Suivez votre progrès et parcours bien-être",
      stats: "Vos statistiques",
      badges: "Vos badges",
      settings: "Paramètres",
      logout: "Se déconnecter",
      saveSettings: "Enregistrer les paramètres",
      notifications: "Notifications",
      sounds: "Sons",
      appearance: "Apparence",
      security: "Sécurité et confidentialité",
      language: "Langue",
      dataPrivacy: "Protection des données",
      appSounds: "Sons de l'application",
      meditationSounds: "Sons de méditation",
      darkMode: "Mode sombre",
      pushNotifications: "Notifications push",
      dailyReminders: "Rappels quotidiens",
      appLanguage: "Langue de l'application"
    }
  },

  en: {
    // Common messages
    common: {
      welcome: "Welcome",
      save: "Save",
      cancel: "Cancel",
      confirm: "Confirm",
      loading: "Loading...",
      error: "An error occurred",
      success: "Operation successful",
      retry: "Retry",
      close: "Close"
    },

    // Home page
    home: {
      greeting: "Hello!",
      feelingQuestion: "How are you feeling today?",
      discoverTab: "Discover",
      challengesTab: "Challenges",
      profileTab: "Profile",
      wellnessJourneys: "Wellness Journeys",
      quickExercises: "Quick Exercises"
    },

    // Profile
    profile: {
      title: "Your Profile",
      subtitle: "Track your progress and wellness journey",
      stats: "Your Stats",
      badges: "Your Badges",
      settings: "Settings",
      logout: "Log Out",
      saveSettings: "Save Settings",
      notifications: "Notifications",
      sounds: "Sounds",
      appearance: "Appearance",
      security: "Security & Privacy",
      language: "Language",
      dataPrivacy: "Data Protection",
      appSounds: "Application sounds",
      meditationSounds: "Meditation sounds",
      darkMode: "Dark mode",
      pushNotifications: "Push notifications",
      dailyReminders: "Daily reminders",
      appLanguage: "Application language"
    }
  }
};

// Fonction utilitaire pour obtenir une traduction
export const getTranslation = (lang, key) => {
  // Diviser la clé par les points (ex: "profile.title" -> ["profile", "title"])
  const parts = key.split('.');
  
  // Vérifier si la langue demandée existe, sinon utiliser le français par défaut
  const langData = translations[lang] || translations.fr;
  
  // Navigation dans l'objet de traductions pour trouver la valeur correspondante
  let value = langData;
  for (const part of parts) {
    value = value[part];
    // Si à un moment donné la partie n'existe pas, retourner la clé
    if (value === undefined) return key;
  }
  
  return value;
};

// Fonction pour obtenir toutes les traductions pour une langue
export const getTranslations = (lang) => {
  return translations[lang] || translations.fr;
};

export default translations;