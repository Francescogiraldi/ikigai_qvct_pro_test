// Service de contenu pour l'application IKIGAI
// Gère l'accès aux îles, modules, défis et exercices

import { ISLANDS } from '../models/Island';
import { MODULES } from '../models/Module';
import { CHALLENGES } from '../models/Challenge';
import { EXERCISES } from '../models/Exercise';

class ContentService {
  // Récupérer toutes les îles
  static getAllIslands() {
    return ISLANDS;
  }
  
  // Récupérer une île par son ID
  static getIslandById(islandId) {
    return ISLANDS.find(island => island.id === islandId);
  }
  
  // Récupérer tous les modules
  static getAllModules() {
    return MODULES;
  }
  
  // Récupérer les modules d'une île spécifique
  static getModulesByIslandId(islandId) {
    return MODULES.filter(module => module.islandId === islandId);
  }
  
  // Récupérer un module par son ID
  static getModuleById(moduleId) {
    return MODULES.find(module => module.id === moduleId);
  }
  
  // Récupérer tous les défis
  static getAllChallenges() {
    return CHALLENGES;
  }
  
  // Récupérer les défis par catégorie
  static getChallengesByCategory(category) {
    return CHALLENGES.filter(challenge => challenge.category === category);
  }
  
  // Récupérer un défi par son ID
  static getChallengeById(challengeId) {
    return CHALLENGES.find(challenge => challenge.id === challengeId);
  }
  
  // Récupérer tous les exercices rapides
  static getAllExercises() {
    return EXERCISES;
  }
  
  // Récupérer les exercices par catégorie
  static getExercisesByCategory(category) {
    return EXERCISES.filter(exercise => exercise.category === category);
  }
  
  // Récupérer un exercice par son ID
  static getExerciseById(exerciseId) {
    return EXERCISES.find(exercise => exercise.id === exerciseId);
  }
  
  // Récupérer le contenu recommandé en fonction du profil utilisateur
  static getRecommendedContent(userProgress) {
    // Logique pour recommander des îles, modules, ou défis personnalisés
    // (implémentation simplifiée pour cette version)
    
    // Par exemple, recommander des modules non complétés de l'île avec le plus de progrès
    const progressEntries = Object.entries(userProgress.islandProgress || {});
    if (progressEntries.length === 0) return { modules: [], challenges: [] };
    
    // Trier par progression
    progressEntries.sort((a, b) => b[1].progress - a[1].progress);
    const [topIslandId] = progressEntries[0];
    
    // Trouver des modules non complétés
    const islandModules = this.getModulesByIslandId(topIslandId);
    const recommendedModules = islandModules.filter(
      module => !userProgress.completedModules || !userProgress.completedModules[module.id]
    ).slice(0, 2);
    
    // Recommander des défis non complétés
    const recommendedChallenges = CHALLENGES.filter(
      challenge => !userProgress.completedChallenges || !userProgress.completedChallenges.includes(challenge.id)
    ).slice(0, 2);
    
    return {
      modules: recommendedModules,
      challenges: recommendedChallenges
    };
  }
}

export default ContentService;