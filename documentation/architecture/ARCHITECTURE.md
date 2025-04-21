# Architecture de l'Application IKIGAI

## Structure actuelle

L'application IKIGAI est actuellement structurée avec un mélange de composants frontend et backend dans le même projet React. Bien que certains dossiers soient déjà organisés (comme `/src/frontend` et `/src/backend`), il existe encore des fichiers qui ne respectent pas cette séparation, notamment :

- Des fichiers principaux à la racine du dossier `/src` (IkigaiApp.js, SignupPage.js, etc.)
- Des services dupliqués (StorageService.js présent à deux endroits)
- Des fichiers de configuration Supabase dupliqués

## Proposition de réorganisation

Je propose de réorganiser l'application en suivant une architecture claire Frontend/Backend tout en conservant la fonctionnalité et le design actuels.

### Structure proposée

```
/
├── public/                  # Fichiers statiques publics
├── src/
│   ├── frontend/           # Tout ce qui concerne l'interface utilisateur
│   │   ├── components/     # Composants UI réutilisables
│   │   │   ├── challenges/ # Composants liés aux défis
│   │   │   ├── islands/    # Composants liés aux îles
│   │   │   ├── profile/    # Composants liés au profil
│   │   │   └── ui/         # Composants UI génériques
│   │   ├── layouts/        # Mises en page réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── hooks/          # Hooks personnalisés React
│   │   ├── context/        # Contextes React pour l'état global
│   │   ├── styles/         # Styles CSS/SCSS
│   │   └── utils/          # Utilitaires frontend
│   ├── backend/            # Tout ce qui concerne la logique métier
│   │   ├── api/            # Points d'entrée de l'API
│   │   ├── models/         # Modèles de données
│   │   ├── services/       # Services métier
│   │   └── utils/          # Utilitaires backend
│   ├── shared/             # Code partagé entre frontend et backend
│   │   ├── constants/      # Constantes partagées
│   │   ├── types/          # Types partagés
│   │   └── utils/          # Utilitaires partagés
│   ├── config/             # Configuration de l'application
│   │   └── supabase.js     # Configuration Supabase
│   ├── App.js              # Composant racine de l'application
│   └── index.js            # Point d'entrée de l'application
├── package.json            # Dépendances et scripts
└── README.md               # Documentation
```

## Plan de migration

1. **Déplacer les fichiers principaux** : Déplacer IkigaiApp.js, SignupPage.js, etc. vers le dossier approprié dans `/src/frontend/pages`

2. **Consolider les services** : Unifier les services dupliqués (StorageService.js) dans `/src/backend/services`

3. **Centraliser la configuration** : Déplacer les fichiers de configuration (supabase.js) dans `/src/config`

4. **Mettre à jour les imports** : Ajuster tous les chemins d'importation dans les fichiers pour refléter la nouvelle structure

5. **Créer des points d'entrée API clairs** : Améliorer l'organisation des API dans `/src/backend/api`

6. **Ajouter des contextes React** : Créer des contextes pour gérer l'état global de l'application

## Avantages de cette architecture

- **Séparation des préoccupations** : Distinction claire entre la logique métier et l'interface utilisateur
- **Maintenabilité améliorée** : Organisation plus intuitive facilitant la navigation dans le code
- **Évolutivité** : Structure permettant d'ajouter facilement de nouvelles fonctionnalités
- **Testabilité** : Séparation facilitant l'écriture de tests unitaires et d'intégration
- **Collaboration** : Organisation permettant à plusieurs développeurs de travailler en parallèle

## Considérations techniques

- L'application continuera d'utiliser Supabase pour l'authentification et le stockage
- La stratégie de persistance hybride (Supabase + localStorage) sera maintenue
- Les composants UI existants seront préservés pour maintenir l'expérience utilisateur actuelle