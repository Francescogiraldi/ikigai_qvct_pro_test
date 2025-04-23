-- Script de création de la table user_progress
-- Cette table stocke la progression globale de l'utilisateur dans l'application IKIGAI

-- Activation de l'extension uuid-ossp si pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Création de la table user_progress
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.user_progress IS 'Stocke la progression des utilisateurs dans l''application IKIGAI';
COMMENT ON COLUMN public.user_progress.id IS 'Identifiant unique de l''enregistrement';
COMMENT ON COLUMN public.user_progress.user_id IS 'Identifiant de l''utilisateur (référence auth.users)';
COMMENT ON COLUMN public.user_progress.progress_data IS 'Données de progression au format JSON (points, modules complétés, etc.)';
COMMENT ON COLUMN public.user_progress.created_at IS 'Date de création de l''enregistrement';
COMMENT ON COLUMN public.user_progress.updated_at IS 'Date de la dernière mise à jour';

-- Activer la sécurité au niveau des lignes (RLS)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Politique pour SELECT - un utilisateur peut voir uniquement ses propres données
CREATE POLICY user_progress_select_policy
  ON public.user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique pour INSERT - un utilisateur peut insérer uniquement ses propres données
CREATE POLICY user_progress_insert_policy
  ON public.user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique pour UPDATE - un utilisateur peut modifier uniquement ses propres données
CREATE POLICY user_progress_update_policy
  ON public.user_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);

-- Trigger pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();