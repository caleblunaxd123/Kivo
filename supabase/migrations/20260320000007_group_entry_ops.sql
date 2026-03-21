-- ─────────────────────────────────────────────────────────────────────────────
-- Group & Entry operations
-- archive_group, leave_group, update_entry, delete_entry, update_profile
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── archive_group ───────────────────────────────────────────────────────────
-- Only the group owner can archive. Sets status='archived' + deleted_at.
CREATE OR REPLACE FUNCTION archive_group(p_group_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM groups
    WHERE id = p_group_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Solo el dueño puede archivar este grupo';
  END IF;

  UPDATE groups
  SET status = 'archived', deleted_at = NOW(), updated_at = NOW()
  WHERE id = p_group_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION archive_group(UUID) TO authenticated;

-- ─── leave_group ─────────────────────────────────────────────────────────────
-- Any active member can leave. Sets member status='left' + left_at.
CREATE OR REPLACE FUNCTION leave_group(p_group_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id
      AND user_id = auth.uid()
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'No eres miembro activo de este grupo';
  END IF;

  UPDATE group_members
  SET status = 'left', left_at = NOW()
  WHERE group_id = p_group_id AND user_id = auth.uid();

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION leave_group(UUID) TO authenticated;

-- ─── update_entry ─────────────────────────────────────────────────────────────
-- Any active group member can update entries (not just the creator).
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
    description   = COALESCE((p_updates->>'description'), description),
    amount        = COALESCE((p_updates->>'amount')::DECIMAL, amount),
    currency      = COALESCE((p_updates->>'currency'), currency),
    category      = COALESCE((p_updates->>'category'), category),
    paid_by       = CASE WHEN p_updates ? 'paid_by' THEN (p_updates->>'paid_by')::UUID ELSE paid_by END,
    split_rule    = COALESCE((p_updates->>'split_rule'), split_rule),
    notes         = COALESCE((p_updates->>'notes'), notes),
    status        = COALESCE((p_updates->>'status'), status::text)::entry_status,
    entry_date    = COALESCE((p_updates->>'entry_date')::DATE, entry_date),
    pending_reasons = COALESCE((p_updates->'pending_reasons')::jsonb, pending_reasons),
    updated_at    = NOW()
  WHERE id = p_entry_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION update_entry(UUID, jsonb) TO authenticated;

-- ─── delete_entry ─────────────────────────────────────────────────────────────
-- Soft-deletes: sets status='archived'. Any active member can delete.
CREATE OR REPLACE FUNCTION delete_entry(p_entry_id UUID)
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
    RAISE EXCEPTION 'No tienes permiso para eliminar esta entrada';
  END IF;

  UPDATE entries
  SET status = 'archived', updated_at = NOW()
  WHERE id = p_entry_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION delete_entry(UUID) TO authenticated;

-- ─── update_profile ───────────────────────────────────────────────────────────
-- User updates their own profile (display_name, avatar_url, preferred_currency, timezone).
CREATE OR REPLACE FUNCTION update_profile(p_updates jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE users SET
    display_name       = COALESCE((p_updates->>'display_name'), display_name),
    avatar_url         = COALESCE((p_updates->>'avatar_url'), avatar_url),
    preferred_currency = COALESCE((p_updates->>'preferred_currency'), preferred_currency),
    timezone           = COALESCE((p_updates->>'timezone'), timezone),
    updated_at         = NOW()
  WHERE id = auth.uid();

  RETURN (SELECT to_jsonb(u) FROM users u WHERE u.id = auth.uid());
END;
$$;

GRANT EXECUTE ON FUNCTION update_profile(jsonb) TO authenticated;
