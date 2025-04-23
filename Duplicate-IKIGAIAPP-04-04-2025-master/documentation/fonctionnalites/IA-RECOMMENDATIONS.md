# Documentation du Système d'Intelligence Artificielle pour les Recommandations

## Vue d'ensemble

Le système de recommandation IA de l'application IKIGAI analyse les réponses et interactions des utilisateurs pour générer des recommandations personnalisées de modules et d'exercices. Ce document décrit l'architecture, le fonctionnement et les améliorations apportées au système.

## Architecture du Système

Le système est composé de plusieurs composants clés :

1. **Service d'Analyse (AIRecommendationService)**
   - Analyse des réponses utilisateur
   - Traitement de langage naturel (NLP)
   - Génération de recommandations personnalisées
   - Stockage et récupération des recommandations

2. **Modèle de Données**
   - Table `user_recommendations` - stocke les recommandations actuelles
   - Table `user_recommendations_history` - garde l'historique des recommandations
   - Champs d'analyse et de métadonnées pour le suivi et l'amélioration

3. **Interface Utilisateur**
   - Composants de présentation des recommandations
   - Système de feedback utilisateur
   - Mécanismes d'interaction avec les recommandations

## Catégories de Recommandations

Le système utilise plusieurs catégories pour classer les recommandations :

- **Pleine Conscience (mindfulness)** : méditation, respiration, attention
- **Productivité (productivity)** : organisation, efficacité, focus
- **Gestion du Stress (stress)** : relaxation, gestion de l'anxiété
- **Équilibre (balance)** : harmonie vie pro/perso, bien-être global
- **Bien-être (wellbeing)** : santé physique, énergie
- **Social (social)** : relations, communication
- **Développement Personnel (growth)** : apprentissage, progression

## Algorithme de Recommandation

1. **Collecte des Données**
   - Réponses aux questionnaires et modules
   - Historique d'utilisation et de progression
   - Métadonnées utilisateur (si disponibles)

2. **Traitement des Données**
   - Analyse des réponses textuelles (extraction de mots-clés)
   - Analyse de sentiment (positif/négatif/neutre)
   - Détection d'intentions et de besoins

3. **Génération de Scores**
   - Attribution de scores par catégorie
   - Normalisation des scores (échelle 0-10)
   - Priorisation des catégories de forte importance

4. **Sélection de Recommandations**
   - Sélection des modules correspondant aux catégories prioritaires
   - Diversification des recommandations
   - Personnalisation des explications/raisons

## Améliorations Apportées au Système

1. **Traitement Avancé du Langage**
   - Analyse sémantique des réponses textuelles
   - Détection de sentiments et d'émotions
   - Identification d'intentions et de besoins spécifiques

2. **Modèle de Données Enrichi**
   - Extension des catégories de recommandation
   - Suivi de version d'analyse
   - Historique des recommandations

3. **Système de Feedback**
   - Collecte d'avis sur l'utilité des recommandations
   - Suivi des interactions avec les recommandations
   - Amélioration continue basée sur le feedback

4. **Interface Utilisateur Améliorée**
   - Conception visuelle plus intuitive
   - Tags et métadonnées pour contextualiser les recommandations
   - Indicateurs de priorité et de pertinence

## Utilisation de l'API

Le service expose plusieurs endpoints via l'API centralisée :

```javascript
// Analyser les réponses et générer des recommandations
API.ai.analyzeUserResponses(userId);

// Récupérer les recommandations actuelles
API.ai.getUserRecommendations(userId);

// Envoyer un feedback sur les recommandations
API.ai.sendRecommendationFeedback(userId, isHelpful, details);

// Enregistrer une interaction avec une recommandation
API.ai.logRecommendationInteraction(recommendationId, action, userId);

// Récupérer l'historique des recommandations
API.ai.getRecommendationsHistory(userId, limit);
```

## Évolutions Futures

1. **Intégration d'API IA Externes**
   - Connection à OpenAI ou Google Cloud AI pour des analyses plus avancées
   - Utilisation de grands modèles de langage (LLM) pour le traitement

2. **Apprentissage Automatique**
   - Apprentissage sur les interactions passées
   - Amélioration continue des recommandations
   - Modèles prédictifs pour anticiper les besoins utilisateur

3. **Analyse Graphique et Réseaux**
   - Visualisation des relations entre réponses, modules et préférences
   - Identification de parcours utilisateur optimaux

4. **Recommandations Contextuelles**
   - Recommandations basées sur le moment de la journée/semaine
   - Adaptation aux saisons et événements de vie