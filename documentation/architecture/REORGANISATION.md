# Plan de réorganisation de l'application IKIGAI

Ce document présente un plan complet pour la réorganisation de l'application IKIGAI, combinant les différentes analyses et recommandations.

## Problèmes identifiés

### 1. Structure incohérente de l'application
- Mélange de responsabilités entre frontend et backend
- Services avec des responsabilités qui se chevauchent
- Dossier `supabase/` sous-utilisé
- Organisation désordonnée des fichiers (tests, configuration)

### 2. Duplication et redondance
- Deux fichiers `supabase.js`: `/src/config/supabase.js` et `/src/shared/supabase.js`
- Redondance dans le stockage des données (recommandations stockées à deux endroits)
- Fichier `/src/backend/api.js` redondant avec `/src/backend/api/index.js`

### 3. Problèmes d'imports et d'accès
- Le fichier `src/shared/index.js` exporte des éléments de tous les niveaux
- Configuration et services accessibles depuis plusieurs chemins
- Imports inconsistants dans différents fichiers

## Structure cible proposée

```
/
├── config/                # Fichiers de configuration centralisés
│   ├── babel.config.js
│   ├── postcss.config.js
│   └── tailwind.config.js
├── public/               # Fichiers statiques publics
├── src/
│   ├── frontend/         # Interface utilisateur
│   │   ├── components/   # Composants React
│   │   ├── context/      # Contextes React
│   │   ├── hooks/        # Hooks personnalisés
│   │   ├── layouts/      # Layouts réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   └── styles/       # Styles CSS
│   ├── backend/          # Logique métier
│   │   ├── api/          # Points d'entrée API unifiés
│   │   ├── models/       # Modèles de données
│   │   └── services/     # Services métier
│   ├── shared/           # Code partagé
│   │   ├── constants/    # Constantes partagées
│   │   ├── utils/        # Utilitaires partagés
│   │   └── supabase.js   # Point d'accès unique à Supabase
│   ├── App.js            # Composant racine
│   └── index.js          # Point d'entrée
├── supabase/             # Configuration Supabase
│   └── migrations/       # Scripts de migration SQL
├── tests/                # Tests centralisés
│   ├── e2e/              # Tests end-to-end
│   ├── integration/      # Tests d'intégration
│   ├── unit/             # Tests unitaires
│   └── setupTests.js     # Configuration des tests
└── package.json          # Dépendances et scripts
```

## Plan d'action détaillé

### Phase 1 : Centralisation de la configuration

1. **Unifier la configuration Supabase**
   - Conserver uniquement `/src/shared/supabase.js`
   - Supprimer `/src/config/supabase.js`
   - Mettre à jour tous les imports pour pointer vers le fichier conservé

2. **Centraliser les fichiers de configuration**
   - Créer un dossier `/config` si nécessaire
   - Déplacer les fichiers suivants :
     - `/babel.config.js` → `/config/babel.config.js`
     - `/postcss.config.js` → `/config/postcss.config.js`
     - `/tailwind.config.js` → `/config/tailwind.config.js`
   - Mettre à jour les scripts dans `package.json` en conséquence

### Phase 2 : Réorganisation des dossiers

1. **Réorganiser les tests**
   - Créer la structure de dossiers `/tests` si nécessaire
   - Déplacer `/test-flow.js` vers `/tests/e2e/test-flow.js`
   - Déplacer `/src/setupTests.js` vers `/tests/setupTests.js`

2. **Déplacer les scripts SQL**
   - S'assurer que tous les scripts SQL sont dans `/supabase/migrations/`

3. **Éliminer les redondances**
   - Supprimer `/src/backend/api.js` après avoir mis à jour les imports
   - Mettre à jour tous les imports qui référencent ce fichier

### Phase 3 : Refactoring des services

1. **Clarifier les responsabilités des services**
   - Revoir les responsabilités entre `StorageService` et `AIRecommendationService`
   - Clarifier la séparation entre stockage local et Supabase
   - Éliminer le code défensif excessif

2. **Standardiser les accès à Supabase**
   - Remplacer les imports directs de Supabase par l'API centralisée
   - Fichiers à mettre à jour :
     - `/src/frontend/pages/SignupPage.js`
     - `/src/frontend/pages/OnboardingJourney.js`

### Phase 4 : Tests et validation

1. **Vérifier toutes les fonctionnalités**
   - Exécuter les tests unitaires et d'intégration
   - Tester manuellement les fonctionnalités principales

2. **Mettre à jour la documentation**
   - Mettre à jour le README principal
   - Mettre à jour la documentation technique pour refléter la nouvelle structure

## Avantages de cette réorganisation

- **Structure claire** : Séparation nette entre frontend et backend
- **Maintenance simplifiée** : Points d'accès uniques pour les services
- **Développement facilité** : Organisation intuitive des fichiers
- **Tests améliorés** : Structure de tests claire et organisée
- **Évolutivité** : Structure permettant d'ajouter facilement de nouvelles fonctionnalités