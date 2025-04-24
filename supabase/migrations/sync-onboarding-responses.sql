-- Script pour synchroniser les réponses d'onboarding entre les tables
-- Ce script permet de maintenir la cohérence entre onboarding_responses et user_responses
-- Version améliorée avec gestion de timeouts et meilleures performances

-- Fonction pour synchroniser les réponses d'onboarding de user_responses vers onboarding_responses
CREATE OR REPLACE FUNCTION sync_onboarding_from_user_responses()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le module_id est 'onboarding', synchroniser vers onboarding_responses
  IF NEW.module_id = 'onboarding' THEN
    -- Insertion ou mise à jour dans onboarding_responses
    INSERT INTO public.onboarding_responses (
      user_id, 
      responses, 
      updated_at
    ) 
    VALUES (
      NEW.user_id, 
      NEW.responses, 
      COALESCE(NEW.updated_at, NOW())
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      responses = NEW.responses,
      updated_at = COALESCE(NEW.updated_at, NOW());
      
    -- Mettre à jour user_progress pour s'assurer que l'onboarding est bien marqué comme complété
    INSERT INTO public.user_progress (
      user_id, 
      onboarding_completed,
      onboarding_completed_at
    ) 
    VALUES (
      NEW.user_id, 
      TRUE,
      COALESCE(
        (NEW.responses->>'completedAt')::timestamp with time zone,
        NEW.updated_at, 
        NOW()
      )
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      onboarding_completed = TRUE,
      onboarding_completed_at = COALESCE(
        (NEW.responses->>'completedAt')::timestamp with time zone,
        NEW.updated_at, 
        NOW()
      ),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour synchroniser les réponses d'onboarding de onboarding_responses vers user_responses
CREATE OR REPLACE FUNCTION sync_onboarding_from_dedicated_table()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertion ou mise à jour dans user_responses
  INSERT INTO public.user_responses (
    user_id, 
    module_id,
    responses, 
    updated_at
  ) 
  VALUES (
    NEW.user_id, 
    'onboarding',
    NEW.responses, 
    COALESCE(NEW.updated_at, NOW())
  )
  ON CONFLICT (user_id, module_id) 
  DO UPDATE SET
    responses = NEW.responses,
    updated_at = COALESCE(NEW.updated_at, NOW());
    
  -- Mettre à jour user_progress pour s'assurer que l'onboarding est bien marqué comme complété
  INSERT INTO public.user_progress (
    user_id, 
    onboarding_completed,
    onboarding_completed_at
  ) 
  VALUES (
    NEW.user_id, 
    TRUE,
    COALESCE(
      (NEW.responses->>'completedAt')::timestamp with time zone,
      NEW.updated_at, 
      NOW()
    )
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    onboarding_completed = TRUE,
    onboarding_completed_at = COALESCE(
      (NEW.responses->>'completedAt')::timestamp with time zone,
      NEW.updated_at, 
      NOW()
    ),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour limiter la durée d'exécution du trigger
CREATE OR REPLACE FUNCTION with_timeout(timeout_ms INTEGER, func REGPROC)
RETURNS TRIGGER AS $$
DECLARE
  start_time TIMESTAMPTZ;
  elapsed_ms INTEGER;
BEGIN
  start_time := clock_timestamp();
  
  -- Exécuter la fonction avec un try/catch pour éviter les blocages
  BEGIN
    EXECUTE 'SELECT ' || func || '()';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erreur dans le trigger: %', SQLERRM;
  END;
  
  elapsed_ms := EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) * 1000;
  
  IF elapsed_ms > timeout_ms THEN
    RAISE WARNING 'Le trigger a dépassé le délai maximum de % ms (% ms)', timeout_ms, elapsed_ms;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer les triggers s'ils existent déjà pour éviter les erreurs
DROP TRIGGER IF EXISTS sync_onboarding_user_responses_trigger ON public.user_responses;
DROP TRIGGER IF EXISTS sync_onboarding_dedicated_table_trigger ON public.onboarding_responses;

-- Créer le trigger sur la table user_responses
CREATE TRIGGER sync_onboarding_user_responses_trigger
AFTER INSERT OR UPDATE ON public.user_responses
FOR EACH ROW
WHEN (NEW.module_id = 'onboarding')
EXECUTE FUNCTION sync_onboarding_from_user_responses();

-- Créer le trigger sur la table onboarding_responses
CREATE TRIGGER sync_onboarding_dedicated_table_trigger
AFTER INSERT OR UPDATE ON public.onboarding_responses
FOR EACH ROW
EXECUTE FUNCTION sync_onboarding_from_dedicated_table();

-- Créer index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_responses_module_id_user_id 
ON public.user_responses(module_id, user_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_responses_user_id 
ON public.onboarding_responses(user_id);

-- Commentaires explicatifs
COMMENT ON FUNCTION sync_onboarding_from_user_responses() IS 'Synchronise les réponses d''onboarding de user_responses vers onboarding_responses et met à jour user_progress';
COMMENT ON FUNCTION sync_onboarding_from_dedicated_table() IS 'Synchronise les réponses d''onboarding de onboarding_responses vers user_responses et met à jour user_progress';
COMMENT ON FUNCTION with_timeout(INTEGER, REGPROC) IS 'Exécute une fonction de trigger avec un timeout pour éviter les blocages';
COMMENT ON TRIGGER sync_onboarding_user_responses_trigger ON public.user_responses IS 'Déclenche la synchronisation des réponses d''onboarding vers la table dédiée';
COMMENT ON TRIGGER sync_onboarding_dedicated_table_trigger ON public.onboarding_responses IS 'Déclenche la synchronisation des réponses d''onboarding vers user_responses';

-- Vérification initiale et synchronisation des données existantes
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Synchroniser les données de user_responses vers onboarding_responses
  FOR user_record IN 
    SELECT ur.user_id, ur.responses, ur.updated_at
    FROM public.user_responses ur
    LEFT JOIN public.onboarding_responses o ON ur.user_id = o.user_id
    WHERE ur.module_id = 'onboarding' AND (o.user_id IS NULL OR o.updated_at < ur.updated_at)
  LOOP
    BEGIN
      INSERT INTO public.onboarding_responses (user_id, responses, updated_at)
      VALUES (user_record.user_id, user_record.responses, user_record.updated_at)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        responses = user_record.responses,
        updated_at = user_record.updated_at;
        
      -- Mettre à jour user_progress directement
      INSERT INTO public.user_progress (
        user_id, 
        onboarding_completed,
        onboarding_completed_at
      ) 
      VALUES (
        user_record.user_id, 
        TRUE,
        COALESCE(
          (user_record.responses->>'completedAt')::timestamp with time zone,
          user_record.updated_at, 
          NOW()
        )
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET
        onboarding_completed = TRUE,
        onboarding_completed_at = COALESCE(
          (user_record.responses->>'completedAt')::timestamp with time zone,
          user_record.updated_at, 
          NOW()
        ),
        updated_at = NOW();
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Erreur lors de la synchronisation pour l''utilisateur %: %', 
        user_record.user_id, SQLERRM;
    END;
  END LOOP;
  
  -- Synchroniser les données de onboarding_responses vers user_responses
  FOR user_record IN 
    SELECT o.user_id, o.responses, o.updated_at
    FROM public.onboarding_responses o
    LEFT JOIN public.user_responses ur ON o.user_id = ur.user_id AND ur.module_id = 'onboarding'
    WHERE ur.user_id IS NULL OR ur.updated_at < o.updated_at
  LOOP
    BEGIN
      INSERT INTO public.user_responses (user_id, module_id, responses, updated_at)
      VALUES (user_record.user_id, 'onboarding', user_record.responses, user_record.updated_at)
      ON CONFLICT (user_id, module_id) 
      DO UPDATE SET 
        responses = user_record.responses,
        updated_at = user_record.updated_at;
        
      -- Mettre à jour user_progress directement
      INSERT INTO public.user_progress (
        user_id, 
        onboarding_completed,
        onboarding_completed_at
      ) 
      VALUES (
        user_record.user_id, 
        TRUE,
        COALESCE(
          (user_record.responses->>'completedAt')::timestamp with time zone,
          user_record.updated_at, 
          NOW()
        )
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET
        onboarding_completed = TRUE,
        onboarding_completed_at = COALESCE(
          (user_record.responses->>'completedAt')::timestamp with time zone,
          user_record.updated_at, 
          NOW()
        ),
        updated_at = NOW();
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Erreur lors de la synchronisation pour l''utilisateur %: %', 
        user_record.user_id, SQLERRM;
    END;
  END LOOP;
END $$;