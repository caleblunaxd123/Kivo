-- Fix get_my_groups to include real total_amount and pending_count
-- calculated from entries, instead of relying on non-existent columns.

CREATE OR REPLACE FUNCTION get_my_groups()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'group', to_jsonb(g) || jsonb_build_object(
        'total_amount', (
          SELECT COALESCE(SUM(COALESCE(e.amount_in_base, e.amount)), 0)
          FROM entries e
          WHERE e.group_id = g.id
            AND e.status != 'archived'
        ),
        'pending_count', (
          SELECT COUNT(*)::int
          FROM entries e
          WHERE e.group_id = g.id
            AND e.status = 'pending_review'
        )
      ),
      'members', (
        SELECT jsonb_agg(jsonb_build_object(
          'id',           gm2.id,
          'user_id',      gm2.user_id,
          'role',         gm2.role,
          'status',       gm2.status,
          'joined_at',    gm2.joined_at,
          'display_name', u2.display_name,
          'avatar_url',   u2.avatar_url,
          'color_hex',    u2.color_hex
        ))
        FROM group_members gm2
        LEFT JOIN users u2 ON u2.id = gm2.user_id
        WHERE gm2.group_id = g.id AND gm2.status = 'active'
      )
    )
    ORDER BY g.updated_at DESC
  )
  INTO v_result
  FROM groups g
  INNER JOIN group_members gm ON gm.group_id = g.id
  WHERE gm.user_id = auth.uid()
    AND gm.status = 'active'
    AND g.status != 'archived';

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION get_my_groups() TO authenticated;
