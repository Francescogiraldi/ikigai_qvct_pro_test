# Plan de réorganisation de l'application IKIGAI

## Problèmes identifiés

1. **Duplication de configuration Supabase**
   - Deux fichiers `supabase.js`: `/src/config/supabase.js` et `/src/shared/supabase.js`
   - Redirection inutile entre les deux fichiers

2. **Structure incohérente de l'application**
   - Mélange de responsabilités entre frontend et backend
   - Services avec des responsabilités qui se chevauchent
   - Dossier `supabase/` sous-utilisé

3. **Redondance dans le stockage des données**
   - Recommandations stockées à la fois dans `user_progress.progress_data` et `user_recommendations`
   - Code défensif excessif pour gérer les incohérences

4. **Fichiers et imports mal organisés**
   - Le fichier `src/shared/index.js` exporte des éléments de tous les niveaux
   - Configuration et services accessibles depuis plusieurs chemins

## Actions recommandées

### 1. Centraliser la configuration Supabase

- Conserver uniquement `/src/shared/supabase.js` comme source unique
- Supprimer `/src/config/supabase.js`
- Mettre à jour tous les imports pour pointer vers `/src/shared/supabase.js`

### 2. Réorganiser la structure des dossiers

- **Déplacer** les scripts SQL dans `/supabase/migrations/`
- **Centraliser** la documentation technique dans `/documentation/technique/`
- **Rationaliser** les tests en évitant les doublons

### 3. Améliorer l'organisation des services

- **Revoir** les responsabilités entre `StorageService` et `AIRecommendationService`
- **Clarifier** la séparation entre stockage local et Supabase

### 4. Consolider les composants similaires

- **Unifier** la structure des composants de recommandation
- **Standardiser** les imports dans toute l'application

## Échéancier

1. **Phase 1 : Centralisation de la configuration**
   - Corriger les imports Supabase
   - Simplifier les chemins d'accès

2. **Phase 2 : Réorganisation des dossiers**
   - Déplacer les fichiers SQL
   - Nettoyer la documentation

3. **Phase 3 : Refactoring des services**
   - Clarifier les responsabilités
   - Éliminer le code défensif excessif

4. **Phase 4 : Tests et validation**
   - Vérifier que toutes les fonctionnalités marchent après refactoring
   - Documenter la nouvelle structure