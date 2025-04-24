# Migrations Supabase

Ce dossier contient tous les scripts SQL pour configurer et mettre à jour les tables dans Supabase.

## Liste des scripts

1. `create-recommendations-table.sql` - Création de la table pour stocker les recommandations de l'IA
2. `create-responses-table.sql` - Création de la table pour stocker les réponses utilisateur
3. `create-onboarding-table.sql` - Création de la table pour le processus d'onboarding
4. `create-user-progress-table.sql` - Création de la table pour suivre la progression utilisateur
5. `create-user-sessions-table.sql` - Création de la table pour gérer les sessions utilisateur
6. `sync-onboarding-responses.sql` - Configuration des déclencheurs pour synchroniser automatiquement les données d'onboarding

## Comment utiliser ces scripts

1. Connectez-vous à votre console Supabase: https://mgegwthaogszzgflwery.supabase.co
2. Accédez à l'éditeur SQL
3. Copiez-collez le contenu du script que vous souhaitez exécuter
4. Exécutez le script

## Ordre d'exécution recommandé

Exécutez les scripts dans l'ordre indiqué ci-dessus. Les scripts de synchronisation (comme `sync-onboarding-responses.sql`) doivent être exécutés après que les tables qu'ils manipulent ont été créées.

## Améliorations récentes

### Sessions utilisateur
La table `user_sessions` permet de suivre l'activité des utilisateurs, gérer les déconnexions et garantir la cohérence des sessions entre appareils.

### Synchronisation des réponses d'onboarding
Des déclencheurs PostgreSQL ont été mis en place pour synchroniser automatiquement les données entre `user_responses` (avec module_id='onboarding') et la table dédiée `onboarding_responses`. 

Cette synchronisation bidirectionnelle garantit la cohérence des données, peu importe quelle table est utilisée pour l'insertion ou la mise à jour, facilitant ainsi l'évolution de l'architecture sans casser les fonctionnalités existantes.

## Sécurité

Tous les scripts incluent la configuration appropriée de Row Level Security (RLS) pour s'assurer que les utilisateurs ne peuvent accéder qu'à leurs propres données.