-- Script de création de la table user_sessions
-- Cette table stocke les informations sur les sessions des utilisateurs

-- Activation de l'extension uuid-ossp si pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Création de la table user_sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT,
  is_active BOOLEAN DEFAULT true,
  logged_out_at TIMESTAMP WITH TIME ZONE,
  device_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.user_sessions IS 'Stocke les informations sur les sessions des utilisateurs';
COMMENT ON COLUMN public.user_sessions.id IS 'Identifiant unique de la session';
COMMENT ON COLUMN public.user_sessions.user_id IS 'Identifiant de l''utilisateur (référence auth.users)';
COMMENT ON COLUMN public.user_sessions.last_activity IS 'Date de la dernière activité de l''utilisateur';
COMMENT ON COLUMN public.user_sessions.user_agent IS 'User agent du navigateur';
COMMENT ON COLUMN public.user_sessions.ip_address IS 'Adresse IP de l''utilisateur (pour détection de fraude)';
COMMENT ON COLUMN public.user_sessions.is_active IS 'Indique si la session est active';
COMMENT ON COLUMN public.user_sessions.logged_out_at IS 'Date de déconnexion';
COMMENT ON COLUMN public.user_sessions.device_info IS 'Informations sur l''appareil au format JSON';
COMMENT ON COLUMN public.user_sessions.created_at IS 'Date de création de la session';
COMMENT ON COLUMN public.user_sessions.updated_at IS 'Date de la dernière mise à jour';

-- Activer la sécurité au niveau des lignes (RLS)
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Politique pour SELECT - un utilisateur peut voir uniquement ses propres sessions
CREATE POLICY user_sessions_select_policy
  ON public.user_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique pour INSERT - un utilisateur peut insérer uniquement ses propres sessions
CREATE POLICY user_sessions_insert_policy
  ON public.user_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique pour UPDATE - un utilisateur peut modifier uniquement ses propres sessions
CREATE POLICY user_sessions_update_policy
  ON public.user_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active);

-- Trigger pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.user_sessions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();