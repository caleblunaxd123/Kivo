-- SECURITY DEFINER function to fetch entries for a group.
-- Bypasses RLS (same approach as get_group_data).
-- Validates that the calling user is a member of the group.
CREATE OR REPLACE FUNCTION get_group_entries(p_group_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entries jsonb;
BEGIN
  -- Only allow members to fetch entries
  IF NOT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id
      AND user_id = auth.uid()
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Not a member of this group';
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'id',              e.id,
      'group_id',        e.group_id,
      'created_by',      e.created_by,
      'type',            e.type,
      'status',          e.status,
      'origin',          e.origin,
      'description',     e.description,
      'notes',           e.notes,
      'category',        e.category,
      'amount',          e.amount,
      'currency',        e.currency,
      'amount_in_base',  e.amount_in_base,
      'exchange_rate',   e.exchange_rate,
      'paid_by',         e.paid_by,
      'split_rule',      e.split_rule,
      'ai_confidence',   e.ai_confidence,
      'raw_input',       e.raw_input,
      'entry_date',      e.entry_date,
      'entry_time',      e.entry_time,
      'created_at',      e.created_at,
      'updated_at',      e.updated_at,
      'confirmed_at',    e.confirmed_at,
      'pending_reasons', e.pending_reasons,
      'attachment_count', e.attachment_count,
      'sort_order',      e.sort_order
    )
    ORDER BY e.entry_date DESC, e.created_at DESC
  )
  INTO v_entries
  FROM entries e
  WHERE e.group_id = p_group_id
    AND e.status != 'archived';

  RETURN COALESCE(v_entries, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION get_group_entries(UUID) TO authenticated;
