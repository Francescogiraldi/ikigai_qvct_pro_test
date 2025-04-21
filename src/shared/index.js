// Point central d'export pour faciliter les imports

// Exporter les composants frontend
export { default as WelcomePage } from '../frontend/pages/WelcomePage';
export { default as HomePage } from '../frontend/pages/HomePage';
export { default as IslandView } from '../frontend/pages/IslandView';
export { default as SignupPage } from '../frontend/pages/SignupPage';
export { default as OnboardingJourney } from '../frontend/pages/OnboardingJourney';

// Exporter les composants UI
export { default as Button } from '../frontend/components/ui/Button';
export { default as Badge } from '../frontend/components/ui/Badge';
export { default as Character } from '../frontend/components/ui/Character';
export { default as Logo } from '../frontend/components/ui/Logo';
export { default as ProgressBar } from '../frontend/components/ui/ProgressBar';
export { default as StreakCounter } from '../frontend/components/ui/StreakCounter';
export { default as WellnessScore } from '../frontend/components/ui/WellnessScore';
export { default as XPBar } from '../frontend/components/ui/XPBar';

// Exporter les composants d'îles
export { default as IslandCard } from '../frontend/components/islands/IslandCard';
export { default as ModuleCard } from '../frontend/components/islands/ModuleCard';
export { default as ModuleViewer } from '../frontend/components/islands/ModuleViewer';
export { default as Quiz } from '../frontend/components/islands/Quiz';

// Exporter les composants de défis
export { default as ChallengeCard } from '../frontend/components/challenges/ChallengeCard';
export { default as QuickExerciseCard } from '../frontend/components/challenges/QuickExerciseCard';

// Exporter les services backend
export { default as API } from '../backend/api';
export { default as AuthService } from '../backend/services/AuthService';
export { default as StorageService } from '../backend/services/StorageService';
export { default as ContentService } from '../backend/services/ContentService';

// Exporter les modèles
export { Island, ISLANDS } from '../backend/models/Island';
export { Module, MODULES } from '../backend/models/Module';
export { Challenge, CHALLENGES } from '../backend/models/Challenge';
export { Exercise, EXERCISES } from '../backend/models/Exercise';
export { UserProgress } from '../backend/models/UserProgress';

// Exporter les utilitaires et configurations
export { supabase, handleSupabaseError } from './supabase';