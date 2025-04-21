# Migrations Supabase

Ce dossier contient tous les scripts SQL pour configurer et mettre à jour les tables dans Supabase.

## Liste des scripts

1. `create-recommendations-table.sql` - Création de la table pour stocker les recommandations de l'IA
2. `create-responses-table.sql` - Création de la table pour stocker les réponses utilisateur
3. `create-onboarding-table.sql` - Création de la table pour le processus d'onboarding
4. `create-user-progress-table.sql` - Création de la table pour suivre la progression utilisateur

## Comment utiliser ces scripts

1. Connectez-vous à votre console Supabase: https://mgegwthaogszzgflwery.supabase.co
2. Accédez à l'éditeur SQL
3. Copiez-collez le contenu du script que vous souhaitez exécuter
4. Exécutez le script

## Sécurité

Tous les scripts incluent la configuration appropriée de Row Level Security (RLS) pour s'assurer que les utilisateurs ne peuvent accéder qu'à leurs propres données.