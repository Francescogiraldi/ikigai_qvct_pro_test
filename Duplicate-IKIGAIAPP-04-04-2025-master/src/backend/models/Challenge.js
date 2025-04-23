// Modèle pour les défis quotidiens

export class Challenge {
  constructor(id, title, description, points, icon, color, category, duration) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.points = points || 50;
    this.icon = icon;
    this.color = color || '#4EAAF0';
    this.category = category;
    this.duration = duration || '5 min';
  }

  static fromJSON(json) {
    return new Challenge(
      json.id,
      json.title,
      json.description,
      json.points,
      json.icon,
      json.color,
      json.category,
      json.duration
    );
  }
}

// Définition des défis de l'application
export const CHALLENGES = [
  new Challenge(
    'mindful_breathing',
    'Respirez en pleine conscience',
    'Prendre 5 minutes aujourd\'hui pour respirer profondément et vous reconnecter à l\'instant présent',
    50,
    '🧁',
    '#4EAAF0',
    'mindfulness',
    '5 min'
  ),
  new Challenge(
    'digital_detox',
    'Détox numérique',
    'Prenez une pause de 30 minutes sans téléphone ni écran pour vous reconnecter à votre environnement',
    50,
    '📵',
    '#41D185',
    'balance',
    '30 min'
  ),
  new Challenge(
    'gratitude_practice',
    'Pratique de gratitude',
    'Notez 3 choses pour lesquelles vous êtes reconnaissant aujourd\'hui',
    50,
    '🙏',
    '#B069F8',
    'positivity',
    '5 min'
  ),
  new Challenge(
    'mindful_break',
    'Pause consciente',
    'Faites une pause de 10 minutes en pleine conscience entre deux réunions',
    50,
    '⏯️',
    '#FF8747',
    'stress',
    '10 min'
  )
];
