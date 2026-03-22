-- Fix update_entry: pending_reasons column is text[], but the previous version
-- tried to COALESCE it against jsonb — PostgreSQL error 42804.
-- Convert the jsonb array to text[] with jsonb_array_elements_text.
CREATE OR REPLACE FUNCTION update_entry(
  p_entry_id   UUID,
  p_updates    jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id UUID;
BEGIN
  SELECT group_id INTO v_group_id FROM entries WHERE id = p_entry_id;

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Entrada no encontrada';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = v_group_id
      AND user_id = auth.uid()
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'No tienes permiso para editar esta entrada';
  END IF;

  UPDATE entries SET
    description   = COALESCE((p_updates->>'description'),           description),
    amount        = COALESCE((p_updates->>'amount')::DECIMAL,       amount),
    currency      = COALESCE((p_updates->>'currency'),              currency),
    category      = COALESCE((p_updates->>'category'),              category),
    paid_by       = CASE WHEN p_updates ? 'paid_by'
                      THEN (p_updates->>'paid_by')::UUID
                      ELSE paid_by END,
    split_rule    = COALESCE((p_updates->>'split_rule'),            split_rule),
    notes         = COALESCE((p_updates->>'notes'),                 notes),
    status        = COALESCE((p_updates->>'status'), status::text)::entry_status,
    entry_date    = COALESCE((p_updates->>'entry_date')::DATE,      entry_date),
    -- Convert jsonb array → text[] so types match (fixes error 42804)
    pending_reasons = CASE
      WHEN p_updates ? 'pending_reasons'
      THEN ARRAY(SELECT jsonb_array_elements_text(p_updates->'pending_reasons'))
      ELSE pending_reasons
    END,
    updated_at    = NOW()
  WHERE id = p_entry_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION update_entry(UUID, jsonb) TO authenticated;
