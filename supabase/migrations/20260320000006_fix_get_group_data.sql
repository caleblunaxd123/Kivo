-- Re-create get_group_data in case it was missing from the schema cache.
-- Fetches group + active members for a given group_id (SECURITY DEFINER).
CREATE OR REPLACE FUNCTION get_group_data(p_group_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group   jsonb;
  v_members jsonb;
BEGIN
  SELECT to_jsonb(g) INTO v_group
  FROM groups g
  WHERE g.id = p_group_id;

  IF v_group IS NULL THEN
    RAISE EXCEPTION 'Group % not found', p_group_id;
  END IF;

  SELECT jsonb_agg(jsonb_build_object(
    'id',           gm.id,
    'group_id',     gm.group_id,
    'user_id',      gm.user_id,
    'role',         gm.role,
    'status',       gm.status,
    'joined_at',    gm.joined_at,
    'display_name', u.display_name,
    'avatar_url',   u.avatar_url,
    'color_hex',    u.color_hex,
    'email',        u.email
  ))
  INTO v_members
  FROM group_members gm
  LEFT JOIN users u ON u.id = gm.user_id
  WHERE gm.group_id = p_group_id
    AND gm.status = 'active';

  RETURN jsonb_build_object(
    'group',   v_group,
    'members', COALESCE(v_members, '[]'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_group_data(UUID) TO authenticated;

-- Re-create get_my_groups as well to be safe
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
      'group', to_jsonb(g),
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
