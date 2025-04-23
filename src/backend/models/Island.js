// Modèle pour les îles thématiques

export class Island {
  constructor(id, name, description, color, icon, mascot, modules, badges) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.color = color;
    this.icon = icon;
    this.mascot = mascot;
    this.modules = modules || 4;
    this.badges = badges || {};
  }

  static fromJSON(json) {
    return new Island(
      json.id,
      json.name,
      json.description,
      json.color,
      json.icon,
      json.mascot,
      json.modules,
      json.badges
    );
  }
}

// Définition des îles de l'application
export const ISLANDS = [
  new Island(
    'mindfulness',
    'Île de la Pleine Conscience',
    'Apprenez à vivre dans le moment présent et à développer votre attention consciente',
    '#4EAAF0',
    '🧘',
    '🦉',
    4,
    {
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
  ),
  new Island(
    'productivity',
    'Île de la Productivité',
    'Découvrez des techniques pour améliorer votre concentration et votre efficacité',
    '#41D185',
    '⏰️',
    '🦊',
    4,
    {
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
        icon: '⏰️'
      },
      advanced: {
        id: 'productivity_advanced',
        name: 'Maître de la Productivité',
        description: 'Expert en productivité et organisation',
        icon: '🚀'
      }
    }
  ),
  new Island(
    'stress',
    'Île Anti-Stress',
    'Apprenez à gérer votre stress et à retrouver votre calme intérieur',
    '#FF8747',
    '🌊',
    '🐢',
    4,
    {
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
  ),
  new Island(
    'balance',
    'Île de l\'\u00c9quilibre',
    'Trouvez l\'harmonie entre vie professionnelle et personnelle',
    '#B069F8',
    '⚖️',
    '🦋',
    4,
    {
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
  )
];
