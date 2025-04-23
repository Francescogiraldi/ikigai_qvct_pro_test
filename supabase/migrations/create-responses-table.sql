-- SQL pour créer ou mettre à jour la table user_responses
-- Exécutez ce SQL dans l'éditeur SQL de la console Supabase

-- 1. D'abord, création de la table si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS user_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte d'unicité pour éviter les doublons
  UNIQUE(user_id, module_id)
);

-- 2. Ensuite, ajoutons le module_id s'il n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'user_responses' 
    AND column_name = 'module_id'
  ) THEN
    ALTER TABLE user_responses ADD COLUMN module_id TEXT;
  END IF;
END $$;

-- 3. S'assurer que la colonne responses existe et est de type JSONB
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'user_responses' 
    AND column_name = 'responses'
  ) THEN
    ALTER TABLE user_responses ADD COLUMN responses JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 4. Mettre à jour les contraintes d'unicité
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT conname
    FROM pg_constraint 
    WHERE conrelid = 'user_responses'::regclass 
    AND conname = 'user_responses_user_id_module_id_key'
  ) THEN
    ALTER TABLE user_responses ADD CONSTRAINT user_responses_user_id_module_id_key UNIQUE (user_id, module_id);
  END IF;
END $$;

-- 5. Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_responses_user_id ON user_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_responses_module_id ON user_responses(module_id);

-- 6. Configurer RLS (Row Level Security) pour la sécurité
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;

-- 7. Créer des policies pour sécuriser l'accès
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT polname FROM pg_policy WHERE polrelid = 'user_responses'::regclass AND polname = 'Users can view their own responses'
  ) THEN
    CREATE POLICY "Users can view their own responses" 
      ON user_responses 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT polname FROM pg_policy WHERE polrelid = 'user_responses'::regclass AND polname = 'Users can insert their own responses'
  ) THEN
    CREATE POLICY "Users can insert their own responses" 
      ON user_responses 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT polname FROM pg_policy WHERE polrelid = 'user_responses'::regclass AND polname = 'Users can update their own responses'
  ) THEN
    CREATE POLICY "Users can update their own responses" 
      ON user_responses 
      FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT polname FROM pg_policy WHERE polrelid = 'user_responses'::regclass AND polname = 'Users can delete their own responses'
  ) THEN
    CREATE POLICY "Users can delete their own responses" 
      ON user_responses 
      FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 8. Vérification finale
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_responses';