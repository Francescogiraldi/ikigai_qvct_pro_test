# IKIGAI - Application de bien-être

IKIGAI est une application de bien-être qui aide les utilisateurs à trouver leur équilibre et leur épanouissement, en se basant sur le concept japonais de l'Ikigai (raison d'être).

## Note de compatibilité

✅ **Important**: L'intégration avec le chatbot Gradio a été restaurée. Le chatbot utilise maintenant l'API Gradio pour fournir des réponses intelligentes sur les sujets liés au bien-être et à l'IKIGAI.

## Structure du projet

> **Note**: La structure du projet a été améliorée pour plus de clarté et d'organisation. Les dernières optimisations incluent la fusion de composants dupliqués et la centralisation des imports.

L'application est structurée avec une séparation claire entre le frontend et le backend intégré :

```
src/
  ├── backend/              # Logique métier et services
  │   ├── api/              # Points d'entrée API (façade)
  │   │   └── index.js      # API centralisée
  │   ├── models/           # Modèles de données
  │   │   ├── Island.js     # Modèle pour les îles
  │   │   ├── Module.js     # Modèle pour les modules
  │   │   ├── Challenge.js  # Modèle pour les défis
  │   │   ├── Exercise.js   # Modèle pour les exercices
  │   │   └── UserProgress.js # Modèle pour la progression
  │   └── services/         # Services (auth, stockage, contenu, IA)
  │       ├── AuthService.js           # Gestion de l'authentification
  │       ├── StorageService.js        # Persistance des données
  │       ├── ContentService.js        # Gestion du contenu
  │       └── AIRecommendationService.js # Service IA pour recommandations
  ├── frontend/             # Interface utilisateur
  │   ├── components/       # Composants réutilisables
  │   │   ├── ui/           # Composants UI de base
  │   │   │   ├── Button.js         # Bouton customisable
  │   │   │   ├── Badge.js          # Badge d'accomplissement
  │   │   │   ├── Character.js      # Personnage animé
  │   │   │   ├── ChatBot.js        # Chatbot avec API Gradio ou simulation locale
  │   │   │   ├── Logo.js           # Logo de l'application
  │   │   │   ├── ProgressBar.js    # Barre de progression
  │   │   │   ├── StreakCounter.js  # Compteur de séries
  │   │   │   ├── WellnessScore.js  # Score de bien-être
  │   │   │   ├── XPBar.js          # Barre d'expérience
  │   │   │   └── onboarding/       # Composants spécifiques à l'onboarding
  │   │   │       └── index.js      # Exports des composants d'onboarding
  │   │   ├── islands/      # Composants liés aux îles
  │   │   │   ├── IslandCard.js     # Carte d'île
  │   │   │   ├── ModuleCard.js     # Carte de module
  │   │   │   ├── ModuleViewer.js   # Visualiseur de module
  │   │   │   ├── Quiz.js           # Interface de quiz
  │   │   │   └── questions/        # Types de questions
  │   │   │       ├── ScaleQuestion.js      # Question échelle
  │   │   │       ├── MultipleChoiceQuestion.js # Choix multiple
  │   │   │       ├── CheckboxQuestion.js   # Cases à cocher
  │   │   │       └── TextQuestion.js       # Question texte
  │   │   ├── challenges/   # Composants liés aux défis
  │   │   │   ├── ChallengeCard.js    # Carte de défi
  │   │   │   └── QuickExerciseCard.js # Exercice rapide
  │   │   └── recommendations/ # Composants liés aux recommandations
  │   │       ├── RecommendationCard.js     # Carte de recommandation
  │   │       └── RecommendationsSection.js # Section de recommandations
  │   ├── context/          # Contextes React pour le state global
  │   ├── styles/           # Styles CSS/SCSS
  │   └── pages/            # Pages principales
  │       ├── HomePage.js          # Page d'accueil
  │       ├── IslandView.js        # Vue détaillée d'une île
  │       ├── WelcomePage.js       # Page de bienvenue
  │       ├── SignupPage.js        # Page d'inscription/connexion
  │       ├── OnboardingJourney.js # Parcours d'onboarding
  │       └── OnboardingAnalysisPage.js # Page d'analyse d'onboarding
  ├── shared/               # Ressources partagées
  │   ├── supabase.js       # Configuration Supabase
  │   └── index.js          # Exports centralisés pour l'application
  ├── config/               # Configuration centralisée
  │   └── index.js          # Exportation des constantes de configuration
  ├── data/                 # Données statiques de l'application
  ├── App.js                # Composant principal
  └── index.js              # Point d'entrée
```

## Caractéristiques principales

- **Îles thématiques** : Parcours spécifiques sur des thèmes comme la pleine conscience, la productivité, l'anti-stress et l'équilibre.
- **Modules éducatifs** : Contenus interactifs avec questionnaires pour approfondir chaque thématique.
- **Défis quotidiens** : Activités courtes pour améliorer le bien-être au quotidien.
- **Système de progression** : Points, badges et niveaux pour motiver l'engagement.
- **Compatible offline** : Fonctionne même sans connexion grâce au stockage local avec synchronisation.
- **PWA** : Installable sur mobile et desktop comme une application native.

## Technologies utilisées

- **Frontend** : React 18 avec Tailwind CSS pour le style et Framer Motion pour les animations
- **Backend intégré** : Services JavaScript structurés qui gèrent la logique métier
- **Stockage** : Supabase pour l'authentification et le stockage cloud, avec localStorage pour le mode hors ligne
- **PWA** : Service Worker pour la fonctionnalité hors ligne et l'installation en tant qu'application

## Architecture Frontend

L'architecture frontend suit les principes de conception suivants :

### Organisation des composants

1. **Composants atomiques (ui/)**
   - Composants de base réutilisables (Button, Badge, ProgressBar, etc.)
   - Acceptent des props pour personnaliser leur apparence et comportement
   - Utilisent Framer Motion pour les animations et transitions fluides

2. **Composants composites**
   - Regroupés par domaine fonctionnel (islands/, challenges/, profile/)
   - Combinent des composants atomiques pour créer des interfaces plus complexes
   - Encapsulent la logique de présentation spécifique à chaque domaine

3. **Pages**
   - Composants de haut niveau qui assemblent les composants composites
   - Gèrent l'état local de la page et les interactions avec le backend via l'API
   - Implémentent les transitions entre différents états de l'application

### Gestion de l'état

- État local avec useState pour les composants simples
- Passage de props pour la communication parent-enfant
- API centralisée pour l'accès aux données du backend
- Stockage persistant via StorageService

### Principes de design

- **Interface mobile-first** utilisant Tailwind CSS
- **Design atomique** pour la réutilisation des composants
- **Animations subtilement engageantes** avec Framer Motion
- **Guidage visuel** par la couleur et les icônes pour chaque domaine thématique
- **Accessibilité** avec contraste adéquat et indications visuelles claires

## Installation

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm start

# Construction pour la production
npm run build
```

## Architecture Backend Intégrée

Le backend est intégré au frontend pour faciliter le déploiement tout en maintenant une séparation claire des responsabilités. Cette approche utilise plusieurs patterns architecturaux pour assurer une maintenance facile et une évolutivité :

### Composants clés du Backend

1. **API Facade (api/index.js)**
   - Point d'entrée unique exposant toutes les fonctionnalités du backend
   - Interface simplifiée qui masque la complexité sous-jacente
   - Ségrégation logique par domaine (auth, progress, content)

2. **Modèles de données**
   - Utilisation du pattern Domain Model pour encapsuler les données et la logique
   - Chaque modèle gère sa propre validation et transformation de données
   - Conversions JSON pour la sérialisation/désérialisation

3. **Services**
   - **StorageService** : Gère la persistance avec une double stratégie (Supabase + localStorage)
   - **AuthService** : Encapsule l'authentification via Supabase
   - **ContentService** : Gère la récupération et la manipulation du contenu

4. **Stratégie Online/Offline**
   - Fonctionnement prioritaire avec Supabase quand en ligne
   - Fallback automatique sur localStorage en mode hors ligne
   - Mécanisme de synchronisation pour rétablir la cohérence après reconnexion

### Patterns architecturaux utilisés

- **Facade Pattern** : Pour simplifier l'interface du backend (api/index.js)
- **Repository Pattern** : Dans les services pour abstraire la persistance
- **Strategy Pattern** : Pour la gestion online/offline
- **Domain Model Pattern** : Pour la logique métier dans les modèles

Cette architecture en couches permet une séparation claire des préoccupations tout en maintenant la facilité de déploiement propre aux applications React.

## Mode hors ligne

L'application utilise une stratégie de persistance avec Supabase lorsque la connexion est disponible, et bascule automatiquement sur localStorage en mode hors ligne. Les données sont synchronisées lorsque la connexion est rétablie.

---

Ce projet a été initialisé avec [Create React App](https://github.com/facebook/create-react-app).