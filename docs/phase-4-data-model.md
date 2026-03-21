# VOZPE — Fase 4: Modelo de Datos, Lógica Funcional y Arquitectura Técnica

---

## 4.1 MODELO DE DATOS COMPLETO

### Entidad: `users`
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  avatar_url    TEXT,
  color_hex     TEXT NOT NULL DEFAULT '#6366F1', -- generado del nombre
  preferred_currency  CHAR(3) DEFAULT 'USD',
  preferred_locale    TEXT    DEFAULT 'es-PE',
  timezone      TEXT DEFAULT 'America/Lima',
  theme         TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ,
  -- Auth metadata (sincronizado desde Supabase Auth)
  auth_provider TEXT, -- 'google', 'apple', 'email'
  CONSTRAINT valid_currency CHECK (char_length(preferred_currency) = 3)
);
```

### Entidad: `groups`
```sql
CREATE TABLE groups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'general'
                  CHECK (type IN ('travel', 'home', 'event', 'shopping',
                                  'work', 'materials', 'birthday', 'general')),
  cover_emoji     TEXT DEFAULT '📋',
  cover_image_url TEXT,
  base_currency   CHAR(3) DEFAULT 'USD' NOT NULL,
  status          TEXT DEFAULT 'active'
                  CHECK (status IN ('active', 'closed', 'archived')),
  owner_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  closed_at       TIMESTAMPTZ,
  -- Metadata
  timezone        TEXT DEFAULT 'America/Lima',
  country_code    CHAR(2),
  description     TEXT,
  is_template     BOOLEAN DEFAULT FALSE,
  template_name   TEXT,
  -- Configuración
  default_split_rule  TEXT DEFAULT 'equal'
                      CHECK (default_split_rule IN ('equal', 'percentage', 'fixed', 'shares')),
  allow_pending   BOOLEAN DEFAULT TRUE,
  offline_mode    BOOLEAN DEFAULT TRUE,
  -- Soft delete
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_groups_owner ON groups(owner_id);
CREATE INDEX idx_groups_status ON groups(status);
```

### Entidad: `group_members`
```sql
CREATE TABLE group_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  -- Para miembros que no tienen cuenta (invitados por nombre)
  guest_name  TEXT,
  guest_color TEXT DEFAULT '#818CF8',
  role        TEXT DEFAULT 'member'
              CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  status      TEXT DEFAULT 'active'
              CHECK (status IN ('active', 'invited', 'left', 'removed')),
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  invited_at  TIMESTAMPTZ,
  left_at     TIMESTAMPTZ,
  invited_by  UUID REFERENCES users(id),
  -- Preferencias en el grupo
  default_currency  CHAR(3),
  notify_new_entry  BOOLEAN DEFAULT TRUE,
  notify_mentions   BOOLEAN DEFAULT TRUE,
  CONSTRAINT member_identity CHECK (
    (user_id IS NOT NULL) OR (guest_name IS NOT NULL)
  )
);

CREATE UNIQUE INDEX idx_group_member_unique ON group_members(group_id, user_id)
  WHERE user_id IS NOT NULL;
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
```

### Entidad: `entries` (corazón del sistema)
```sql
CREATE TYPE entry_type AS ENUM (
  'expense',    -- Gasto / compra
  'income',     -- Ingreso / cobro
  'discount',   -- Descuento
  'adjustment', -- Ajuste manual
  'transfer',   -- Transferencia entre miembros
  'note'        -- Nota sin monto
);

CREATE TYPE entry_status AS ENUM (
  'draft',           -- Capturado pero no validado
  'parsed',          -- Parseado por IA, pendiente confirmación
  'pending_review',  -- Incompleto, en bandeja de pendientes
  'confirmed',       -- Confirmado y activo
  'archived'         -- Archivado / eliminado lógico
);

CREATE TYPE entry_origin AS ENUM (
  'voice',  -- Grabación de voz
  'photo',  -- Foto / OCR
  'text',   -- Texto rápido
  'manual', -- Formulario manual
  'import'  -- Importación
);

CREATE TABLE entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  -- Clasificación
  type            entry_type NOT NULL DEFAULT 'expense',
  status          entry_status NOT NULL DEFAULT 'draft',
  origin          entry_origin NOT NULL DEFAULT 'text',
  -- Contenido
  description     TEXT NOT NULL DEFAULT '',
  notes           TEXT,
  category        TEXT DEFAULT 'other',
  -- Financiero
  amount          DECIMAL(12, 4) NOT NULL DEFAULT 0,
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  amount_in_base  DECIMAL(12, 4), -- calculado con tipo de cambio
  exchange_rate   DECIMAL(12, 6), -- tasa usada en la conversión
  -- Quién pagó
  paid_by         UUID REFERENCES users(id),
  paid_by_guest   UUID REFERENCES group_members(id), -- si es guest
  -- Reparto
  split_rule      TEXT DEFAULT 'equal'
                  CHECK (split_rule IN ('equal', 'percentage', 'fixed', 'shares', 'custom')),
  -- IA metadata
  ai_confidence   DECIMAL(3, 2), -- 0.00 a 1.00
  raw_input       TEXT,          -- texto o transcripción original
  ai_parse_job_id UUID,
  -- Timestamps
  entry_date      DATE DEFAULT CURRENT_DATE,
  entry_time      TIME,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at    TIMESTAMPTZ,
  archived_at     TIMESTAMPTZ,
  -- Para pending resolution
  pending_reasons TEXT[], -- ['falta_pagador', 'falta_moneda', ...]
  -- Attachments
  attachment_count INT DEFAULT 0,
  -- Orden manual (para drag & drop futuro)
  sort_order      INT DEFAULT 0
);

CREATE INDEX idx_entries_group ON entries(group_id);
CREATE INDEX idx_entries_status ON entries(status);
CREATE INDEX idx_entries_date ON entries(entry_date DESC);
CREATE INDEX idx_entries_created_by ON entries(created_by);
CREATE INDEX idx_entries_type ON entries(type);
```

### Entidad: `entry_items` (líneas de un ticket o gasto múltiple)
```sql
CREATE TABLE entry_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id      UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  description   TEXT NOT NULL,
  quantity      DECIMAL(8, 3) DEFAULT 1,
  unit_price    DECIMAL(12, 4) NOT NULL,
  subtotal      DECIMAL(12, 4) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  category      TEXT,
  -- Reparto propio (puede diferir del entry padre)
  split_rule    TEXT,
  notes         TEXT,
  -- Estado de parseo OCR
  ocr_confidence  DECIMAL(3, 2),
  ocr_raw_text    TEXT,
  is_confirmed    BOOLEAN DEFAULT FALSE,
  sort_order      INT DEFAULT 0
);

CREATE INDEX idx_entry_items_entry ON entry_items(entry_id);
```

### Entidad: `entry_splits` (cómo se divide cada entrada entre participantes)
```sql
CREATE TABLE entry_splits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id        UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  member_id       UUID NOT NULL REFERENCES group_members(id) ON DELETE CASCADE,
  -- Monto asignado a este miembro
  amount          DECIMAL(12, 4) NOT NULL,
  percentage      DECIMAL(5, 2),  -- si el reparto es por porcentaje
  shares          INT,            -- si el reparto es por partes
  -- Estado
  is_excluded     BOOLEAN DEFAULT FALSE,
  -- Para el item_split (si el split es a nivel de ítem)
  entry_item_id   UUID REFERENCES entry_items(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_entry_splits_entry ON entry_splits(entry_id);
CREATE INDEX idx_entry_splits_member ON entry_splits(member_id);
```

### Entidad: `attachments`
```sql
CREATE TABLE attachments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id      UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  group_id      UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  uploaded_by   UUID REFERENCES users(id),
  -- Storage
  storage_path  TEXT NOT NULL,  -- path en Supabase Storage
  public_url    TEXT,
  thumbnail_url TEXT,
  -- Metadata
  file_type     TEXT,  -- 'image/jpeg', 'image/png', 'application/pdf'
  file_size     INT,   -- bytes
  file_name     TEXT,
  -- OCR
  ocr_status    TEXT DEFAULT 'pending'
                CHECK (ocr_status IN ('pending', 'processing', 'done', 'failed')),
  ocr_raw_text  TEXT,
  ocr_confidence DECIMAL(3, 2),
  -- Timestamps
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attachments_entry ON attachments(entry_id);
```

### Entidad: `currency_rates`
```sql
CREATE TABLE currency_rates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency CHAR(3) NOT NULL,
  to_currency   CHAR(3) NOT NULL,
  rate          DECIMAL(12, 6) NOT NULL,
  source        TEXT DEFAULT 'auto',  -- 'auto' | 'manual' | 'group_override'
  rate_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  group_id      UUID REFERENCES groups(id) ON DELETE CASCADE, -- NULL = global
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_currency_rates_unique
  ON currency_rates(from_currency, to_currency, rate_date, COALESCE(group_id, '00000000-0000-0000-0000-000000000000'));

CREATE INDEX idx_currency_rates_date ON currency_rates(rate_date DESC);
```

### Entidad: `daily_closures`
```sql
CREATE TABLE daily_closures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  closure_date    DATE NOT NULL,
  closed_by       UUID REFERENCES users(id),
  -- Métricas del día
  total_amount    DECIMAL(12, 4) DEFAULT 0,
  total_currency  CHAR(3) DEFAULT 'USD',
  entry_count     INT DEFAULT 0,
  confirmed_count INT DEFAULT 0,
  pending_count   INT DEFAULT 0,
  -- Saldos al cierre
  balances_snapshot JSONB,  -- {member_id: balance_amount}
  -- Insights
  top_categories  JSONB,    -- [{category, amount, percentage}]
  ai_insights     TEXT[],
  -- Export
  export_url      TEXT,
  share_image_url TEXT,
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, closure_date)
);

CREATE INDEX idx_daily_closures_group ON daily_closures(group_id);
CREATE INDEX idx_daily_closures_date ON daily_closures(closure_date DESC);
```

### Entidad: `settlements` (liquidaciones)
```sql
CREATE TABLE settlements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  from_member   UUID NOT NULL REFERENCES group_members(id),
  to_member     UUID NOT NULL REFERENCES group_members(id),
  amount        DECIMAL(12, 4) NOT NULL,
  currency      CHAR(3) NOT NULL,
  status        TEXT DEFAULT 'pending'
                CHECK (status IN ('pending', 'confirmed', 'disputed')),
  -- Confirmación
  confirmed_by  UUID REFERENCES users(id),
  confirmed_at  TIMESTAMPTZ,
  -- Notas
  notes         TEXT,
  -- Tipo
  is_suggestion BOOLEAN DEFAULT TRUE,  -- sugerido por sistema o manual
  -- Timestamps
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settlements_group ON settlements(group_id);
```

### Entidad: `ai_parse_jobs`
```sql
CREATE TABLE ai_parse_jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by    UUID REFERENCES users(id),
  -- Input
  input_type    TEXT NOT NULL CHECK (input_type IN ('voice', 'text', 'ocr')),
  raw_input     TEXT,              -- texto o transcripción
  audio_url     TEXT,              -- si es voz, URL del audio
  image_url     TEXT,              -- si es foto, URL de la imagen
  -- Processing
  status        TEXT DEFAULT 'pending'
                CHECK (status IN ('pending', 'processing', 'done', 'failed')),
  -- Output
  parsed_result JSONB,             -- resultado del parsing
  confidence    DECIMAL(3, 2),
  error_message TEXT,
  -- Timing
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  duration_ms   INT,
  -- Link
  entry_id      UUID REFERENCES entries(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_parse_jobs_group ON ai_parse_jobs(group_id);
CREATE INDEX idx_ai_parse_jobs_status ON ai_parse_jobs(status);
```

### Entidad: `group_invites`
```sql
CREATE TABLE group_invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  invited_by  UUID NOT NULL REFERENCES users(id),
  token       TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  email       TEXT,  -- si la invitación es a email específico
  status      TEXT DEFAULT 'pending'
              CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  max_uses    INT DEFAULT 1,      -- NULL = ilimitado
  use_count   INT DEFAULT 0,
  expires_at  TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

CREATE INDEX idx_invites_token ON group_invites(token);
CREATE INDEX idx_invites_group ON group_invites(group_id);
```

### Entidad: `change_log` (audit trail ligero)
```sql
CREATE TABLE change_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  changed_by  UUID REFERENCES users(id),
  -- Qué cambió
  entity_type TEXT NOT NULL,  -- 'entry', 'entry_item', 'group', 'member'
  entity_id   UUID NOT NULL,
  action      TEXT NOT NULL,  -- 'created', 'updated', 'deleted', 'confirmed'
  -- Datos
  old_value   JSONB,
  new_value   JSONB,
  changed_fields TEXT[],      -- qué campos específicamente cambiaron
  -- Timestamps
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_change_log_group ON change_log(group_id);
CREATE INDEX idx_change_log_entity ON change_log(entity_type, entity_id);
CREATE INDEX idx_change_log_date ON change_log(created_at DESC);
```

---

## 4.2 VISTAS Y FUNCIONES SQL

### Vista: `member_balances` (saldos en tiempo real)
```sql
CREATE OR REPLACE VIEW member_balances AS
WITH paid_amounts AS (
  SELECT
    e.group_id,
    e.paid_by AS user_id,
    gm.id AS member_id,
    SUM(e.amount_in_base) AS total_paid
  FROM entries e
  JOIN group_members gm ON gm.user_id = e.paid_by AND gm.group_id = e.group_id
  WHERE e.status = 'confirmed'
    AND e.type IN ('expense', 'purchase')
  GROUP BY e.group_id, e.paid_by, gm.id
),
owed_amounts AS (
  SELECT
    e.group_id,
    es.member_id,
    SUM(es.amount) AS total_owed
  FROM entry_splits es
  JOIN entries e ON e.id = es.entry_id
  WHERE e.status = 'confirmed'
  GROUP BY e.group_id, es.member_id
)
SELECT
  gm.group_id,
  gm.id AS member_id,
  gm.user_id,
  COALESCE(gm.guest_name, u.display_name) AS member_name,
  COALESCE(pa.total_paid, 0) AS total_paid,
  COALESCE(oa.total_owed, 0) AS total_owed,
  COALESCE(pa.total_paid, 0) - COALESCE(oa.total_owed, 0) AS net_balance
FROM group_members gm
LEFT JOIN users u ON u.id = gm.user_id
LEFT JOIN paid_amounts pa ON pa.member_id = gm.id
LEFT JOIN owed_amounts oa ON oa.member_id = gm.id
WHERE gm.status = 'active';
```

### Función: `calculate_settlement_suggestions`
```sql
CREATE OR REPLACE FUNCTION calculate_settlement_suggestions(p_group_id UUID)
RETURNS TABLE(
  from_member_id UUID,
  to_member_id UUID,
  amount DECIMAL
) AS $$
DECLARE
  debtors  JSONB;
  creditors JSONB;
BEGIN
  -- Algoritmo de liquidación mínima (greedy)
  -- 1. Obtener saldos netos ordenados
  -- 2. El mayor deudor paga al mayor acreedor
  -- 3. Repetir hasta saldo cero
  -- Implementación completa en Edge Function
  RETURN QUERY
  SELECT mb.member_id, mb.member_id, mb.net_balance
  FROM member_balances mb
  WHERE mb.group_id = p_group_id
  LIMIT 0; -- placeholder
END;
$$ LANGUAGE plpgsql;
```

### Trigger: `update_entry_amount_in_base`
```sql
CREATE OR REPLACE FUNCTION sync_amount_in_base()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.currency = (SELECT base_currency FROM groups WHERE id = NEW.group_id) THEN
    NEW.amount_in_base := NEW.amount;
    NEW.exchange_rate := 1.0;
  ELSE
    SELECT rate INTO NEW.exchange_rate
    FROM currency_rates
    WHERE from_currency = NEW.currency
      AND to_currency = (SELECT base_currency FROM groups WHERE id = NEW.group_id)
      AND (group_id = NEW.group_id OR group_id IS NULL)
    ORDER BY rate_date DESC, group_id NULLS LAST
    LIMIT 1;

    NEW.amount_in_base := NEW.amount * COALESCE(NEW.exchange_rate, 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_amount_in_base
  BEFORE INSERT OR UPDATE OF amount, currency ON entries
  FOR EACH ROW EXECUTE FUNCTION sync_amount_in_base();
```

### Trigger: `auto_create_entry_splits`
```sql
-- Cuando se confirma una entrada, genera automáticamente los splits
-- según la regla de reparto
CREATE OR REPLACE FUNCTION auto_create_splits()
RETURNS TRIGGER AS $$
DECLARE
  member_count INT;
  equal_amount DECIMAL;
  member_row   group_members%ROWTYPE;
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- Borrar splits existentes
    DELETE FROM entry_splits WHERE entry_id = NEW.id;

    -- Contar miembros activos del grupo
    SELECT COUNT(*) INTO member_count
    FROM group_members
    WHERE group_id = NEW.group_id AND status = 'active';

    IF NEW.split_rule = 'equal' AND member_count > 0 THEN
      equal_amount := ROUND(NEW.amount / member_count, 4);

      FOR member_row IN
        SELECT * FROM group_members
        WHERE group_id = NEW.group_id AND status = 'active'
      LOOP
        INSERT INTO entry_splits (entry_id, member_id, amount)
        VALUES (NEW.id, member_row.id, equal_amount);
      END LOOP;
    END IF;
    -- Para 'percentage', 'fixed', 'custom': ya deben venir en el payload
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_splits
  AFTER UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION auto_create_splits();
```

---

## 4.3 ROW LEVEL SECURITY (RLS)

```sql
-- Habilitar RLS en todas las tablas principales
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION is_group_member(p_group_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_group_admin(p_group_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Políticas para groups
CREATE POLICY "Members can view their groups"
  ON groups FOR SELECT
  USING (is_group_member(id));

CREATE POLICY "Admins can update groups"
  ON groups FOR UPDATE
  USING (is_group_admin(id));

-- Políticas para entries
CREATE POLICY "Members can view group entries"
  ON entries FOR SELECT
  USING (is_group_member(group_id));

CREATE POLICY "Members can create entries"
  ON entries FOR INSERT
  WITH CHECK (is_group_member(group_id));

CREATE POLICY "Creator or admin can update entry"
  ON entries FOR UPDATE
  USING (
    created_by = auth.uid()
    OR is_group_admin(group_id)
  );
```

---

## 4.4 MOTOR DE CÁLCULO Y REPARTO

### Algoritmo de Reparto Igual

```typescript
// packages/shared/src/calculations/split.ts

export interface SplitInput {
  totalAmount: number;
  members: { id: string; name: string }[];
  excludedIds?: string[];
  rule: 'equal' | 'percentage' | 'fixed' | 'shares';
  customSplits?: { memberId: string; value: number }[];
}

export interface SplitResult {
  splits: { memberId: string; amount: number; percentage: number }[];
  totalAllocated: number;
  remainderCents: number;
}

export function calculateSplits(input: SplitInput): SplitResult {
  const activeMemberIds = input.members
    .map(m => m.id)
    .filter(id => !input.excludedIds?.includes(id));

  if (activeMemberIds.length === 0) {
    return { splits: [], totalAllocated: 0, remainderCents: 0 };
  }

  switch (input.rule) {
    case 'equal':
      return calculateEqualSplit(input.totalAmount, activeMemberIds);

    case 'percentage':
      return calculatePercentageSplit(
        input.totalAmount,
        input.customSplits || [],
        activeMemberIds
      );

    case 'fixed':
      return calculateFixedSplit(
        input.totalAmount,
        input.customSplits || [],
        activeMemberIds
      );

    case 'shares':
      return calculateSharesSplit(
        input.totalAmount,
        input.customSplits || [],
        activeMemberIds
      );
  }
}

function calculateEqualSplit(amount: number, memberIds: string[]): SplitResult {
  const count = memberIds.length;
  const exactAmount = amount / count;
  // Redondeo: la primera persona absorbe los centavos
  const roundedAmount = Math.floor(exactAmount * 100) / 100;
  const remainder = Math.round((amount - roundedAmount * count) * 100); // en centavos

  const splits = memberIds.map((memberId, index) => ({
    memberId,
    amount: index === 0
      ? roundedAmount + remainder / 100
      : roundedAmount,
    percentage: 100 / count,
  }));

  return {
    splits,
    totalAllocated: amount,
    remainderCents: 0,
  };
}

function calculatePercentageSplit(
  amount: number,
  customSplits: { memberId: string; value: number }[],
  activeIds: string[]
): SplitResult {
  const totalPercentage = customSplits.reduce((sum, s) => sum + s.value, 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error(`Porcentajes no suman 100: ${totalPercentage}`);
  }

  const splits = activeIds.map(memberId => {
    const custom = customSplits.find(s => s.memberId === memberId);
    const percentage = custom?.value ?? 0;
    return {
      memberId,
      amount: Math.round(amount * percentage) / 100,
      percentage,
    };
  });

  return {
    splits,
    totalAllocated: splits.reduce((s, r) => s + r.amount, 0),
    remainderCents: 0,
  };
}

function calculateSharesSplit(
  amount: number,
  customSplits: { memberId: string; value: number }[],
  activeIds: string[]
): SplitResult {
  const totalShares = customSplits.reduce((sum, s) => sum + s.value, 0);
  if (totalShares === 0) return calculateEqualSplit(amount, activeIds);

  const amountPerShare = amount / totalShares;

  const splits = activeIds.map(memberId => {
    const custom = customSplits.find(s => s.memberId === memberId);
    const shares = custom?.value ?? 0;
    return {
      memberId,
      amount: Math.round(amountPerShare * shares * 100) / 100,
      percentage: (shares / totalShares) * 100,
    };
  });

  return {
    splits,
    totalAllocated: splits.reduce((s, r) => s + r.amount, 0),
    remainderCents: 0,
  };
}

function calculateFixedSplit(
  amount: number,
  customSplits: { memberId: string; value: number }[],
  activeIds: string[]
): SplitResult {
  const splits = activeIds.map(memberId => {
    const custom = customSplits.find(s => s.memberId === memberId);
    return {
      memberId,
      amount: custom?.value ?? 0,
      percentage: custom ? (custom.value / amount) * 100 : 0,
    };
  });

  const totalAllocated = splits.reduce((s, r) => s + r.amount, 0);
  return {
    splits,
    totalAllocated,
    remainderCents: Math.round((amount - totalAllocated) * 100),
  };
}
```

### Algoritmo de Liquidación Mínima

```typescript
// packages/shared/src/calculations/settlement.ts

export interface MemberBalance {
  memberId: string;
  memberName: string;
  netBalance: number; // positivo = le deben, negativo = debe
}

export interface Settlement {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
}

export function calculateMinimalSettlements(
  balances: MemberBalance[]
): Settlement[] {
  // Algoritmo greedy de liquidación mínima
  // Complejidad: O(n log n) donde n = número de miembros

  const settlements: Settlement[] = [];

  // Separar deudores (balance negativo) y acreedores (balance positivo)
  const debtors = balances
    .filter(b => b.netBalance < -0.01)
    .map(b => ({ ...b, amount: Math.abs(b.netBalance) }))
    .sort((a, b) => b.amount - a.amount); // de mayor a menor deuda

  const creditors = balances
    .filter(b => b.netBalance > 0.01)
    .map(b => ({ ...b, amount: b.netBalance }))
    .sort((a, b) => b.amount - a.amount); // de mayor a menor crédito

  let di = 0; // índice deudores
  let ci = 0; // índice acreedores

  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di];
    const creditor = creditors[ci];
    const transferAmount = Math.min(debtor.amount, creditor.amount);

    if (transferAmount > 0.01) {
      settlements.push({
        fromMemberId: debtor.memberId,
        fromMemberName: debtor.memberName,
        toMemberId: creditor.memberId,
        toMemberName: creditor.memberName,
        amount: Math.round(transferAmount * 100) / 100,
      });
    }

    debtor.amount -= transferAmount;
    creditor.amount -= transferAmount;

    if (debtor.amount < 0.01) di++;
    if (creditor.amount < 0.01) ci++;
  }

  return settlements;
}
```

---

## 4.5 ARQUITECTURA DE EDGE FUNCTIONS (Supabase)

### Function: `parse-entry`
```typescript
// supabase/functions/parse-entry/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ParseRequest {
  groupId: string;
  inputType: 'voice' | 'text' | 'ocr';
  rawInput?: string;
  audioUrl?: string;
  imageUrl?: string;
  groupContext: {
    members: { id: string; name: string }[];
    baseCurrency: string;
    recentCategories: string[];
  };
}

serve(async (req) => {
  const { groupId, inputType, rawInput, audioUrl, imageUrl, groupContext } =
    await req.json() as ParseRequest;

  // 1. Si es voz → transcribir primero
  let textToParseInput = rawInput;
  if (inputType === 'voice' && audioUrl) {
    textToParseInput = await transcribeAudio(audioUrl);
  }

  // 2. Si es foto → OCR primero
  let ocrText = rawInput;
  if (inputType === 'ocr' && imageUrl) {
    ocrText = await extractTextFromImage(imageUrl);
  }

  // 3. Parsear con IA
  const parsed = await parseWithAI(
    textToParseInput || ocrText || '',
    inputType,
    groupContext
  );

  // 4. Guardar en DB
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: job } = await supabase
    .from('ai_parse_jobs')
    .insert({
      group_id: groupId,
      input_type: inputType,
      raw_input: textToParseInput || ocrText,
      parsed_result: parsed,
      confidence: parsed.confidence,
      status: 'done',
    })
    .select()
    .single();

  return new Response(JSON.stringify({ success: true, parsed, jobId: job.id }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

async function transcribeAudio(audioUrl: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}` },
    body: createWhisperFormData(audioUrl),
  });
  const data = await response.json();
  return data.text;
}

async function extractTextFromImage(imageUrl: string): Promise<string> {
  // Google Vision API
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${Deno.env.get('GOOGLE_VISION_KEY')}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { source: { imageUri: imageUrl } },
          features: [{ type: 'TEXT_DETECTION', maxResults: 50 }],
        }],
      }),
    }
  );
  const data = await response.json();
  return data.responses?.[0]?.fullTextAnnotation?.text || '';
}

async function parseWithAI(
  text: string,
  inputType: string,
  context: ParseRequest['groupContext']
) {
  // Ver Fase 6 para los prompts completos
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: buildSystemPrompt(context),
      messages: [{ role: 'user', content: text }],
    }),
  });
  const data = await response.json();
  return JSON.parse(data.content[0].text);
}

function buildSystemPrompt(context: ParseRequest['groupContext']): string {
  return `Eres el motor de parsing de Vozpe. Tu tarea es interpretar entradas de gastos en lenguaje natural.
Miembros del grupo: ${context.members.map(m => m.name).join(', ')}.
Moneda base: ${context.baseCurrency}.
Categorías recientes: ${context.recentCategories.join(', ')}.

Responde SIEMPRE con JSON válido siguiendo este schema exacto:
{
  "type": "expense|income|discount|adjustment|note",
  "description": "string",
  "amount": number | null,
  "currency": "USD|PEN|CLP|etc" | null,
  "paid_by": "member_name" | null,
  "beneficiaries": ["member_name"] | "all" | null,
  "split_rule": "equal|percentage|fixed|custom" | null,
  "category": "transport|food|accommodation|shopping|entertainment|other" | null,
  "notes": "string" | null,
  "pending_reasons": ["falta_pagador"|"falta_moneda"|"falta_monto"|...] | [],
  "confidence": 0.0-1.0,
  "is_note_only": boolean
}`;
}
```

---

## 4.6 ARQUITECTURA REALTIME

### Canales de Supabase Realtime

```typescript
// Suscripción a un grupo (mobile/web)
const channel = supabase
  .channel(`group:${groupId}`)
  // Cambios en entries
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'entries',
    filter: `group_id=eq.${groupId}`,
  }, (payload) => handleEntryChange(payload))
  // Cambios en splits
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'entry_splits',
  }, (payload) => handleSplitChange(payload))
  // Presencia (quién está online en el grupo)
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    updateOnlineUsers(state);
  })
  .on('presence', { event: 'join' }, ({ newPresences }) => {
    showUserJoined(newPresences);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        userId: currentUser.id,
        userName: currentUser.display_name,
        groupId,
        activeView: 'sheet', // qué vista está mirando
      });
    }
  });
```

---

## 4.7 ESTRATEGIA OFFLINE-FIRST

### Cola de Sincronización

```typescript
// packages/mobile/src/sync/queue.ts

interface SyncOperation {
  id: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

class SyncQueue {
  private queue: SyncOperation[] = [];
  private isProcessing = false;

  async enqueue(op: Omit<SyncOperation, 'id' | 'timestamp' | 'retries'>) {
    const operation: SyncOperation = {
      ...op,
      id: generateId(),
      timestamp: Date.now(),
      retries: 0,
    };

    // Guardar en MMKV (persistente)
    this.queue.push(operation);
    await this.persist();

    // Si hay red, procesar inmediatamente
    if (await isOnline()) {
      this.process();
    }
  }

  async process() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const op = this.queue[0];
      try {
        await this.executeOperation(op);
        this.queue.shift(); // éxito → remover
        await this.persist();
      } catch (error) {
        op.retries++;
        if (op.retries > 3) {
          // Mover a failed queue para revisión
          this.markAsFailed(op, error);
          this.queue.shift();
        } else {
          // Esperar exponencial antes de reintentar
          await sleep(Math.pow(2, op.retries) * 1000);
        }
      }
    }

    this.isProcessing = false;
  }

  private async executeOperation(op: SyncOperation) {
    switch (op.type) {
      case 'INSERT':
        await supabase.from(op.table).insert(op.data);
        break;
      case 'UPDATE':
        await supabase.from(op.table).update(op.data).eq('id', op.data.id);
        break;
      case 'DELETE':
        await supabase.from(op.table).delete().eq('id', op.data.id);
        break;
    }
  }
}
```

---

## 4.8 STACK TÉCNICO FINAL RECOMENDADO

```
MOBILE:
  Framework:    React Native 0.73 + Expo SDK 50
  Navigation:   Expo Router (file-based)
  State:        Zustand + React Query (TanStack Query)
  UI:           Custom DS + NativeWind (Tailwind para RN)
  Animations:   React Native Reanimated 3 + Moti
  Offline:      WatermelonDB (SQLite) + MMKV
  Audio:        Expo AV + expo-speech
  Camera:       Expo Camera + expo-image-picker
  Forms:        React Hook Form + Zod

WEB:
  Framework:    Next.js 14 (App Router + RSC)
  Styling:      Tailwind CSS + shadcn/ui base
  State:        Zustand + TanStack Query
  Table:        TanStack Table (virtual, headless)
  Animations:   Framer Motion
  Forms:        React Hook Form + Zod

BACKEND:
  Platform:     Supabase (PostgreSQL + Auth + Storage + Realtime)
  Edge Fns:     Deno (Supabase Edge Functions)
  Queue:        Supabase pg_cron + pg_net (para jobs async)

AI SERVICES:
  Speech:       OpenAI Whisper API (transcripción)
  Parser:       Anthropic Claude Haiku (velocidad + costo)
  OCR:          Google Vision API
  Fallback:     Reglas determinísticas para casos simples

EXPORTS:
  Excel:        ExcelJS (Node/Deno compatible)
  PDF:          @react-pdf/renderer (web) + expo-print (mobile)
  Images:       Canvas API / Sharp

MONITORING:
  Errors:       Sentry (mobile + web)
  Analytics:    PostHog
  Uptime:       Better Uptime

INFRA:
  Hosting web:  Vercel
  CDN / Assets: Supabase Storage + Cloudflare
  Secrets:      Supabase Vault + Vercel env vars
```
