// Service d'analyse IA pour l'application IKIGAI
// Analyse les réponses utilisateur et génère des recommandations personnalisées
// Version améliorée avec traitement de langage naturel

import { supabase } from '../../shared/supabase';
import ErrorHandler from '../../shared/ErrorHandler';
import { AI_CONFIG } from '../../config';
import ContentService from './ContentService';

class AIRecommendationService {
  // Catégories de recommandations
  static RECOMMENDATION_CATEGORIES = AI_CONFIG.categories.reduce((obj, category) => {
    obj[category.toUpperCase()] = category;
    return obj;
  }, {});

  // Modèle de sentiment
  static SENTIMENT_MAP = {
    POSITIVE: 'positive',
    NEUTRAL: 'neutral',
    NEGATIVE: 'negative'
  };

  // Analyser les réponses d'un utilisateur et générer des recommandations
  static async analyzeUserResponses(userId) {
    try {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Utilisateur non connecté' };
        userId = user.id;
      }

      // Récupérer les réponses de l'utilisateur
      const { data: userResponses, error: responsesError } = await supabase
        .from('user_responses')
        .select('*')
        .eq('user_id', userId);

      if (responsesError) {
        console.error('Erreur lors de la récupération des réponses:', responsesError);
        return ErrorHandler.handle(responsesError, 'Récupération des réponses');
      }

      // Récupérer les données de progression
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération de la progression:', progressError);
        return ErrorHandler.handle(progressError, 'Récupération de la progression');
      }

      // Récupérer les métadonnées utilisateur
      const { data: userData } = await supabase
        .from('users')
        .select('metadata')
        .eq('id', userId)
        .maybeSingle();

      // Analyser les données et générer des recommandations
      const recommendations = await this.generateEnhancedRecommendations(
        userResponses, 
        progressData,
        userData?.metadata
      );

      // Sauvegarder les recommandations dans Supabase
      await this.saveRecommendations(userId, recommendations);

      return { 
        success: true, 
        recommendations,
        analysisVersion: AI_CONFIG.version
      };
    } catch (error) {
      console.error('Erreur lors de l\'analyse des réponses:', error);
      return ErrorHandler.handle(error, 'Analyse des réponses');
    }
  }

  // Générer des recommandations améliorées avec NLP
  static async generateEnhancedRecommendations(userResponses, progressData, userMetadata = {}) {
    try {
      // Initialiser les scores par catégorie avec les nouvelles catégories
      const categoryScores = Object.values(this.RECOMMENDATION_CATEGORIES).reduce((acc, category) => {
        acc[category] = 0;
        return acc;
      }, {});

      // Agréger toutes les réponses textuelles pour analyse NLP
      const textualResponses = this.extractTextualResponses(userResponses);
      
      // Réaliser l'analyse NLP des réponses textuelles
      const nlpAnalysis = await this.performNLPAnalysis(textualResponses);
      
      // Intégrer l'analyse NLP dans les scores
      this.integrateNLPAnalysisToScores(nlpAnalysis, categoryScores);
      
      // Analyser les réponses classiques comme avant
      this.analyzeClassicResponses(userResponses, categoryScores);
      
      // Analyser les données de progression si disponibles
      if (progressData && progressData.progress_data) {
        const parsedProgress = typeof progressData.progress_data === 'string' 
          ? JSON.parse(progressData.progress_data) 
          : progressData.progress_data;
        
        this.analyzeProgressData(parsedProgress, categoryScores);
      }
      
      // Intégrer les métadonnées utilisateur dans l'analyse
      if (userMetadata) {
        this.analyzeUserMetadata(userMetadata, categoryScores);
      }

      // Normaliser les scores
      this.normalizeScores(categoryScores);

      // Générer des recommandations basées sur les scores enrichis
      return this.createEnhancedRecommendationsFromScores(categoryScores, nlpAnalysis);
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations améliorées:', error);
      // Fallback en cas d'erreur : utiliser l'ancien système
      return this.generateRecommendations(userResponses, progressData);
    }
  }

  // Extraire toutes les réponses textuelles pour analyse NLP
  static extractTextualResponses(userResponses) {
    const textualResponses = [];
    
    if (userResponses && userResponses.length > 0) {
      userResponses.forEach(response => {
        const responses = response.responses;
        if (!responses) return;
        
        // Extraire toutes les réponses textuelles
        if (typeof responses === 'object') {
          Object.entries(responses).forEach(([questionId, answer]) => {
            if (answer && typeof answer === 'string' && answer.length > 3) {
              textualResponses.push({
                text: answer,
                moduleId: response.module_id,
                questionId
              });
            }
          });
        }
      });
    }
    
    return textualResponses;
  }

  // Réaliser l'analyse NLP des réponses textuelles
  static async performNLPAnalysis(textualResponses) {
    try {
      // Simulation d'une analyse NLP (remplacer par appel à une API réelle)
      const analysisResults = {
        keyTopics: this.simulateTopicExtraction(textualResponses),
        sentiments: this.simulateSentimentAnalysis(textualResponses),
        intentions: this.simulateIntentionAnalysis(textualResponses)
      };
      
      return analysisResults;
    } catch (error) {
      console.error('Erreur lors de l\'analyse NLP:', error);
      return {
        keyTopics: [],
        sentiments: {},
        intentions: []
      };
    }
  }

  // Simulation de l'extraction de sujets (à remplacer par API réelle)
  static simulateTopicExtraction(textualResponses) {
    const topics = {
      stress: 0,
      méditation: 0,
      travail: 0,
      sommeil: 0,
      exercice: 0,
      alimentation: 0,
      relations: 0,
      productivité: 0,
      créativité: 0,
      concentration: 0
    };
    
    const keywords = {
      stress: ['stress', 'anxiété', 'pression', 'inquiétude', 'tension'],
      méditation: ['méditation', 'pleine conscience', 'mindfulness', 'calme', 'respiration'],
      travail: ['travail', 'emploi', 'carrière', 'bureau', 'professionnel'],
      sommeil: ['sommeil', 'dormir', 'fatigue', 'repos', 'nuit'],
      exercice: ['exercice', 'sport', 'activité physique', 'entraînement', 'bouger'],
      alimentation: ['alimentation', 'nourriture', 'repas', 'manger', 'diète'],
      relations: ['relations', 'famille', 'amis', 'social', 'communication'],
      productivité: ['productivité', 'efficacité', 'organisation', 'rendement', 'tâches'],
      créativité: ['créativité', 'imagination', 'innovation', 'idées', 'artistique'],
      concentration: ['concentration', 'focus', 'attention', 'mental', 'clarté']
    };
    
    textualResponses.forEach(response => {
      const text = response.text.toLowerCase();
      
      // Pour chaque thème, vérifier la présence de mots-clés
      Object.entries(keywords).forEach(([topic, words]) => {
        words.forEach(word => {
          if (text.includes(word)) {
            topics[topic] += 1;
          }
        });
      });
    });
    
    // Convertir en tableau trié par importance
    return Object.entries(topics)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({ topic, count }));
  }

  // Simulation d'analyse de sentiment (à remplacer par API réelle)
  static simulateSentimentAnalysis(textualResponses) {
    // Mots à connotation positive et négative
    const positiveWords = ['bon', 'bien', 'heureux', 'content', 'satisfait', 'positif', 'aime', 'apprécier', 
                          'espoir', 'motivé', 'énergique', 'serein', 'confiant'];
    const negativeWords = ['mauvais', 'difficile', 'stressé', 'anxieux', 'inquiet', 'négatif', 'peur', 
                          'fatigué', 'épuisé', 'déprimé', 'frustré', 'pénible', 'triste'];
    
    const moduleSentiments = {};
    const overallSentiment = {
      positive: 0,
      negative: 0,
      neutral: 0
    };
    
    textualResponses.forEach(response => {
      const text = response.text.toLowerCase();
      const moduleId = response.moduleId;
      
      // Compter les mots positifs et négatifs
      let positiveCount = 0;
      let negativeCount = 0;
      
      positiveWords.forEach(word => {
        if (text.includes(word)) positiveCount++;
      });
      
      negativeWords.forEach(word => {
        if (text.includes(word)) negativeCount++;
      });
      
      // Déterminer le sentiment dominant
      let sentiment;
      if (positiveCount > negativeCount) {
        sentiment = this.SENTIMENT_MAP.POSITIVE;
        overallSentiment.positive++;
      } else if (negativeCount > positiveCount) {
        sentiment = this.SENTIMENT_MAP.NEGATIVE;
        overallSentiment.negative++;
      } else {
        sentiment = this.SENTIMENT_MAP.NEUTRAL;
        overallSentiment.neutral++;
      }
      
      // Enregistrer le sentiment par module
      if (!moduleSentiments[moduleId]) {
        moduleSentiments[moduleId] = {
          positive: 0,
          negative: 0,
          neutral: 0
        };
      }
      
      moduleSentiments[moduleId][sentiment]++;
    });
    
    return {
      byModule: moduleSentiments,
      overall: overallSentiment
    };
  }

  // Simulation d'analyse d'intention (à remplacer par API réelle)
  static simulateIntentionAnalysis(textualResponses) {
    const intentions = [];
    
    // Modèles d'intention basés sur des phrases clés
    const intentionPatterns = [
      {
        name: 'améliorer_stress',
        patterns: ['réduire stress', 'gérer stress', 'moins stressé', 'mieux gérer', 'calmer']
      },
      {
        name: 'améliorer_sommeil',
        patterns: ['mieux dormir', 'améliorer sommeil', 'problème sommeil', 'insomnie']
      },
      {
        name: 'augmenter_productivité',
        patterns: ['plus productif', 'mieux organisé', 'améliorer concentration', 'plus efficace']
      },
      {
        name: 'équilibre_vie',
        patterns: ['équilibre', 'harmonie', 'vie personnelle', 'temps famille', 'moins travailler']
      }
    ];
    
    textualResponses.forEach(response => {
      const text = response.text.toLowerCase();
      
      intentionPatterns.forEach(intention => {
        intention.patterns.forEach(pattern => {
          if (text.includes(pattern)) {
            intentions.push({
              intention: intention.name,
              text: response.text,
              moduleId: response.moduleId
            });
          }
        });
      });
    });
    
    return intentions;
  }

  // Intégrer les résultats de l'analyse NLP dans les scores
  static integrateNLPAnalysisToScores(nlpAnalysis, categoryScores) {
    // Utiliser les thèmes identifiés pour augmenter les scores des catégories correspondantes
    nlpAnalysis.keyTopics.forEach(topic => {
      const { topic: topicName, count } = topic;
      
      // Mappings entre thèmes et catégories
      const topicCategoryMapping = {
        stress: this.RECOMMENDATION_CATEGORIES.STRESS,
        méditation: this.RECOMMENDATION_CATEGORIES.MINDFULNESS,
        travail: this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY,
        sommeil: this.RECOMMENDATION_CATEGORIES.BALANCE,
        exercice: this.RECOMMENDATION_CATEGORIES.WELLBEING,
        alimentation: this.RECOMMENDATION_CATEGORIES.WELLBEING,
        relations: this.RECOMMENDATION_CATEGORIES.SOCIAL,
        productivité: this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY,
        créativité: this.RECOMMENDATION_CATEGORIES.GROWTH,
        concentration: this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY
      };
      
      const category = topicCategoryMapping[topicName];
      if (category) {
        categoryScores[category] += count * 2;
      }
    });
    
    // Utiliser les résultats de l'analyse de sentiment
    const { overall } = nlpAnalysis.sentiments;
    
    // Si beaucoup de sentiments négatifs, augmenter stress et équilibre
    if (overall.negative > overall.positive) {
      categoryScores[this.RECOMMENDATION_CATEGORIES.STRESS] += overall.negative * 2;
      categoryScores[this.RECOMMENDATION_CATEGORIES.BALANCE] += overall.negative;
    }
    
    // Si beaucoup de sentiments positifs, augmenter croissance personnelle
    if (overall.positive > overall.negative) {
      categoryScores[this.RECOMMENDATION_CATEGORIES.GROWTH] += overall.positive;
    }
    
    // Interpréter les intentions
    nlpAnalysis.intentions.forEach(intention => {
      switch (intention.intention) {
        case 'améliorer_stress':
          categoryScores[this.RECOMMENDATION_CATEGORIES.STRESS] += 3;
          categoryScores[this.RECOMMENDATION_CATEGORIES.MINDFULNESS] += 2;
          break;
        case 'améliorer_sommeil':
          categoryScores[this.RECOMMENDATION_CATEGORIES.BALANCE] += 3;
          categoryScores[this.RECOMMENDATION_CATEGORIES.WELLBEING] += 2;
          break;
        case 'augmenter_productivité':
          categoryScores[this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY] += 3;
          categoryScores[this.RECOMMENDATION_CATEGORIES.GROWTH] += 1;
          break;
        case 'équilibre_vie':
          categoryScores[this.RECOMMENDATION_CATEGORIES.BALANCE] += 3;
          categoryScores[this.RECOMMENDATION_CATEGORIES.SOCIAL] += 2;
          break;
        default:
          // Cas par défaut pour les intentions non reconnues
          categoryScores[this.RECOMMENDATION_CATEGORIES.GENERAL] += 1;
          break;
      }
    });
  }

  // Analyser les réponses selon la méthode classique
  static analyzeClassicResponses(userResponses, categoryScores) {
    // Analyser les réponses pour identifier les tendances
    if (userResponses && userResponses.length > 0) {
      userResponses.forEach(response => {
        // Analyse des réponses par module
        if (response.module_id) {
          if (response.module_id.startsWith('mindfulness')) {
            this.analyzeModuleResponses(response, categoryScores, this.RECOMMENDATION_CATEGORIES.MINDFULNESS);
          } else if (response.module_id.startsWith('productivity')) {
            this.analyzeModuleResponses(response, categoryScores, this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY);
          } else if (response.module_id.startsWith('stress')) {
            this.analyzeModuleResponses(response, categoryScores, this.RECOMMENDATION_CATEGORIES.STRESS);
          } else if (response.module_id.startsWith('balance')) {
            this.analyzeModuleResponses(response, categoryScores, this.RECOMMENDATION_CATEGORIES.BALANCE);
          } else if (response.module_id === 'onboarding') {
            this.analyzeOnboardingResponses(response, categoryScores);
          }
        }
      });
    }
  }

  // Analyser les métadonnées utilisateur
  static analyzeUserMetadata(userMetadata, categoryScores) {
    try {
      // Analyse des préférences utilisateur basées sur les métadonnées
      if (userMetadata.interests && Array.isArray(userMetadata.interests)) {
        userMetadata.interests.forEach(interest => {
          // Mappings entre intérêts et catégories
          if (interest.includes('méditation') || interest.includes('yoga')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.MINDFULNESS] += 3;
          }
          if (interest.includes('productivité') || interest.includes('efficacité')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY] += 3;
          }
          if (interest.includes('stress') || interest.includes('relaxation')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.STRESS] += 3;
          }
          if (interest.includes('équilibre') || interest.includes('bien-être')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.BALANCE] += 3;
          }
          if (interest.includes('alimentation') || interest.includes('fitness')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.WELLBEING] += 3;
          }
          if (interest.includes('social') || interest.includes('communication')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.SOCIAL] += 3;
          }
          if (interest.includes('apprendre') || interest.includes('développement')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.GROWTH] += 3;
          }
        });
      }
      
      // Analyse de l'âge et du secteur d'activité
      if (userMetadata.age) {
        const age = parseInt(userMetadata.age);
        if (age > 45) {
          // Les personnes plus âgées peuvent avoir des besoins spécifiques d'équilibre
          categoryScores[this.RECOMMENDATION_CATEGORIES.BALANCE] += 2;
        } else if (age < 30) {
          // Les plus jeunes peuvent être plus intéressés par la productivité et la croissance
          categoryScores[this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY] += 2;
          categoryScores[this.RECOMMENDATION_CATEGORIES.GROWTH] += 2;
        }
      }
      
      if (userMetadata.industry) {
        // Adaptation basée sur le secteur d'activité
        const industry = userMetadata.industry.toLowerCase();
        if (industry.includes('tech') || industry.includes('informatique')) {
          categoryScores[this.RECOMMENDATION_CATEGORIES.STRESS] += 2;
          categoryScores[this.RECOMMENDATION_CATEGORIES.BALANCE] += 2;
        } else if (industry.includes('santé') || industry.includes('médical')) {
          categoryScores[this.RECOMMENDATION_CATEGORIES.STRESS] += 3;
          categoryScores[this.RECOMMENDATION_CATEGORIES.WELLBEING] += 2;
        } else if (industry.includes('finance') || industry.includes('banque')) {
          categoryScores[this.RECOMMENDATION_CATEGORIES.STRESS] += 3;
          categoryScores[this.RECOMMENDATION_CATEGORIES.MINDFULNESS] += 2;
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse des métadonnées utilisateur:', error);
    }
  }

  // Créer des recommandations améliorées basées sur les scores enrichis
  static createEnhancedRecommendationsFromScores(categoryScores, nlpAnalysis) {
    const recommendations = [];
    const allModules = ContentService.getAllModules();
    
    // Trier les catégories par score (du plus élevé au plus bas)
    const sortedCategories = Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1]);
    
    // Générer des recommandations pour les 3 catégories principales
    for (let i = 0; i < Math.min(3, sortedCategories.length); i++) {
      const [category, score] = sortedCategories[i];
      if (score >= 5) { // Seuil minimum pour recommander
        // Trouver des modules dans cette catégorie
        const modulesInCategory = allModules.filter(module => 
          module.islandId === category || 
          module.tags?.includes(category)
        );
        
        if (modulesInCategory.length > 0) {
          // Prendre jusqu'à 2 modules de cette catégorie
          const recommendedModules = modulesInCategory.slice(0, 2);
          
          recommendedModules.forEach(module => {
            recommendations.push({
              type: 'module',
              id: module.id,
              title: module.title,
              category,
              reason: this.getEnhancedRecommendationReason(category, score, nlpAnalysis),
              score,
              tags: module.tags || []
            });
          });
        }
      }
    }
    
    // Ajouter des recommandations générales basées sur les thèmes identifiés
    if (nlpAnalysis.keyTopics.length > 0) {
      const topTopic = nlpAnalysis.keyTopics[0].topic;
      recommendations.push({
        type: 'general',
        title: `Explorez "${topTopic}" pour améliorer votre bien-être`,
        description: `Nos analyses montrent que le thème "${topTopic}" est important pour vous. Découvrez nos modules pour approfondir ce sujet.`,
        category: this.RECOMMENDATION_CATEGORIES.GENERAL,
        reason: `Basé sur vos réponses mentionnant "${topTopic}"`,
        score: 8
      });
    }
    
    // S'assurer d'avoir au moins une recommandation
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'general',
        title: 'Explorez de nouveaux horizons',
        description: 'Découvrez différentes approches pour améliorer votre bien-être au travail',
        category: this.RECOMMENDATION_CATEGORIES.GENERAL,
        reason: 'Basé sur votre profil global',
        score: 7
      });
    }
    
    return recommendations;
  }

  // Obtenir une raison personnalisée améliorée pour la recommandation
  static getEnhancedRecommendationReason(category, score, nlpAnalysis) {
    const reasons = {
      [this.RECOMMENDATION_CATEGORIES.MINDFULNESS]: [
        'Vous semblez intéressé par les pratiques de pleine conscience',
        'Ces exercices pourraient vous aider à développer votre attention au moment présent',
        'Basé sur vos réponses concernant la méditation et la concentration'
      ],
      [this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY]: [
        'Pour améliorer votre organisation et votre efficacité',
        'Ces techniques pourraient vous aider à mieux gérer votre temps',
        'Basé sur vos objectifs de productivité'
      ],
      [this.RECOMMENDATION_CATEGORIES.STRESS]: [
        'Pour vous aider à mieux gérer le stress au quotidien',
        'Ces pratiques pourraient réduire votre niveau d\'anxiété',
        'Basé sur vos réponses concernant la gestion du stress'
      ],
      [this.RECOMMENDATION_CATEGORIES.BALANCE]: [
        'Pour vous aider à trouver un meilleur équilibre vie pro/perso',
        'Ces modules favorisent l\'harmonie entre les différentes sphères de votre vie',
        'Basé sur votre recherche d\'équilibre'
      ],
      [this.RECOMMENDATION_CATEGORIES.WELLBEING]: [
        'Pour améliorer votre bien-être général',
        'Ces modules vous aideront à prendre soin de vous',
        'Pour renforcer votre vitalité au quotidien'
      ],
      [this.RECOMMENDATION_CATEGORIES.SOCIAL]: [
        'Pour développer vos compétences relationnelles',
        'Ces modules vous aideront à mieux communiquer avec les autres',
        'Pour favoriser des relations harmonieuses'
      ],
      [this.RECOMMENDATION_CATEGORIES.GROWTH]: [
        'Pour stimuler votre développement personnel',
        'Ces modules vous aideront à atteindre votre plein potentiel',
        'Pour nourrir votre croissance personnelle'
      ],
      [this.RECOMMENDATION_CATEGORIES.GENERAL]: [
        'Recommandation personnalisée basée sur votre profil',
        'Pour explorer de nouvelles approches de bien-être',
        'Pour diversifier vos pratiques'
      ]
    };
    
    // Personnalisation basée sur l'analyse NLP
    if (nlpAnalysis.sentiments.overall.negative > nlpAnalysis.sentiments.overall.positive) {
      if (category === this.RECOMMENDATION_CATEGORIES.STRESS || 
          category === this.RECOMMENDATION_CATEGORIES.BALANCE) {
        return 'Nos analyses montrent que vous pourriez bénéficier de techniques pour réduire le stress et retrouver plus de sérénité';
      }
    }
    
    if (nlpAnalysis.keyTopics.length > 0) {
      const topTopic = nlpAnalysis.keyTopics[0].topic;
      if ((topTopic === 'stress' && category === this.RECOMMENDATION_CATEGORIES.STRESS) ||
          (topTopic === 'méditation' && category === this.RECOMMENDATION_CATEGORIES.MINDFULNESS) ||
          (topTopic === 'productivité' && category === this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY) ||
          (topTopic === 'sommeil' && category === this.RECOMMENDATION_CATEGORIES.BALANCE)) {
        return `Recommandé pour vous car vous avez mentionné "${topTopic}" dans vos réponses`;
      }
    }
    
    // Sélectionner une raison par défaut dans la catégorie
    const categoryReasons = reasons[category] || reasons[this.RECOMMENDATION_CATEGORIES.GENERAL];
    const randomIndex = Math.floor(Math.random() * categoryReasons.length);
    return categoryReasons[randomIndex];
  }

  // Analyser les réponses d'un module spécifique
  static analyzeModuleResponses(moduleResponse, categoryScores, category) {
    try {
      const responses = moduleResponse.responses;
      if (!responses) return;

      // Analyse basée sur le type de module
      if (typeof responses === 'object') {
        // Parcourir toutes les réponses du module
        Object.entries(responses).forEach(([questionId, answer]) => {
          // Analyse des réponses à choix multiples
          if (answer && typeof answer === 'string') {
            // Analyse simplifiée basée sur des mots-clés
            if (answer.includes('stress') || answer.includes('anxiété')) {
              categoryScores[this.RECOMMENDATION_CATEGORIES.STRESS] += 2;
            }
            if (answer.includes('concentration') || answer.includes('focus')) {
              categoryScores[this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY] += 2;
            }
            if (answer.includes('méditation') || answer.includes('respiration')) {
              categoryScores[this.RECOMMENDATION_CATEGORIES.MINDFULNESS] += 2;
            }
            if (answer.includes('équilibre') || answer.includes('harmonie')) {
              categoryScores[this.RECOMMENDATION_CATEGORIES.BALANCE] += 2;
            }
            if (answer.includes('énergie') || answer.includes('santé')) {
              categoryScores[this.RECOMMENDATION_CATEGORIES.WELLBEING] += 2;
            }
            if (answer.includes('relations') || answer.includes('communication')) {
              categoryScores[this.RECOMMENDATION_CATEGORIES.SOCIAL] += 2;
            }
            if (answer.includes('apprendre') || answer.includes('développement')) {
              categoryScores[this.RECOMMENDATION_CATEGORIES.GROWTH] += 2;
            }
          }
          // Analyse des réponses numériques (échelles)
          else if (typeof answer === 'number') {
            // Si la réponse est faible (< 3 sur 5), augmenter le score de la catégorie
            if (answer < 3) {
              categoryScores[category] += (3 - answer) * 2;
            }
          }
          // Analyse des réponses à choix multiples
          else if (Array.isArray(answer)) {
            answer.forEach(choice => {
              // Analyse basée sur les choix spécifiques
              if (choice === 'a' || choice === 'b') { // Supposons que a et b sont des choix liés au stress
                categoryScores[this.RECOMMENDATION_CATEGORIES.STRESS] += 1;
              }
              if (choice === 'c' || choice === 'd') { // Supposons que c et d sont des choix liés à la productivité
                categoryScores[this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY] += 1;
              }
            });
          }
        });

        // Augmenter le score de la catégorie principale du module
        categoryScores[category] += 3;
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse des réponses du module:', error);
    }
  }

  // Analyser les réponses d'onboarding
  static analyzeOnboardingResponses(onboardingResponse, categoryScores) {
    try {
      const responses = onboardingResponse.responses;
      if (!responses) return;

      // Analyse des objectifs et préférences initiales
      if (responses.goals) {
        if (Array.isArray(responses.goals)) {
          responses.goals.forEach(goal => {
            if (goal.includes('stress') || goal.includes('anxiété')) {
              categoryScores[this.RECOMMENDATION_CATEGORIES.STRESS] += 3;
            }
            if (goal.includes('productivité') || goal.includes('concentration')) {
              categoryScores[this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY] += 3;
            }
            if (goal.includes('méditation') || goal.includes('pleine conscience')) {
              categoryScores[this.RECOMMENDATION_CATEGORIES.MINDFULNESS] += 3;
            }
            if (goal.includes('équilibre') || goal.includes('bien-être')) {
              categoryScores[this.RECOMMENDATION_CATEGORIES.BALANCE] += 3;
            }
            if (goal.includes('santé') || goal.includes('énergie')) {
              categoryScores[this.RECOMMENDATION_CATEGORIES.WELLBEING] += 3;
            }
            if (goal.includes('social') || goal.includes('relations')) {
              categoryScores[this.RECOMMENDATION_CATEGORIES.SOCIAL] += 3;
            }
            if (goal.includes('apprendre') || goal.includes('développement')) {
              categoryScores[this.RECOMMENDATION_CATEGORIES.GROWTH] += 3;
            }
          });
        } else if (typeof responses.goals === 'string') {
          // Analyse du texte de l'objectif
          const goalText = responses.goals.toLowerCase();
          if (goalText.includes('stress') || goalText.includes('anxiété')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.STRESS] += 3;
          }
          if (goalText.includes('productivité') || goalText.includes('concentration')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY] += 3;
          }
          if (goalText.includes('méditation') || goalText.includes('pleine conscience')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.MINDFULNESS] += 3;
          }
          if (goalText.includes('équilibre') || goalText.includes('bien-être')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.BALANCE] += 3;
          }
          if (goalText.includes('santé') || goalText.includes('énergie')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.WELLBEING] += 3;
          }
          if (goalText.includes('social') || goalText.includes('relations')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.SOCIAL] += 3;
          }
          if (goalText.includes('apprendre') || goalText.includes('développement')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.GROWTH] += 3;
          }
        }
      }

      // Analyse des niveaux de stress déclarés
      if (responses.stress_level && typeof responses.stress_level === 'number') {
        categoryScores[this.RECOMMENDATION_CATEGORIES.STRESS] += responses.stress_level * 2;
      }

      // Analyse des préférences d'activités
      if (responses.preferred_activities && Array.isArray(responses.preferred_activities)) {
        responses.preferred_activities.forEach(activity => {
          if (activity.includes('méditation') || activity.includes('yoga')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.MINDFULNESS] += 2;
          }
          if (activity.includes('organisation') || activity.includes('planification')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY] += 2;
          }
          if (activity.includes('relaxation') || activity.includes('détente')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.STRESS] += 2;
          }
          if (activity.includes('équilibre') || activity.includes('harmonie')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.BALANCE] += 2;
          }
          if (activity.includes('santé') || activity.includes('fitness')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.WELLBEING] += 2;
          }
          if (activity.includes('social') || activity.includes('communication')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.SOCIAL] += 2;
          }
          if (activity.includes('apprendre') || activity.includes('développement')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.GROWTH] += 2;
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse des réponses d\'onboarding:', error);
    }
  }

  // Analyser les données de progression
  static analyzeProgressData(progressData, categoryScores) {
    try {
      // Analyser les modules complétés
      if (progressData.completedModules) {
        const completedModuleIds = Object.keys(progressData.completedModules);
        
        // Identifier les domaines où l'utilisateur est actif
        completedModuleIds.forEach(moduleId => {
          if (moduleId.startsWith('mindfulness')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.MINDFULNESS] += 1;
          } else if (moduleId.startsWith('productivity')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY] += 1;
          } else if (moduleId.startsWith('stress')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.STRESS] += 1;
          } else if (moduleId.startsWith('balance')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.BALANCE] += 1;
          } else if (moduleId.startsWith('wellbeing')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.WELLBEING] += 1;
          } else if (moduleId.startsWith('social')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.SOCIAL] += 1;
          } else if (moduleId.startsWith('growth')) {
            categoryScores[this.RECOMMENDATION_CATEGORIES.GROWTH] += 1;
          }
        });

        // Identifier les domaines où l'utilisateur est moins actif (pour recommandations)
        const allCategories = Object.values(this.RECOMMENDATION_CATEGORIES).filter(cat => cat !== 'general');
        allCategories.forEach(category => {
          const modulesInCategory = completedModuleIds.filter(id => id.startsWith(category)).length;
          if (modulesInCategory === 0) {
            // Augmenter le score pour recommander des modules dans cette catégorie
            categoryScores[category] += 5;
          }
        });
      }

      // Analyser le score de bien-être
      if (progressData.wellnessScore) {
        // Si le score est bas, recommander des modules de stress et d'équilibre
        if (progressData.wellnessScore < 50) {
          categoryScores[this.RECOMMENDATION_CATEGORIES.STRESS] += 4;
          categoryScores[this.RECOMMENDATION_CATEGORIES.BALANCE] += 3;
          categoryScores[this.RECOMMENDATION_CATEGORIES.WELLBEING] += 3;
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse des données de progression:', error);
    }
  }

  // Normaliser les scores pour équilibrer les recommandations
  static normalizeScores(categoryScores) {
    // Trouver le score maximum
    const maxScore = Math.max(...Object.values(categoryScores));
    
    // Normaliser tous les scores sur une échelle de 0 à 10
    if (maxScore > 0) {
      Object.keys(categoryScores).forEach(category => {
        categoryScores[category] = Math.round((categoryScores[category] / maxScore) * 10);
      });
    }
  }

  // Méthode de fallback pour la génération de recommandations
  static generateRecommendations(userResponses, progressData) {
    // Initialiser les scores par catégorie
    const categoryScores = {
      [this.RECOMMENDATION_CATEGORIES.MINDFULNESS]: 0,
      [this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY]: 0,
      [this.RECOMMENDATION_CATEGORIES.STRESS]: 0,
      [this.RECOMMENDATION_CATEGORIES.BALANCE]: 0,
      [this.RECOMMENDATION_CATEGORIES.GENERAL]: 0
    };

    // Analyser les réponses pour identifier les tendances
    if (userResponses && userResponses.length > 0) {
      userResponses.forEach(response => {
        // Analyse des réponses par module
        if (response.module_id) {
          if (response.module_id.startsWith('mindfulness')) {
            this.analyzeModuleResponses(response, categoryScores, this.RECOMMENDATION_CATEGORIES.MINDFULNESS);
          } else if (response.module_id.startsWith('productivity')) {
            this.analyzeModuleResponses(response, categoryScores, this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY);
          } else if (response.module_id.startsWith('stress')) {
            this.analyzeModuleResponses(response, categoryScores, this.RECOMMENDATION_CATEGORIES.STRESS);
          } else if (response.module_id.startsWith('balance')) {
            this.analyzeModuleResponses(response, categoryScores, this.RECOMMENDATION_CATEGORIES.BALANCE);
          } else if (response.module_id === 'onboarding') {
            this.analyzeOnboardingResponses(response, categoryScores);
          }
        }
      });
    }

    // Analyser les données de progression si disponibles
    if (progressData && progressData.progress_data) {
      const parsedProgress = typeof progressData.progress_data === 'string' 
        ? JSON.parse(progressData.progress_data) 
        : progressData.progress_data;
      
      this.analyzeProgressData(parsedProgress, categoryScores);
    }

    // Normaliser les scores
    this.normalizeScores(categoryScores);

    // Générer des recommandations basées sur les scores
    return this.createRecommendationsFromScores(categoryScores);
  }

  // Méthode de fallback pour la création de recommandations
  static createRecommendationsFromScores(categoryScores) {
    const recommendations = [];
    const allModules = ContentService.getAllModules();
    
    // Trier les catégories par score (du plus élevé au plus bas)
    const sortedCategories = Object.entries(categoryScores)
      .filter(([category]) => category !== this.RECOMMENDATION_CATEGORIES.GENERAL)
      .sort((a, b) => b[1] - a[1]);
    
    // Générer des recommandations pour les 2 catégories principales
    for (let i = 0; i < Math.min(2, sortedCategories.length); i++) {
      const [category, score] = sortedCategories[i];
      if (score >= 5) { // Seuil minimum pour recommander
        // Trouver des modules dans cette catégorie
        const modulesInCategory = allModules.filter(module => module.islandId === category);
        
        if (modulesInCategory.length > 0) {
          // Prendre jusqu'à 2 modules de cette catégorie
          const recommendedModules = modulesInCategory.slice(0, 2);
          
          recommendedModules.forEach(module => {
            recommendations.push({
              type: 'module',
              id: module.id,
              title: module.title,
              category,
              reason: this.getRecommendationReason(category, score),
              score
            });
          });
        }
      }
    }
    
    // Ajouter des recommandations générales si nécessaire
    if (recommendations.length < 3 && categoryScores[this.RECOMMENDATION_CATEGORIES.GENERAL] > 0) {
      recommendations.push({
        type: 'general',
        title: 'Explorez de nouveaux horizons',
        description: 'Découvrez différentes approches pour améliorer votre bien-être au travail',
        category: this.RECOMMENDATION_CATEGORIES.GENERAL,
        reason: 'Basé sur votre profil global',
        score: categoryScores[this.RECOMMENDATION_CATEGORIES.GENERAL]
      });
    }
    
    return recommendations;
  }

  // Obtenir une raison personnalisée pour la recommandation (méthode de fallback)
  static getRecommendationReason(category, score) {
    const reasons = {
      [this.RECOMMENDATION_CATEGORIES.MINDFULNESS]: [
        'Vous semblez intéressé par les pratiques de pleine conscience',
        'Ces exercices pourraient vous aider à développer votre attention au moment présent',
        'Basé sur vos réponses concernant la méditation et la concentration'
      ],
      [this.RECOMMENDATION_CATEGORIES.PRODUCTIVITY]: [
        'Pour améliorer votre organisation et votre efficacité',
        'Ces techniques pourraient vous aider à mieux gérer votre temps',
        'Basé sur vos objectifs de productivité'
      ],
      [this.RECOMMENDATION_CATEGORIES.STRESS]: [
        'Pour vous aider à mieux gérer le stress au quotidien',
        'Ces pratiques pourraient réduire votre niveau d\'anxiété',
        'Basé sur vos réponses concernant la gestion du stress'
      ],
      [this.RECOMMENDATION_CATEGORIES.BALANCE]: [
        'Pour vous aider à trouver un meilleur équilibre vie pro/perso',
        'Ces modules favorisent l\'harmonie entre les différentes sphères de votre vie',
        'Basé sur votre recherche d\'équilibre'
      ],
      [this.RECOMMENDATION_CATEGORIES.GENERAL]: [
        'Recommandation personnalisée basée sur votre profil',
        'Pour explorer de nouvelles approches de bien-être',
        'Pour diversifier vos pratiques'
      ]
    };
    
    // Sélectionner une raison aléatoire dans la catégorie
    const categoryReasons = reasons[category] || reasons[this.RECOMMENDATION_CATEGORIES.GENERAL];
    const randomIndex = Math.floor(Math.random() * categoryReasons.length);
    return categoryReasons[randomIndex];
  }

  // Sauvegarder les recommandations dans Supabase
  static async saveRecommendations(userId, recommendations) {
    try {
      // Vérifier si la table user_recommendations existe
      const { error: tableCheckError } = await supabase
        .from('user_recommendations')
        .select('id')
        .limit(1);
      
      // Si la table n'existe pas, la créer
      if (tableCheckError && (tableCheckError.code === 'PGRST116' || tableCheckError.message.includes('does not exist'))) {
        // Stocker les recommandations dans user_progress en attendant
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (!progressError) {
          let parsedProgress = typeof progressData.progress_data === 'string' 
            ? JSON.parse(progressData.progress_data) 
            : progressData.progress_data;
          
          // Ajouter les recommandations au progress_data
          parsedProgress.recommendations = {
            items: recommendations,
            generatedAt: new Date().toISOString(),
            analysisVersion: AI_CONFIG.version
          };
          
          // Mettre à jour user_progress
          await supabase
            .from('user_progress')
            .update({
              progress_data: JSON.stringify(parsedProgress),
              updated_at: new Date()
            })
            .eq('user_id', userId);
        }
      } else {
        // Si la table existe, insérer/mettre à jour les recommandations
        await supabase
          .from('user_recommendations')
          .upsert({
            user_id: userId,
            recommendations: recommendations,
            generated_at: new Date(),
            updated_at: new Date(),
            analysis_version: AI_CONFIG.version,
            analysis_metadata: {
              modelVersion: 'v1.2',
              categories: Object.values(this.RECOMMENDATION_CATEGORIES),
              timestamp: new Date().toISOString()
            }
          }, { onConflict: 'user_id' });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des recommandations:', error);
      return ErrorHandler.handle(error, 'Enregistrement des recommandations');
    }
  }

  // Récupérer les recommandations d'un utilisateur
  static async getUserRecommendations(userId) {
    try {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Utilisateur non connecté' };
        userId = user.id;
      }

      // Vérifier d'abord dans la table user_recommendations
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from('user_recommendations')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      // Si les recommandations existent dans la table dédiée
      if (!recommendationsError && recommendationsData) {
        return { 
          success: true, 
          recommendations: recommendationsData.recommendations,
          generatedAt: recommendationsData.generated_at,
          analysisVersion: recommendationsData.analysis_version || AI_CONFIG.version
        };
      }
      
      // Sinon, vérifier dans user_progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!progressError && progressData) {
        const parsedProgress = typeof progressData.progress_data === 'string' 
          ? JSON.parse(progressData.progress_data) 
          : progressData.progress_data;
        
        if (parsedProgress.recommendations) {
          return { 
            success: true, 
            recommendations: parsedProgress.recommendations.items,
            generatedAt: parsedProgress.recommendations.generatedAt,
            analysisVersion: parsedProgress.recommendations.analysisVersion || AI_CONFIG.version
          };
        }
      }
      
      // Si aucune recommandation n'est trouvée, en générer de nouvelles
      return await this.analyzeUserResponses(userId);
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations:', error);
      return ErrorHandler.handle(error, 'Récupération des recommandations');
    }
  }
}

export default AIRecommendationService;