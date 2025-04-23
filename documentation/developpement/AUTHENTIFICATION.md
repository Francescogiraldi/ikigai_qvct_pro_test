# Documentation du système d'authentification et d'onboarding

## Problème résolu : Écran de chargement infini après inscription

### Symptômes
Lors de l'inscription d'un nouvel utilisateur, après avoir rempli le formulaire d'inscription et avoir reçu la confirmation de création de compte, l'application restait bloquée sur l'écran de chargement au lieu d'afficher l'écran d'onboarding.

### Analyse du problème
Le problème était lié à une séquence inappropriée de changements d'état dans React, créant une condition de course où :

1. L'état `isLoading` était défini à `true` au début de la redirection
2. Un délai artificiel de 500ms était introduit dans le composant SignupPage
3. L'état `showOnboarding` était défini à `true` avant que `isLoading` ne soit remis à `false`
4. Le composant n'était pas entièrement monté avant que les autres états ne soient changés

### Solution implémentée

#### 1. Modification de l'ordre des changements d'état
Dans `App.js`, nous avons :
- Modifié l'ordre pour définir `isLoading` à `false` **avant** de définir `showOnboarding` à `true`
- Supprimé les délais artificiels qui perturbaient la synchronisation des états

```javascript
// Avant
setShowSignup(false);
setIsLoading(true);
// Attente...
setShowOnboarding(true);
// Attente...
setIsLoading(false);

// Après
setIsLoading(false); // D'abord désactiver le chargement
// Puis définir les autres états
setShowSignup(false);
setShowWelcome(false);
setSelectedIsland(null);
setShowOnboardingAnalysis(false);
setShowOnboarding(true);
```

#### 2. Suppression du délai dans SignupPage.js
Le délai artificiel de 500ms a été supprimé pour un appel direct à la fonction de callback :

```javascript
// Avant
setTimeout(() => {
  onComplete(result.user);
}, 500);

// Après
onComplete(result.user);
```

#### 3. Ajout d'une clé unique au composant OnboardingJourney
Pour garantir un nouveau montage complet du composant à chaque affichage :

```javascript
<OnboardingJourney 
  key={`onboarding-${Date.now()}`} // Clé unique à chaque rendu
  onComplete={handleOnboardingComplete}
  onCancel={() => { /* ... */ }}
/>
```

#### 4. Amélioration de la gestion des sessions Supabase
Suppression de l'écriture manuelle dans localStorage qui pouvait causer des conflits :

```javascript
// Avant
localStorage.setItem('supabase.auth.token', JSON.stringify({
  access_token,
  refresh_token,
  expires_at: session.expires_at
}));

// Après
// Laisser Supabase gérer la session par défaut sans écriture manuelle
```

#### 5. Ajout d'un système d'événements pour l'authentification
Utilisation d'événements personnalisés pour mieux coordonner le flux d'authentification :

```javascript
// Déclencher un événement
const authEvent = new CustomEvent('supabase:auth:signIn', {
  detail: { success: true, timestamp: new Date().toISOString() }
});
window.dispatchEvent(authEvent);

// Écouter l'événement
window.addEventListener('supabase:auth:signIn', handleAuthEvent);
```

#### 6. Ajout d'un mécanisme de sécurité
Un timeout de sécurité pour réinitialiser `isLoading` en cas de problème :

```javascript
setTimeout(() => {
  if (isLoading) {
    console.warn("FAILSAFE: Reset isLoading qui est resté bloqué à true");
    setIsLoading(false);
  }
}, 3000);
```

### Résultats
- L'écran de chargement infini a été éliminé
- Les utilisateurs peuvent désormais compléter le processus d'inscription et accéder à l'onboarding sans problème
- Le flux d'authentification est plus robuste et moins sujet aux conditions de course
- La transition entre les écrans est plus fluide et prévisible

### Notes pour les développeurs
Ce problème met en évidence l'importance de :
1. Éviter les délais artificiels dans les flux de changement d'état React
2. Organiser logiquement l'ordre des changements d'état
3. Utiliser des clés uniques pour forcer le remontage de composants lorsque nécessaire
4. Implémenter des mécanismes de sécurité pour les opérations critiques

## Test du système d'authentification

Pour tester le système d'authentification, référez-vous aux scripts de test dans le dossier `tests/` :
- `manual-test-signup-flow.js` : Instructions pas à pas pour tester manuellement
- `login-test-simulator.js` : Simulation du comportement utilisateur 
- `reproduction-test.js` : Démonstration du bug et de sa résolution

## Avertissement

**Ne modifiez pas l'ordre des changements d'état dans `App.js` sans tests approfondis !**

L'ordre des opérations est crucial pour éviter de réintroduire le problème d'écran de chargement infini.