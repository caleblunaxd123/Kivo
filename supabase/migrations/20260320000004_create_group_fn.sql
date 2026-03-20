-- Atomic function to create a group + add owner as member.
-- Uses SECURITY DEFINER to bypass RLS (safe because we validate owner_id server-side).
CREATE OR REPLACE FUNCTION create_group_with_owner(
  p_name          TEXT,
  p_type          TEXT,
  p_cover_emoji   TEXT,
  p_base_currency TEXT,
  p_owner_id      UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group groups;
BEGIN
  -- Validate caller is authenticated and matches owner_id
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF auth.uid() != p_owner_id THEN
    RAISE EXCEPTION 'owner_id must match authenticated user';
  END IF;

  -- Create group
  INSERT INTO groups (name, type, cover_emoji, base_currency, owner_id)
  VALUES (p_name, p_type, p_cover_emoji, p_base_currency, p_owner_id)
  RETURNING * INTO v_group;

  -- Add owner as member
  INSERT INTO group_members (group_id, user_id, role, status)
  VALUES (v_group.id, p_owner_id, 'owner', 'active');

  RETURN to_jsonb(v_group);
END;
$$;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION create_group_with_owner(TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;

-- Function to fetch a group + its members (bypasses RLS for reads too)
CREATE OR REPLACE FUNCTION get_group_data(p_group_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group  jsonb;
  v_members jsonb;
BEGIN
  SELECT to_jsonb(g) INTO v_group FROM groups g WHERE g.id = p_group_id;
  IF v_group IS NULL THEN
    RAISE EXCEPTION 'Group not found';
  END IF;

  SELECT jsonb_agg(jsonb_build_object(
    'id',           gm.id,
    'group_id',     gm.group_id,
    'user_id',      gm.user_id,
    'role',         gm.role,
    'status',       gm.status,
    'display_name', u.display_name,
    'avatar_url',   u.avatar_url,
    'color_hex',    u.color_hex,
    'email',        u.email
  ))
  INTO v_members
  FROM group_members gm
  LEFT JOIN users u ON u.id = gm.user_id
  WHERE gm.group_id = p_group_id AND gm.status = 'active';

  RETURN jsonb_build_object(
    'group',   v_group,
    'members', COALESCE(v_members, '[]'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_group_data(UUID) TO authenticated;

-- Function to fetch groups for the current user
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
          'display_name', u2.display_name,
          'avatar_url',   u2.avatar_url,
          'color_hex',    u2.color_hex
        ))
        FROM group_members gm2
        LEFT JOIN users u2 ON u2.id = gm2.user_id
        WHERE gm2.group_id = g.id AND gm2.status = 'active'
      )
    )
  )
  INTO v_result
  FROM groups g
  INNER JOIN group_members gm ON gm.group_id = g.id
  WHERE gm.user_id = auth.uid()
    AND gm.status = 'active'
    AND g.status != 'archived'
  ORDER BY g.updated_at DESC;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION get_my_groups() TO authenticated;
