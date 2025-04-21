-- Script de création de la table user_recommendations
-- Cette table stocke les recommandations personnalisées générées par l'IA améliorée

-- Activation de l'extension uuid-ossp si pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Création de la table user_recommendations
CREATE TABLE IF NOT EXISTS public.user_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  analysis_version VARCHAR(50) DEFAULT 'v1',
  analysis_metadata JSONB DEFAULT '{}'::jsonb,
  feedback_data JSONB DEFAULT '{}'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.user_recommendations IS 'Stocke les recommandations personnalisées générées par l''IA';
COMMENT ON COLUMN public.user_recommendations.id IS 'Identifiant unique de l''enregistrement';
COMMENT ON COLUMN public.user_recommendations.user_id IS 'Identifiant de l''utilisateur (référence auth.users)';
COMMENT ON COLUMN public.user_recommendations.recommendations IS 'Recommandations personnalisées au format JSON';
COMMENT ON COLUMN public.user_recommendations.analysis_version IS 'Version du modèle d''analyse utilisé';
COMMENT ON COLUMN public.user_recommendations.analysis_metadata IS 'Métadonnées sur l''analyse (scores, catégories, etc.)';
COMMENT ON COLUMN public.user_recommendations.feedback_data IS 'Données de feedback utilisateur sur les recommandations';
COMMENT ON COLUMN public.user_recommendations.generated_at IS 'Date de génération des recommandations';
COMMENT ON COLUMN public.user_recommendations.updated_at IS 'Date de la dernière mise à jour';

-- Activer la sécurité au niveau des lignes (RLS)
ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;

-- Politique pour SELECT - un utilisateur peut voir uniquement ses propres recommandations
CREATE POLICY user_recommendations_select_policy
  ON public.user_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique pour INSERT - un utilisateur peut insérer uniquement ses propres recommandations
CREATE POLICY user_recommendations_insert_policy
  ON public.user_recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique pour UPDATE - un utilisateur peut modifier uniquement ses propres recommandations
CREATE POLICY user_recommendations_update_policy
  ON public.user_recommendations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id ON public.user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_analysis_version ON public.user_recommendations(analysis_version);

-- Trigger pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.user_recommendations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table pour stocker l'historique des recommandations
CREATE TABLE IF NOT EXISTS public.user_recommendations_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendations JSONB NOT NULL,
  analysis_version VARCHAR(50),
  analysis_metadata JSONB,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commentaires sur la table d'historique
COMMENT ON TABLE public.user_recommendations_history IS 'Stocke l''historique des recommandations générées';

-- Activer la sécurité au niveau des lignes (RLS) pour l'historique
ALTER TABLE public.user_recommendations_history ENABLE ROW LEVEL SECURITY;

-- Politique pour SELECT sur l'historique
CREATE POLICY user_recommendations_history_select_policy
  ON public.user_recommendations_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Index pour améliorer les performances des requêtes sur l'historique
CREATE INDEX IF NOT EXISTS idx_user_recommendations_history_user_id ON public.user_recommendations_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_history_generated_at ON public.user_recommendations_history(generated_at);

-- Trigger pour archiver automatiquement les anciennes recommandations
CREATE OR REPLACE FUNCTION archive_recommendations()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer l'ancienne version dans l'historique
  INSERT INTO public.user_recommendations_history (
    user_id, recommendations, analysis_version, analysis_metadata, generated_at
  )
  VALUES (
    OLD.user_id, OLD.recommendations, OLD.analysis_version, OLD.analysis_metadata, OLD.generated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER archive_recommendations_trigger
BEFORE UPDATE ON public.user_recommendations
FOR EACH ROW
WHEN (OLD.recommendations::text != NEW.recommendations::text)
EXECUTE FUNCTION archive_recommendations();