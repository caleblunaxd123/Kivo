-- ============================================================
-- Migración: Sistema de suscripciones y planes
-- ============================================================

-- 1. Agregar columnas de suscripción a la tabla users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_plan     text    NOT NULL DEFAULT 'free'
                                                 CHECK (subscription_plan IN ('free', 'premium', 'team')),
  ADD COLUMN IF NOT EXISTS subscription_status   text    CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_customer_id    text    UNIQUE;

-- 2. Índice para búsquedas por Stripe customer
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON public.users (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- 3. Tabla de historial de suscripciones
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type    text         NOT NULL, -- 'upgraded', 'downgraded', 'canceled', 'renewed', 'trial_started'
  from_plan     text,
  to_plan       text,
  stripe_event_id text       UNIQUE,
  metadata      jsonb        DEFAULT '{}',
  created_at    timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_events_user ON public.subscription_events (user_id, created_at DESC);

-- 4. RLS para subscription_events
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_see_own_events" ON public.subscription_events
  FOR SELECT USING (auth.uid() = user_id);

-- 5. Función: verificar cuota de grupos por plan
CREATE OR REPLACE FUNCTION public.check_group_quota(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan        text;
  v_group_count int;
BEGIN
  SELECT subscription_plan INTO v_plan
  FROM public.users
  WHERE id = p_user_id;

  -- Premium y Team: sin límite de grupos
  IF v_plan IN ('premium', 'team') THEN
    RETURN true;
  END IF;

  -- Plan gratuito: máximo 1 grupo activo
  SELECT COUNT(*) INTO v_group_count
  FROM public.group_members
  WHERE user_id = p_user_id
    AND status = 'active';

  RETURN v_group_count < 1;
END;
$$;

-- 6. Función: actualizar plan desde webhook de Stripe (llamada por Edge Function)
CREATE OR REPLACE FUNCTION public.update_subscription(
  p_stripe_customer_id text,
  p_plan               text,
  p_status             text,
  p_expires_at         timestamptz DEFAULT NULL,
  p_stripe_event_id    text        DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   uuid;
  v_old_plan  text;
BEGIN
  -- Buscar usuario por Stripe customer ID
  SELECT id, subscription_plan INTO v_user_id, v_old_plan
  FROM public.users
  WHERE stripe_customer_id = p_stripe_customer_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado para Stripe customer: %', p_stripe_customer_id;
  END IF;

  -- Actualizar plan
  UPDATE public.users SET
    subscription_plan       = p_plan,
    subscription_status     = p_status,
    subscription_expires_at = p_expires_at,
    updated_at              = now()
  WHERE id = v_user_id;

  -- Registrar evento
  IF v_old_plan IS DISTINCT FROM p_plan THEN
    INSERT INTO public.subscription_events (user_id, event_type, from_plan, to_plan, stripe_event_id)
    VALUES (
      v_user_id,
      CASE WHEN p_plan > v_old_plan THEN 'upgraded' ELSE 'downgraded' END,
      v_old_plan,
      p_plan,
      p_stripe_event_id
    )
    ON CONFLICT (stripe_event_id) DO NOTHING;
  END IF;
END;
$$;

-- 7. Grants para funciones nuevas
GRANT EXECUTE ON FUNCTION public.check_group_quota(uuid)  TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_subscription(text, text, text, timestamptz, text) TO service_role;

-- 8. Actualizar función get_my_groups para incluir plan del usuario
-- (sin cambios en la firma, compatible con clientes existentes)

COMMENT ON COLUMN public.users.subscription_plan      IS 'Plan activo: free | premium | team';
COMMENT ON COLUMN public.users.subscription_status    IS 'Estado Stripe: active | canceled | past_due | trialing';
COMMENT ON COLUMN public.users.subscription_expires_at IS 'Fecha de expiración o próxima renovación';
COMMENT ON COLUMN public.users.stripe_customer_id     IS 'ID del customer en Stripe';
