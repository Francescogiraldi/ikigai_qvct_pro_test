# IKIGAI - Application de bien-être

## Qu'est-ce qu'IKIGAI ?

IKIGAI est une application de bien-être inspirée du concept japonais de l'Ikigai ("raison d'être"). Elle vous aide à trouver votre équilibre et votre épanouissement personnel à travers des parcours thématiques interactifs.

![Logo IKIGAI](public/logo192.png)

## Fonctionnalités principales

### 🏝️ Îles thématiques
Découvrez des parcours spécifiques sur des thèmes essentiels :
- Pleine conscience
- Productivité
- Gestion du stress
- Équilibre vie personnelle/professionnelle

### 📚 Modules éducatifs
Approfondissez chaque thématique grâce à des contenus interactifs et des questionnaires adaptés à votre niveau.

### 🎯 Défis quotidiens
Relevez des activités courtes et efficaces pour améliorer votre bien-être au quotidien.

### 🏆 Système de progression
Suivez votre évolution grâce aux points, badges et niveaux qui récompensent votre engagement.

### 💬 Chatbot intelligent
Bénéficiez de conseils personnalisés sur les sujets liés au bien-être et à l'IKIGAI grâce à notre assistant IA.

## Installation

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm start

# Construction pour la production
npm run build
```

## Guide de test manuel

Pour tester l'application avec la base de données Supabase, suivez ces étapes :

1. **Configuration des variables d'environnement** :
   - Créez un fichier `.env.local` basé sur `.env.example`
   - Remplissez les identifiants Supabase (URL et clé anonyme)

2. **Démarrage de l'application** :
   ```
   npm start
   ```

3. **Test du flux d'inscription et d'onboarding** :
   - Sur la page d'accueil, cliquez sur "Commencer"
   - Créez un compte en remplissant le formulaire d'inscription
   - Suivez le parcours d'onboarding en répondant aux questions des 4 sections :
     - Passion (ce que vous aimez)
     - Mission (ce dont le monde a besoin)
     - Vocation (ce en quoi vous excellez)
     - Profession (ce pour quoi on peut vous payer)
   - Consultez la page d'analyse après l'onboarding
   - Explorez l'application principale avec les îles thématiques

4. **Vérification des données dans Supabase** :
   - Les réponses d'onboarding sont enregistrées dans `onboarding_responses` ou `user_responses`
   - La progression utilisateur est mise à jour dans `user_progress`
   - Les données de profil sont accessibles via la table `users`

## Avantages techniques

- **Compatible hors-ligne** : Utilisez l'application même sans connexion internet
- **Installation facile** : Disponible comme application native sur mobile et desktop (PWA)
- **Interface intuitive** : Design moderne et adapté à tous les appareils
- **Stockage sécurisé** : Intégration avec Supabase pour la gestion des données utilisateur

## Technologies utilisées

- React 18
- Tailwind CSS
- Framer Motion pour les animations
- Supabase pour le backend et l'authentification
- API Gradio pour les recommandations IA

---

Développé avec ❤️ pour votre bien-être quotidien.
