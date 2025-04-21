# Documentation de l'intégration Supabase

Ce document décrit l'intégration de la base de données Supabase dans l'application IKIGAI, incluant les flux de données, la structure des tables et les mécanismes de sauvegarde.

## Structure de la base de données

L'application IKIGAI utilise trois tables principales pour stocker les données utilisateur :

1. **user_progress**
   - Stocke la progression globale de l'utilisateur
   - Structure : `user_id`, `progress_data` (JSONB), `created_at`, `updated_at`
   - Contient : points, modules complétés, badges, streak, réponses aux modules

2. **onboarding_responses**
   - Table dédiée aux réponses d'onboarding
   - Structure : `user_id`, `responses` (JSONB), `created_at`, `updated_at`
   - Contient : toutes les réponses au questionnaire d'onboarding

3. **user_responses**
   - Table alternative/legacy pour stocker les réponses
   - Deux structures possibles :
     - Structure 1 : `user_id`, `module_id`, `responses` (JSONB)
     - Structure 2 : `user_id`, `question_id`, `question_text`, `answer_text`

## Configuration de Supabase

L'application se connecte à Supabase via la configuration centralisée dans `/src/shared/supabase.js` :

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mgegwthaogszzgflwery.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Flux de données

### Onboarding

1. L'utilisateur remplit le formulaire d'onboarding (`OnboardingJourney.js`)
2. Les réponses sont formatées et transmises à `StorageService.saveOnboardingResponses()`
3. Le service tente de sauvegarder les données dans cet ordre :
   1. Table `onboarding_responses` (stratégie préférée)
   2. Table `user_responses` avec structure standard
   3. Table `user_responses` avec structure par question
   4. Table `user_progress` dans le champ `moduleResponses.onboarding`
4. Sauvegarde locale dans localStorage en parallèle (fallback)

### Modules

1. L'utilisateur complète un module et soumet ses réponses
2. Les réponses sont transmises à `StorageService.saveModuleResponses()`
3. Les données sont sauvegardées dans :
   - Table `user_progress` dans le champ `moduleResponses[moduleId]`
   - Mise à jour des statistiques (points, badges, etc.)
4. Sauvegarde locale dans localStorage en parallèle (fallback)

## Mécanismes de sauvegarde

L'application utilise une approche multi-stratégies pour assurer la robustesse des sauvegardes :

1. **Stratégie principale** : Sauvegarde dans les tables dédiées de Supabase
2. **Fallback en cas d'échec** : Tentative dans une table alternative
3. **Sauvegarde locale** : Toutes les données sont également stockées dans localStorage
4. **Adaptation structurelle** : Le code s'adapte à différentes structures de tables
5. **Synchronisation différée** : Les données sont synchronisées lorsque la connexion est rétablie

## Gestion de l'authentification

L'authentification est gérée via les services Supabase Auth :

```javascript
// Inscription
export const signUp = async (email, password) => {
  try {
    const { user, error } = await supabase.auth.signUp({ 
      email, 
      password 
    });
    
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

// Connexion
export const signIn = async (email, password) => {
  try {
    const { user, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};
```

## Scripts SQL importants

### Création de la table user_progress

```sql
CREATE TABLE IF NOT EXISTS public.user_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  progress_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON public.user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Création de la table onboarding_responses

```sql
CREATE TABLE IF NOT EXISTS public.onboarding_responses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own responses"
  ON public.onboarding_responses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses"
  ON public.onboarding_responses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own responses"
  ON public.onboarding_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Bonnes pratiques

1. **Accès centralisé** : Toujours accéder à Supabase via les services appropriés, jamais directement
2. **Gestion des erreurs** : Toujours gérer les erreurs de requêtes Supabase
3. **Optimistic UI** : Mettre à jour l'UI avant confirmation de sauvegarde pour une meilleure UX
4. **Vérifications locales** : Vérifier l'existence des tables avant d'insérer des données
5. **Tests RLS** : Vérifier que les politiques de sécurité fonctionnent correctement

## Dépannage courant

1. **Erreur 404** : La table n'existe pas dans Supabase
   - Solution: Créer la table avec le script SQL approprié

2. **Erreur 401** : Problème d'authentification
   - Solution: Vérifier les variables d'environnement et les clés API

3. **Erreur 403** : Accès non autorisé (RLS)
   - Solution: Vérifier les politiques de sécurité sur la table

4. **Erreur de parsing JSON** : Données mal formatées
   - Solution: Vérifier le format des données avant envoi

## Tests d'intégration

Pour tester l'intégration Supabase, utilisez le script de test fourni :

```bash
# Exécuter les tests d'intégration Supabase
npm run test:supabase
```

Ce script vérifie :
- La connexion à Supabase
- La création, lecture, mise à jour et suppression de données
- La gestion des erreurs et fallbacks
- La synchronisation entre localStorage et Supabase