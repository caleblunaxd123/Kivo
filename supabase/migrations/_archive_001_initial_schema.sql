-- ─────────────────────────────────────────────────────────────────────────────
-- KIVO — Initial Database Schema
-- Migration: 001_initial_schema
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

CREATE TYPE entry_type AS ENUM (
  'expense', 'income', 'discount', 'adjustment', 'transfer', 'note'
);

CREATE TYPE entry_status AS ENUM (
  'draft', 'parsed', 'pending_review', 'confirmed', 'archived'
);

CREATE TYPE entry_origin AS ENUM (
  'voice', 'photo', 'text', 'manual', 'import'
);

-- ─── USERS ───────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email              TEXT UNIQUE NOT NULL,
  display_name       TEXT NOT NULL,
  avatar_url         TEXT,
  color_hex          TEXT NOT NULL DEFAULT '#6366F1',
  preferred_currency CHAR(3) DEFAULT 'USD',
  preferred_locale   TEXT DEFAULT 'es-PE',
  timezone           TEXT DEFAULT 'America/Lima',
  theme              TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  auth_provider      TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at       TIMESTAMPTZ
);

-- ─── GROUPS ──────────────────────────────────────────────────────────────────

CREATE TABLE groups (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  type                 TEXT NOT NULL DEFAULT 'general'
                       CHECK (type IN ('travel','home','event','shopping',
                                       'work','materials','birthday','general')),
  cover_emoji          TEXT DEFAULT '📋',
  cover_image_url      TEXT,
  base_currency        CHAR(3) DEFAULT 'USD' NOT NULL,
  status               TEXT DEFAULT 'active'
                       CHECK (status IN ('active','closed','archived')),
  owner_id             UUID REFERENCES users(id) ON DELETE SET NULL,
  timezone             TEXT DEFAULT 'America/Lima',
  country_code         CHAR(2),
  description          TEXT,
  is_template          BOOLEAN DEFAULT FALSE,
  template_name        TEXT,
  default_split_rule   TEXT DEFAULT 'equal'
                       CHECK (default_split_rule IN ('equal','percentage','fixed','shares')),
  allow_pending        BOOLEAN DEFAULT TRUE,
  offline_mode         BOOLEAN DEFAULT TRUE,
  deleted_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  closed_at            TIMESTAMPTZ
);

CREATE INDEX idx_groups_owner ON groups(owner_id);
CREATE INDEX idx_groups_status ON groups(status) WHERE deleted_at IS NULL;

-- ─── GROUP MEMBERS ────────────────────────────────────────────────────────────

CREATE TABLE group_members (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id          UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_name        TEXT,
  guest_color       TEXT DEFAULT '#818CF8',
  role              TEXT DEFAULT 'member'
                    CHECK (role IN ('owner','admin','member','viewer')),
  status            TEXT DEFAULT 'active'
                    CHECK (status IN ('active','invited','left','removed')),
  joined_at         TIMESTAMPTZ DEFAULT NOW(),
  invited_at        TIMESTAMPTZ,
  left_at           TIMESTAMPTZ,
  invited_by        UUID REFERENCES users(id),
  default_currency  CHAR(3),
  notify_new_entry  BOOLEAN DEFAULT TRUE,
  notify_mentions   BOOLEAN DEFAULT TRUE,
  CONSTRAINT member_identity CHECK (
    (user_id IS NOT NULL) OR (guest_name IS NOT NULL)
  )
);

CREATE UNIQUE INDEX idx_group_member_unique
  ON group_members(group_id, user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);

-- ─── ENTRIES ─────────────────────────────────────────────────────────────────

CREATE TABLE entries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id          UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  type              entry_type NOT NULL DEFAULT 'expense',
  status            entry_status NOT NULL DEFAULT 'draft',
  origin            entry_origin NOT NULL DEFAULT 'text',
  description       TEXT NOT NULL DEFAULT '',
  notes             TEXT,
  category          TEXT DEFAULT 'other',
  amount            DECIMAL(12,4) NOT NULL DEFAULT 0,
  currency          CHAR(3) NOT NULL DEFAULT 'USD',
  amount_in_base    DECIMAL(12,4),
  exchange_rate     DECIMAL(12,6),
  paid_by           UUID REFERENCES users(id),
  paid_by_guest     UUID REFERENCES group_members(id),
  split_rule        TEXT DEFAULT 'equal'
                    CHECK (split_rule IN ('equal','percentage','fixed','shares','custom')),
  ai_confidence     DECIMAL(3,2),
  raw_input         TEXT,
  ai_parse_job_id   UUID,
  entry_date        DATE DEFAULT CURRENT_DATE,
  entry_time        TIME,
  pending_reasons   TEXT[] DEFAULT '{}',
  attachment_count  INT DEFAULT 0,
  sort_order        INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at      TIMESTAMPTZ,
  archived_at       TIMESTAMPTZ
);

CREATE INDEX idx_entries_group ON entries(group_id);
CREATE INDEX idx_entries_status ON entries(status);
CREATE INDEX idx_entries_date ON entries(entry_date DESC);
CREATE INDEX idx_entries_created_by ON entries(created_by);
CREATE INDEX idx_entries_pending ON entries(group_id) WHERE status = 'pending_review';

-- ─── ENTRY ITEMS ─────────────────────────────────────────────────────────────

CREATE TABLE entry_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id        UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  quantity        DECIMAL(8,3) DEFAULT 1,
  unit_price      DECIMAL(12,4) NOT NULL,
  subtotal        DECIMAL(12,4) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  category        TEXT,
  split_rule      TEXT,
  notes           TEXT,
  ocr_confidence  DECIMAL(3,2),
  ocr_raw_text    TEXT,
  is_confirmed    BOOLEAN DEFAULT FALSE,
  sort_order      INT DEFAULT 0
);

CREATE INDEX idx_entry_items_entry ON entry_items(entry_id);

-- ─── ENTRY SPLITS ─────────────────────────────────────────────────────────────

CREATE TABLE entry_splits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id        UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  member_id       UUID NOT NULL REFERENCES group_members(id) ON DELETE CASCADE,
  amount          DECIMAL(12,4) NOT NULL,
  percentage      DECIMAL(5,2),
  shares          INT,
  is_excluded     BOOLEAN DEFAULT FALSE,
  entry_item_id   UUID REFERENCES entry_items(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_entry_splits_entry ON entry_splits(entry_id);
CREATE INDEX idx_entry_splits_member ON entry_splits(member_id);

-- ─── ATTACHMENTS ─────────────────────────────────────────────────────────────

CREATE TABLE attachments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id        UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  group_id        UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  uploaded_by     UUID REFERENCES users(id),
  storage_path    TEXT NOT NULL,
  public_url      TEXT,
  thumbnail_url   TEXT,
  file_type       TEXT,
  file_size       INT,
  file_name       TEXT,
  ocr_status      TEXT DEFAULT 'pending'
                  CHECK (ocr_status IN ('pending','processing','done','failed')),
  ocr_raw_text    TEXT,
  ocr_confidence  DECIMAL(3,2),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attachments_entry ON attachments(entry_id);

-- ─── CURRENCY RATES ──────────────────────────────────────────────────────────

CREATE TABLE currency_rates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency   CHAR(3) NOT NULL,
  to_currency     CHAR(3) NOT NULL,
  rate            DECIMAL(12,6) NOT NULL,
  source          TEXT DEFAULT 'auto',
  rate_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  group_id        UUID REFERENCES groups(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_currency_rates_unique
  ON currency_rates(from_currency, to_currency, rate_date,
                    COALESCE(group_id, '00000000-0000-0000-0000-000000000000'::UUID));

-- ─── DAILY CLOSURES ──────────────────────────────────────────────────────────

CREATE TABLE daily_closures (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id          UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  closure_date      DATE NOT NULL,
  closed_by         UUID REFERENCES users(id),
  total_amount      DECIMAL(12,4) DEFAULT 0,
  total_currency    CHAR(3) DEFAULT 'USD',
  entry_count       INT DEFAULT 0,
  confirmed_count   INT DEFAULT 0,
  pending_count     INT DEFAULT 0,
  balances_snapshot JSONB DEFAULT '{}',
  top_categories    JSONB DEFAULT '[]',
  ai_insights       TEXT[] DEFAULT '{}',
  export_url        TEXT,
  share_image_url   TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, closure_date)
);

-- ─── SETTLEMENTS ─────────────────────────────────────────────────────────────

CREATE TABLE settlements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  from_member     UUID NOT NULL REFERENCES group_members(id),
  to_member       UUID NOT NULL REFERENCES group_members(id),
  amount          DECIMAL(12,4) NOT NULL,
  currency        CHAR(3) NOT NULL,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','disputed')),
  confirmed_by    UUID REFERENCES users(id),
  confirmed_at    TIMESTAMPTZ,
  notes           TEXT,
  is_suggestion   BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AI PARSE JOBS ────────────────────────────────────────────────────────────

CREATE TABLE ai_parse_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by      UUID REFERENCES users(id),
  input_type      TEXT NOT NULL CHECK (input_type IN ('voice','text','ocr')),
  raw_input       TEXT,
  audio_url       TEXT,
  image_url       TEXT,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','done','failed')),
  parsed_result   JSONB,
  confidence      DECIMAL(3,2),
  error_message   TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  duration_ms     INT,
  entry_id        UUID REFERENCES entries(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── GROUP INVITES ────────────────────────────────────────────────────────────

CREATE TABLE group_invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  invited_by  UUID NOT NULL REFERENCES users(id),
  token       TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  email       TEXT,
  status      TEXT DEFAULT 'pending'
              CHECK (status IN ('pending','accepted','expired','revoked')),
  max_uses    INT DEFAULT 1,
  use_count   INT DEFAULT 0,
  expires_at  TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

CREATE INDEX idx_invites_token ON group_invites(token);
CREATE INDEX idx_invites_group ON group_invites(group_id);

-- ─── CHANGE LOG ──────────────────────────────────────────────────────────────

CREATE TABLE change_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  changed_by      UUID REFERENCES users(id),
  entity_type     TEXT NOT NULL,
  entity_id       UUID NOT NULL,
  action          TEXT NOT NULL,
  old_value       JSONB,
  new_value       JSONB,
  changed_fields  TEXT[],
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_change_log_group ON change_log(group_id);
CREATE INDEX idx_change_log_date ON change_log(created_at DESC);

-- ─── TRIGGERS ────────────────────────────────────────────────────────────────

-- updated_at auto-update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_groups_updated_at
  BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_entries_updated_at
  BEFORE UPDATE ON entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- confirmed_at auto-set
CREATE OR REPLACE FUNCTION set_confirmed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    NEW.confirmed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_entries_confirmed_at
  BEFORE UPDATE ON entries FOR EACH ROW EXECUTE FUNCTION set_confirmed_at();

-- ─── VIEWS ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW member_balances AS
WITH paid_amounts AS (
  SELECT
    e.group_id,
    gm.id AS member_id,
    SUM(COALESCE(e.amount_in_base, e.amount)) AS total_paid
  FROM entries e
  JOIN group_members gm
    ON gm.user_id = e.paid_by AND gm.group_id = e.group_id
  WHERE e.status = 'confirmed'
    AND e.type IN ('expense', 'income')
  GROUP BY e.group_id, gm.id
),
owed_amounts AS (
  SELECT
    e.group_id,
    es.member_id,
    SUM(es.amount) AS total_owed
  FROM entry_splits es
  JOIN entries e ON e.id = es.entry_id
  WHERE e.status = 'confirmed' AND NOT es.is_excluded
  GROUP BY e.group_id, es.member_id
)
SELECT
  gm.group_id,
  gm.id AS member_id,
  gm.user_id,
  COALESCE(gm.guest_name, u.display_name) AS member_name,
  COALESCE(gm.guest_color, u.color_hex, '#6366F1') AS color_hex,
  COALESCE(pa.total_paid, 0) AS total_paid,
  COALESCE(oa.total_owed, 0) AS total_owed,
  COALESCE(pa.total_paid, 0) - COALESCE(oa.total_owed, 0) AS net_balance
FROM group_members gm
LEFT JOIN users u ON u.id = gm.user_id
LEFT JOIN paid_amounts pa ON pa.member_id = gm.id
LEFT JOIN owed_amounts oa ON oa.member_id = gm.id
WHERE gm.status = 'active';

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION is_group_member(p_group_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_group_admin(p_group_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id
      AND user_id = auth.uid()
      AND role IN ('owner','admin')
      AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Policies
CREATE POLICY "Members can view their groups"
  ON groups FOR SELECT USING (is_group_member(id));

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update groups"
  ON groups FOR UPDATE USING (is_group_admin(id));

CREATE POLICY "Members can view group members"
  ON group_members FOR SELECT USING (is_group_member(group_id));

CREATE POLICY "Members can view entries"
  ON entries FOR SELECT USING (is_group_member(group_id));

CREATE POLICY "Members can create entries"
  ON entries FOR INSERT WITH CHECK (is_group_member(group_id) AND created_by = auth.uid());

CREATE POLICY "Creator or admin can update entry"
  ON entries FOR UPDATE USING (created_by = auth.uid() OR is_group_admin(group_id));

CREATE POLICY "Members can view entry items"
  ON entry_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM entries WHERE id = entry_items.entry_id AND is_group_member(group_id))
  );

CREATE POLICY "Members can view splits"
  ON entry_splits FOR SELECT USING (
    EXISTS (SELECT 1 FROM entries WHERE id = entry_splits.entry_id AND is_group_member(group_id))
  );

CREATE POLICY "Members can view attachments"
  ON attachments FOR SELECT USING (is_group_member(group_id));

CREATE POLICY "Members can upload attachments"
  ON attachments FOR INSERT WITH CHECK (is_group_member(group_id));
