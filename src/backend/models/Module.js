// Modèle pour les modules de contenu
import { MODULES as MODULE_DATA } from '../../data/modules';

export class Module {
  constructor(id, islandId, title, description, duration, points, icon, content, questions) {
    this.id = id;
    this.islandId = islandId;
    this.title = title;
    this.description = description;
    this.duration = duration || '5 min';
    this.points = points || 100;
    this.icon = icon;
    this.content = content || '';
    this.questions = questions || [];
  }

  static fromJSON(json) {
    return new Module(
      json.id,
      json.islandId,
      json.title,
      json.description,
      json.duration,
      json.points,
      json.icon,
      json.content,
      json.questions
    );
  }
}

// Convertir les données brutes en instances de Module
export const MODULES = MODULE_DATA.map(moduleData => Module.fromJSON(moduleData));
