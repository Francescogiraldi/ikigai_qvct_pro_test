# Structure de l'Application IKIGAI

Ce document décrit la structure de dossiers et de fichiers de l'application IKIGAI après nettoyage.

## Structure Racine

```
/
├── database/              # Scripts et configurations pour la base de données
│   └── scripts/           # Scripts SQL pour Supabase
├── public/                # Fichiers statiques publics
├── src/                   # Code source de l'application
├── supabase/              # Configuration Supabase CLI
├── .env.local             # Variables d'environnement locales
├── .gitignore             # Configuration git
├── ARCHITECTURE.md        # Documentation architecture
├── babel.config.js        # Configuration Babel
├── package.json           # Dépendances et scripts npm
├── postcss.config.js      # Configuration PostCSS
├── README.md              # Documentation principale
└── tailwind.config.js     # Configuration Tailwind CSS
```

## Structure `/src`

```
src/
├── backend/               # Logique côté serveur/data
│   ├── api/               # Configuration API
│   ├── models/            # Modèles de données
│   └── services/          # Services (auth, storage, etc.)
├── config/                # Configuration de l'application
├── data/                  # Données statiques (contenus, etc.)
├── frontend/              # Interface utilisateur
│   ├── components/        # Composants React
│   │   ├── challenges/    # Composants liés aux défis
│   │   ├── islands/       # Composants liés aux îles
│   │   │   └── questions/ # Composants de questions
│   │   └── ui/            # Composants UI réutilisables
│   ├── context/           # Contextes React
│   ├── pages/             # Pages de l'application
│   └── styles/            # Styles spécifiques
├── shared/                # Code partagé entre frontend et backend
└── tests/                 # Tests unitaires et d'intégration
```

## Tables Principales dans Supabase

1. **`onboarding_responses`**
   - Stocke les réponses du questionnaire d'onboarding
   - Format JSON dans le champ `responses`

2. **`user_progress`**
   - Stocke la progression globale de l'utilisateur
   - Format JSON dans le champ `progress_data`

## Points importants

- Le service `StorageService` est maintenant uniquement dans `/src/backend/services/`
- Toutes les dépendances à Supabase pointent désormais vers `/src/shared/supabase.js`
- Les scripts de test et de configuration de base de données ont été organisés dans des dossiers dédiés
- Les fichiers temporaires de test ont été supprimés

## Configuration Supabase

URL de base: `https://mgegwthaogszzgflwery.supabase.co`

> Note: Ne jamais partager ou exposer les clés d'API dans le code public.