// Modèle pour la progression de l'utilisateur

export class UserProgress {
  constructor(userId) {
    this.userId = userId;
    this.totalPoints = 0;
    this.streak = 0;
    this.wellnessScore = 65;
    this.completedModules = {};
    this.completedChallenges = [];
    this.badges = [];
    this.moduleResponses = {};
    this.islandProgress = {
      mindfulness: { progress: 0, completedModules: 0 },
      productivity: { progress: 0, completedModules: 0 },
      stress: { progress: 0, completedModules: 0 },
      balance: { progress: 0, completedModules: 0 }
    };
  }

  // Ajouter des points et mettre à jour le niveau
  addPoints(points) {
    this.totalPoints += points;
    return this.totalPoints;
  }

  // Compléter un module
  completeModule(moduleId, islandId) {
    // Marquer comme complété
    this.completedModules[moduleId] = true;
    
    // Ajouter des points
    this.totalPoints += 100;
    
    // Mettre à jour l'avancement de l'île
    if (islandId && this.islandProgress[islandId]) {
      const islandModules = 4; // Nombre de modules par île
      const completedCount = Object.keys(this.completedModules)
        .filter(id => id.startsWith(islandId))
        .length;
      
      this.islandProgress[islandId].completedModules = completedCount;
      this.islandProgress[islandId].progress = Math.min(100, Math.round((completedCount / islandModules) * 100));
      
      this.updateBadges(islandId);
    }
    
    return this;
  }

  // Compléter un défi
  completeChallenge(challengeId) {
    if (!this.completedChallenges.includes(challengeId)) {
      this.completedChallenges.push(challengeId);
      this.totalPoints += 50;
      this.streak += 1;
      this.wellnessScore = Math.min(100, this.wellnessScore + 2);
    }
    return this;
  }

  // Sauvegarder les réponses pour un module - Version améliorée
  saveModuleResponses(moduleId, responses) {
    // Vérifier si les réponses contiennent déjà un timestamp
    const completedAt = responses.completedAt || new Date().toISOString();
    
    // Organiser proprement les données
    this.moduleResponses = this.moduleResponses || {};
    this.moduleResponses[moduleId] = {
      responses,
      completedAt: completedAt
    };
    
    // Si c'est l'onboarding, marquer automatiquement comme complété
    if (moduleId === 'onboarding') {
      this.setOnboardingCompleted(true, completedAt);
    }
    
    return this;
  }
  
  // Méthode dédiée pour gérer l'état de complétion de l'onboarding
  setOnboardingCompleted(isCompleted, completedAt = null) {
    // S'assurer que completedModules est initialisé
    this.completedModules = this.completedModules || {};
    
    if (isCompleted) {
      // Marquer dans moduleResponses si pas déjà fait
      if (!this.moduleResponses || !this.moduleResponses.onboarding) {
        this.moduleResponses = this.moduleResponses || {};
        this.moduleResponses.onboarding = this.moduleResponses.onboarding || {};
        this.moduleResponses.onboarding.completedAt = completedAt || new Date().toISOString();
      }
      
      // Marquer comme module complété dans la liste
      this.completedModules.onboarding = true;
      
      // Si c'est la première fois, ajouter des points
      if (!this.onboardingPoints) {
        this.totalPoints += 200;
        this.onboardingPoints = true;
      }
    }
    
    return this;
  }

  // Mettre à jour les badges pour une île
  updateBadges(islandId) {
    const progress = this.islandProgress[islandId].progress;
    
    if (progress >= 100) {
      this.addBadgeIfNotExists(`${islandId}_advanced`, {
        id: `${islandId}_advanced`,
        name: `Maître de ${islandId}`,
        description: `Tous les modules de l'île ${islandId} complétés`,
        icon: '🏆'
      });
    } else if (progress >= 50) {
      this.addBadgeIfNotExists(`${islandId}_intermediate`, {
        id: `${islandId}_intermediate`,
        name: `Explorateur de ${islandId}`,
        description: `50% des modules de l'île ${islandId} complétés`,
        icon: '🌟'
      });
    } else if (progress >= 25) {
      this.addBadgeIfNotExists(`${islandId}_beginner`, {
        id: `${islandId}_beginner`,
        name: `Découvreur de ${islandId}`,
        description: `Premier module de l'île ${islandId} complété`,
        icon: '🌱'
      });
    }
    
    return this;
  }

  // Ajouter un badge s'il n'existe pas déjà
  addBadgeIfNotExists(badgeId, badgeData) {
    const badgeExists = this.badges.some(b => b.id === badgeId);
    if (!badgeExists) {
      this.badges.push(badgeData);
    }
    return this;
  }

  // Convertir en objet simple pour stockage
  toJSON() {
    return {
      userId: this.userId,
      totalPoints: this.totalPoints,
      streak: this.streak,
      wellnessScore: this.wellnessScore,
      completedModules: this.completedModules,
      completedChallenges: this.completedChallenges,
      badges: this.badges,
      moduleResponses: this.moduleResponses,
      islandProgress: this.islandProgress
    };
  }

  // Créer une instance depuis des données JSON
  static fromJSON(json) {
    const progress = new UserProgress(json.userId);
    progress.totalPoints = json.totalPoints || 0;
    progress.streak = json.streak || 0;
    progress.wellnessScore = json.wellnessScore || 65;
    progress.completedModules = json.completedModules || {};
    progress.completedChallenges = json.completedChallenges || [];
    progress.badges = json.badges || [];
    progress.moduleResponses = json.moduleResponses || {};
    progress.islandProgress = json.islandProgress || {
      mindfulness: { progress: 0, completedModules: 0 },
      productivity: { progress: 0, completedModules: 0 },
      stress: { progress: 0, completedModules: 0 },
      balance: { progress: 0, completedModules: 0 }
    };
    return progress;
  }
}