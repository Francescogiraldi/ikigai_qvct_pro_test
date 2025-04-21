// Définition des îles thématiques pour l'application IKIGAI

export const ISLANDS = [
  {
    id: 'mindfulness',
    name: 'Île de la Pleine Conscience',
    description: 'Apprenez à vivre dans le moment présent et à développer votre attention consciente',
    color: '#4EAAF0',
    icon: '🧘',
    mascot: '🦉',
    modules: 4,
    badges: {
      beginner: {
        id: 'mindfulness_beginner',
        name: 'Apprenti Méditant',
        description: 'Premier pas vers la pleine conscience',
        icon: '🧘'
      },
      intermediate: {
        id: 'mindfulness_intermediate',
        name: 'Méditant Régulier',
        description: 'Pratique régulière de la pleine conscience',
        icon: '🧠'
      },
      advanced: {
        id: 'mindfulness_advanced',
        name: 'Maître Zen',
        description: 'Expert en pleine conscience',
        icon: '✨'
      }
    }
  },
  {
    id: 'productivity',
    name: 'Île de la Productivité',
    description: 'Découvrez des techniques pour améliorer votre concentration et votre efficacité',
    color: '#41D185',
    icon: '⏱️',
    mascot: '🦊',
    modules: 4,
    badges: {
      beginner: {
        id: 'productivity_beginner',
        name: 'Organisateur Débutant',
        description: 'Premiers pas vers une meilleure organisation',
        icon: '📝'
      },
      intermediate: {
        id: 'productivity_intermediate',
        name: 'Gestionnaire du Temps',
        description: 'Maîtrise de la gestion du temps',
        icon: '⏱️'
      },
      advanced: {
        id: 'productivity_advanced',
        name: 'Maître de la Productivité',
        description: 'Expert en productivité et organisation',
        icon: '🚀'
      }
    }
  },
  {
    id: 'stress',
    name: 'Île Anti-Stress',
    description: 'Apprenez à gérer votre stress et à retrouver votre calme intérieur',
    color: '#FF8747',
    icon: '🌊',
    mascot: '🐢',
    modules: 4,
    badges: {
      beginner: {
        id: 'stress_beginner',
        name: 'Apprenti Zen',
        description: 'Premiers pas vers la gestion du stress',
        icon: '😌'
      },
      intermediate: {
        id: 'stress_intermediate',
        name: 'Maître du Calme',
        description: 'Capacité à maintenir son calme sous pression',
        icon: '🧘'
      },
      advanced: {
        id: 'stress_advanced',
        name: 'Guru Anti-Stress',
        description: 'Expert en gestion du stress',
        icon: '🌈'
      }
    }
  },
  {
    id: 'balance',
    name: 'Île de l\'Équilibre',
    description: 'Trouvez l\'harmonie entre vie professionnelle et personnelle',
    color: '#B069F8',
    icon: '⚖️',
    mascot: '🦋',
    modules: 4,
    badges: {
      beginner: {
        id: 'balance_beginner',
        name: 'Chercheur d\'Équilibre',
        description: 'Premiers pas vers l\'équilibre vie pro/perso',
        icon: '🌱'
      },
      intermediate: {
        id: 'balance_intermediate',
        name: 'Équilibriste',
        description: 'Maintien d\'un bon équilibre au quotidien',
        icon: '⚖️'
      },
      advanced: {
        id: 'balance_advanced',
        name: 'Maître de l\'Harmonie',
        description: 'Expert en équilibre de vie',
        icon: '🌟'
      }
    }
  }
];