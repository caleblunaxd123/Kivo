-- ─── Trigger: mantiene groups.total_amount y groups.pending_count actualizados ──
-- Se dispara en INSERT / UPDATE / DELETE sobre entries.

CREATE OR REPLACE FUNCTION update_group_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_group_id UUID;
BEGIN
  v_group_id := COALESCE(NEW.group_id, OLD.group_id);

  UPDATE groups
  SET
    total_amount = COALESCE((
      SELECT SUM(COALESCE(amount_in_base, amount))
      FROM entries
      WHERE group_id = v_group_id
        AND status   = 'confirmed'
        AND type     IN ('expense', 'income')
    ), 0),
    pending_count = COALESCE((
      SELECT COUNT(*)
      FROM entries
      WHERE group_id = v_group_id
        AND status   = 'pending_review'
    ), 0)
  WHERE id = v_group_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_update_group_totals ON entries;
CREATE TRIGGER trg_update_group_totals
  AFTER INSERT OR UPDATE OR DELETE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_group_totals();

-- Recalcula todos los grupos existentes (para datos ya guardados)
UPDATE groups g
SET
  total_amount = COALESCE((
    SELECT SUM(COALESCE(e.amount_in_base, e.amount))
    FROM entries e
    WHERE e.group_id = g.id
      AND e.status   = 'confirmed'
      AND e.type     IN ('expense', 'income')
  ), 0),
  pending_count = COALESCE((
    SELECT COUNT(*)
    FROM entries e
    WHERE e.group_id = g.id
      AND e.status   = 'pending_review'
  ), 0);
