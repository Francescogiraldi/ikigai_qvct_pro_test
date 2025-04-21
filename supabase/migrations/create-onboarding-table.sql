-- SQL pour créer une nouvelle table dédiée aux réponses d'onboarding
-- Exécutez ce SQL dans l'éditeur SQL de la console Supabase

-- Créer une table dédiée aux réponses d'onboarding
CREATE TABLE public.onboarding_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Activer RLS (Row Level Security) sur la table
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Créer des politiques d'accès
CREATE POLICY "Users can view their own onboarding" 
  ON public.onboarding_responses 
  FOR SELECT 
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own onboarding" 
  ON public.onboarding_responses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own onboarding" 
  ON public.onboarding_responses 
  FOR UPDATE 
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own onboarding" 
  ON public.onboarding_responses 
  FOR DELETE 
  USING (auth.uid() = user_id);
  
-- Ajouter des index pour améliorer les performances
CREATE INDEX idx_onboarding_responses_user_id ON public.onboarding_responses(user_id);

-- Vérifier la création de la table
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_name = 'onboarding_responses';