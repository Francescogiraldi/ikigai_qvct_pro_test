# Guide d'Utilisation du Système de Recommandation IA

Ce guide explique comment utiliser et tester le nouveau système de recommandation IA intégré à l'application IKIGAI.

## Fonctionnalités

Le système IA analyse les réponses des utilisateurs et génère des recommandations personnalisées pour:
- Proposer des modules adaptés aux besoins spécifiques
- Identifier les domaines prioritaires d'amélioration
- Offrir un parcours personnalisé dans l'application

## Comment Tester

1. **Connexion à l'application**
   ```
   npm start
   ```
   Connectez-vous avec un compte test ou créez un nouveau compte

2. **Remplir des modules avec réponses textuelles**
   - Complétez au moins un module contenant des questions ouvertes
   - Décrivez vos besoins et objectifs de manière détaillée
   - Les réponses plus riches permettent une meilleure analyse

3. **Générer des recommandations**
   - Depuis la page d'accueil, accédez à la section "Recommandations"
   - Cliquez sur "Actualiser" ou "Générer des recommandations"
   - Attendez quelques secondes pour le traitement IA

4. **Vérifier la pertinence**
   - Examinez les recommandations générées
   - Notez les catégories identifiées
   - Vérifiez si les raisons données correspondent à vos besoins

5. **Donner du feedback**
   - Utilisez les boutons "Oui/Non" sous les recommandations
   - Ce feedback aide à améliorer la qualité des futures recommandations

## Dépannage

Si les recommandations ne semblent pas pertinentes:
- Assurez-vous d'avoir complété suffisamment de modules
- Vérifiez que vos réponses textuelles sont assez détaillées
- Essayez de générer à nouveau les recommandations

## Détails Techniques

Le système utilise:
- Traitement de langage naturel (NLP) simulé localement
- Analyse de sentiment et d'intention des réponses textuelles
- Catégorisation multi-dimensionnelle des besoins
- Historique des recommandations pour analyse comparative

## Évolutions Prévues

Dans les prochaines versions:
- Intégration avec OpenAI ou Hugging Face pour un NLP avancé
- Apprentissage continu basé sur les feedbacks
- Recommandations contextuelles (moment de la journée, saison)

Pour plus de détails techniques, consultez le fichier `documentation/fonctionnalites/IA-RECOMMENDATIONS.md`.