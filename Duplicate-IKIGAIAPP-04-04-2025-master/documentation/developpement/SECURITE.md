# Sécurité du projet IKIGAI

Ce document décrit les bonnes pratiques de sécurité à suivre pour le développement et le déploiement de l'application IKIGAI.

## Gestion des secrets et variables d'environnement

### Règles générales

1. **Ne jamais commiter de secrets dans le code source**
   - Clés API
   - Mots de passe
   - Tokens d'authentification
   - Clés privées
   - Informations d'identification de base de données

2. **Utiliser des variables d'environnement**
   - Stocker les secrets dans des fichiers `.env` qui sont exclus du contrôle de version
   - Fournir un fichier `.env.example` avec des valeurs factices pour documentation

3. **Variables publiques vs privées**
   - Pour React, les variables accessibles au frontend doivent commencer par `REACT_APP_` ou `REACT_PUBLIC_`
   - Les variables sensibles qui ne doivent pas être exposées au frontend ne doivent pas utiliser ces préfixes

## Configuration de Supabase

Les informations de connexion à Supabase sont particulièrement sensibles :

- `REACT_PUBLIC_SUPABASE_URL` : L'URL de votre projet Supabase
- `REACT_PUBLIC_SUPABASE_ANON_KEY` : La clé anonyme de votre projet

### Attention

Même si ces valeurs sont préfixées par `REACT_PUBLIC_`, elles doivent être traitées avec précaution :

- La clé anonyme a des permissions limitées, mais elle peut tout de même permettre des opérations non autorisées si elle est mal utilisée
- Ne pas partager ces informations publiquement
- Utiliser les règles RLS (Row Level Security) de Supabase pour restreindre l'accès aux données

## Déploiement sécurisé

Pour un déploiement sécurisé :

1. **Utiliser les secrets de l'environnement de déploiement**
   - Netlify, Vercel, et d'autres plateformes offrent des systèmes de gestion de secrets
   - Ne pas hardcoder les secrets dans les scripts de déploiement

2. **Configurer CORS correctement**
   - Limiter les origines autorisées dans Supabase
   - Ne pas utiliser `*` en production

3. **Auditer régulièrement les permissions**
   - Vérifier les règles RLS dans Supabase
   - S'assurer que les politiques de sécurité sont à jour

## Fichiers ignorés par Git

Le fichier `.gitignore` a été configuré pour exclure :

- Tous les fichiers d'environnement (`.env`, `.env.local`, etc.)
- Les fichiers de clés et certificats
- Les logs et fichiers temporaires
- Les fichiers de configuration d'IDE sensibles
- Les dossiers de dépendances et de build

## En cas de compromission

Si des secrets sont accidentellement exposés :

1. **Révoquer immédiatement** les clés/tokens compromis
2. **Générer de nouvelles clés** dans Supabase
3. **Mettre à jour** les variables d'environnement
4. **Vérifier** les journaux d'accès pour détecter d'éventuelles activités malveillantes
5. **Documenter** l'incident et les mesures prises