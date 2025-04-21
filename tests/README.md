# Tests pour l'application IKIGAI

Ce dossier centralise tous les tests de l'application IKIGAI, organisés selon les catégories suivantes:

## Structure

- **/unit**: Tests unitaires pour les composants et services individuels
- **/integration**: Tests d'intégration entre plusieurs modules de l'application
- **/html**: Pages HTML de test pour l'interface utilisateur et les intégrations Supabase

## Exécution des tests

### Tests automatisés

Les tests automatisés peuvent être exécutés avec les commandes suivantes:

```bash
# Tests unitaires et d'intégration avec Jest
npm test
npm run test:unit
npm run test:integration

# Tests spécifiques d'intégration Supabase
node ./tests/run-supabase-tests.js
```

### Tests HTML interactifs

Pour faciliter l'exécution des tests HTML, vous pouvez utiliser la page d'accueil des tests:

1. Ouvrez le fichier `run-all-tests.html` dans votre navigateur
2. Cliquez sur les liens pour exécuter les tests spécifiques

Alternativement, vous pouvez ouvrir directement les fichiers HTML:

- **test-storage-ui.html**: Interface pour tester le stockage des données utilisateur
- **test-supabase-integration.html**: Interface pour tester l'intégration avec Supabase (authentification et tables)
- **test-supabase-flow.html**: Interface pour tester le flux complet d'un utilisateur (inscription, onboarding, modules)

### Fonctionnalités testées

- Inscription et connexion d'utilisateur
- Enregistrement des réponses d'onboarding
- Enregistrement des réponses de module
- Stockage local et synchronisation avec Supabase
- Gestion des erreurs et stratégies de secours

## Notes importantes

1. Les fichiers de test ont été réorganisés à partir d'une structure précédente où ils étaient dispersés entre `/src/tests`, `/scripts/tests` et la racine du projet.
2. Pour les tests qui nécessitent des identifiants, utilisez des comptes de test dédiés.
3. Vérifiez que l'URL Supabase est correcte dans les fichiers de test HTML: `https://mgegwthaogszzgflwery.supabase.co`
4. Les tests HTML utilisent des versions simplifiées des services pour faciliter le test isolé des fonctionnalités.