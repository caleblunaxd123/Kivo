-- Vozpe Dev Seed Data
-- Run with: supabase db reset (includes migrations + seed)

-- Test users (passwords are 'password123' in Supabase Auth)
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'ana@vozpe.app', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'bob@vozpe.app', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'carlos@vozpe.app', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- User profiles
INSERT INTO public.users (id, email, display_name, avatar_url, color_hex)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'ana@vozpe.app', 'Ana García', null, '#6366F1'),
  ('00000000-0000-0000-0000-000000000002', 'bob@vozpe.app', 'Bob Martínez', null, '#EC4899'),
  ('00000000-0000-0000-0000-000000000003', 'carlos@vozpe.app', 'Carlos López', null, '#10B981')
ON CONFLICT (id) DO NOTHING;

-- Test group
INSERT INTO public.groups (id, name, type, base_currency, created_by, status)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Viaje Cancún 🏖️', 'travel', 'USD', '00000000-0000-0000-0000-000000000001', 'active')
ON CONFLICT (id) DO NOTHING;

-- Group members
INSERT INTO public.group_members (group_id, user_id, display_name, role, status)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Ana García', 'admin', 'active'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Bob Martínez', 'member', 'active'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Carlos López', 'member', 'active')
ON CONFLICT DO NOTHING;

-- Sample entries
INSERT INTO public.entries (
  id, group_id, created_by, paid_by, description, amount, currency,
  category, split_rule, status, entry_date, ai_parsed, origin
)
VALUES
  (
    'bbbbbbbb-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Uber al aeropuerto',
    45.00, 'USD', 'transport', 'equal', 'confirmed',
    CURRENT_DATE - 2, false, 'text'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'Hotel primera noche',
    180.00, 'USD', 'accommodation', 'equal', 'confirmed',
    CURRENT_DATE - 1, true, 'voice'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000003',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'Cena mariscos',
    95.50, 'USD', 'food', 'equal', 'confirmed',
    CURRENT_DATE, false, 'text'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000004',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    null,
    'Tour en lancha',
    null, 'USD', null, 'equal', 'pending_review',
    CURRENT_DATE, true, 'voice'
  )
ON CONFLICT (id) DO NOTHING;
