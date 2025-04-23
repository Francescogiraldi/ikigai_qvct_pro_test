// Modèle pour les exercices rapides

export class Exercise {
  constructor(id, title, description, icon, color, duration, category) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.icon = icon;
    this.color = color || '#4EAAF0';
    this.duration = duration || '5 min';
    this.category = category;
  }

  static fromJSON(json) {
    return new Exercise(
      json.id,
      json.title,
      json.description,
      json.icon,
      json.color,
      json.duration,
      json.category
    );
  }
}

// Définition des exercices rapides de l'application
export const EXERCISES = [
  new Exercise(
    'breathing_exercise',
    'Respiration',
    'Exercice de respiration profonde pour se recentrer',
    '🧘',
    '#4EAAF0',
    '3 min',
    'mindfulness'
  ),
  new Exercise(
    'mindfulness_exercise',
    'Pleine conscience',
    'Pratique rapide de pleine conscience',
    '🧠',
    '#FF8747',
    '5 min',
    'mindfulness'
  ),
  new Exercise(
    'gratitude_exercise',
    'Gratitude',
    'Exercice express de gratitude',
    '🌱',
    '#41D185',
    '2 min',
    'positivity'
  ),
  new Exercise(
    'focus_exercise',
    'Focus',
    'Technique rapide pour améliorer la concentration',
    '🎯',
    '#B069F8',
    '10 min',
    'productivity'
  )
];
