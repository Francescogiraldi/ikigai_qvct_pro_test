# Composants d'Onboarding

Ce dossier contient les composants réutilisables pour l'expérience d'onboarding de l'application IKIGAI.

## Objectif

Ces composants sont conçus pour offrir une expérience utilisateur interactive et engageante pendant le processus d'onboarding, avec des animations et des interactions fluides.

## Composants disponibles

- **AnimatedStar** - Étoile de notation avec animation
- **StarRating** - Système de notation avec étoiles
- **InteractiveCard** - Carte interactive avec animations au survol et au clic
- **AnimatedEmoji** - Emoji avec différentes animations
- **InteractiveSlider** - Curseur interactif avec indicateur visuel
- **AnimatedButton** - Bouton avec micro-animations
- **QuestionTransition** - Conteneur pour transition entre questions
- **BubbleSelector** - Sélecteur d'options sous forme de bulles interactives
- **ProgressIndicator** - Indicateur de progression avec animation
- **MoodSelector** - Sélecteur d'humeur avec émojis
- **AnimatedCheckbox** - Case à cocher animée

## Utilisation

Importez ces composants depuis le fichier d'index:

```jsx
import { 
  InteractiveCard, 
  AnimatedEmoji, 
  AnimatedButton 
} from '../components/ui/onboarding';
```

## Structure du code

Chaque composant est désormais séparé dans son propre fichier pour une meilleure maintenabilité. L'index.js centralise les exports pour une utilisation simplifiée.