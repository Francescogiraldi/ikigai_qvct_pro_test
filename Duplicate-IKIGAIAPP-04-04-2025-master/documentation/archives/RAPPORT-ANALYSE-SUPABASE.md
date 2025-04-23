# Rapport d'analyse des flux de données vers Supabase

## Structure de la base de données

L'application IKIGAI utilise trois tables principales pour stocker les données utilisateur :

1. **user_progress**
   - Stocke la progression globale de l'utilisateur
   - Structure : `user_id`, `progress_data` (JSONB), `created_at`, `updated_at`
   - Contient : points, modules complétés, badges, streak, réponses aux modules

2. **onboarding_responses**
   - Table dédiée aux réponses d'onboarding
   - Structure : `user_id`, `responses` (JSONB), `created_at`, `updated_at`
   - Contient : toutes les réponses au questionnaire d'onboarding

3. **user_responses**
   - Table alternative/legacy pour stocker les réponses
   - Deux structures possibles :
     - Structure 1 : `user_id`, `module_id`, `responses` (JSONB)
     - Structure 2 : `user_id`, `question_id`, `question_text`, `answer_text`

## Flux de données

### Onboarding

1. L'utilisateur remplit le formulaire d'onboarding (`OnboardingJourney.js`)
2. Les réponses sont formatées et transmises à `StorageService.saveOnboardingResponses()`
3. Le service tente de sauvegarder les données dans cet ordre :
   1. Table `onboarding_responses` (stratégie préférée)
   2. Table `user_responses` avec structure standard
   3. Table `user_responses` avec structure par question
   4. Table `user_progress` dans le champ `moduleResponses.onboarding`
4. Sauvegarde locale dans localStorage en parallèle (fallback)

### Modules

1. L'utilisateur complète un module et soumet ses réponses
2. Les réponses sont transmises à `StorageService.saveModuleResponses()`
3. Les données sont sauvegardées dans :
   - Table `user_progress` dans le champ `moduleResponses[moduleId]`
   - Mise à jour des statistiques (points, badges, etc.)
4. Sauvegarde locale dans localStorage en parallèle (fallback)

## Mécanismes de sauvegarde

L'application utilise une approche multi-stratégies pour assurer la robustesse des sauvegardes :

1. **Stratégie principale** : Sauvegarde dans les tables dédiées de Supabase
2. **Fallback en cas d'échec** : Tentative dans une table alternative
3. **Sauvegarde locale** : Toutes les données sont également stockées dans localStorage
4. **Adaptation structurelle** : Le code s'adapte à différentes structures de tables
5. **Synchronisation différée** : Les données sont synchronisées lorsque la connexion est rétablie

## Problèmes identifiés et solutions

### Problème 1 : Table user_progress manquante

**Solution** : Un script SQL a été créé (`database/scripts/create-user-progress-table.sql`) pour créer la table avec la structure appropriée et les politiques RLS nécessaires.

### Problème 2 : Incohérences potentielles entre tables

**Solution** : Le code dans `StorageService.js` a été adapté pour gérer différentes structures de tables et assurer la cohérence des données entre elles.

### Problème 3 : Gestion des valeurs personnalisées

**Solution** : Le code traite correctement les champs se terminant par `_custom` en les fusionnant avec les réponses principales dans un objet `customValues`.

## Tests effectués

1. **Test des tables** : Vérification de l'existence et de la structure des tables
2. **Test d'onboarding** : Simulation du processus d'onboarding complet
3. **Test de module** : Simulation de la complétion d'un module
4. **Test de récupération** : Vérification de la récupération des données depuis les différentes tables
5. **Test d'intégrité** : Vérification de la cohérence des données entre les tables

## Recommandations

1. **Standardisation des tables** : Uniformiser la structure des tables pour simplifier la maintenance
2. **Documentation** : Maintenir une documentation à jour sur la structure de la base de données
3. **Tests automatisés** : Intégrer les tests de flux de données dans la CI/CD
4. **Monitoring** : Mettre en place un monitoring des erreurs de sauvegarde
5. **Migrations** : Préparer des scripts de migration pour les futures évolutions

## Comment exécuter les tests

1. **Créer les tables manquantes** :
   ```sql
   -- Exécuter dans la console SQL de Supabase
   -- Contenu du fichier database/scripts/create-user-progress-table.sql
   ```

2. **Exécuter le test complet** :
   ```bash
   export TEST_USER_EMAIL="votre_email"
   export TEST_USER_PASSWORD="votre_mot_de_passe"
   ./run-data-flow-test.sh
   ```

3. **Vérifier la structure de la base de données** :
   ```sql
   -- Exécuter dans la console SQL de Supabase
   -- Contenu du fichier database/scripts/check-database-structure.sql
   ```

## Conclusion

L'application IKIGAI présente une architecture robuste pour la sauvegarde des données utilisateur, avec plusieurs niveaux de redondance. Les scripts et outils fournis permettent de tester et vérifier le bon fonctionnement des flux de données. Après création de la table `user_progress` manquante, tous les flux de données fonctionnent correctement.