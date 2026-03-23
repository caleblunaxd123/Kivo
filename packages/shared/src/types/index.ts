// ─── Core Types for Vozpe ────────────────────────────────────────────────────

export type EntryType = 'expense' | 'income' | 'discount' | 'adjustment' | 'transfer' | 'note';
export type EntryStatus = 'draft' | 'parsed' | 'pending_review' | 'confirmed' | 'archived';
export type EntryOrigin = 'voice' | 'photo' | 'text' | 'manual' | 'import';
export type SplitRule = 'equal' | 'percentage' | 'fixed' | 'shares' | 'custom';
export type GroupType = 'travel' | 'home' | 'event' | 'shopping' | 'work' | 'materials' | 'birthday' | 'general' | 'couple';
export type GroupStatus = 'active' | 'closed' | 'archived';
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';
export type PendingReason =
  | 'falta_pagador'
  | 'falta_moneda'
  | 'falta_monto'
  | 'ocr_dudoso'
  | 'posible_duplicado'
  | 'ticket_mixto'
  | 'reparto_no_definido'
  | 'item_ambiguo';

export type EntryCategory =
  | 'transport'
  | 'food'
  | 'accommodation'
  | 'shopping'
  | 'entertainment'
  | 'travel'
  | 'health'
  | 'utilities'
  | 'other';

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  colorHex: string;
  preferredCurrency: string;
  preferredLocale: string;
  timezone: string;
  theme: 'dark' | 'light' | 'system';
  createdAt: string;
  lastSeenAt?: string;
}

// ─── Group ───────────────────────────────────────────────────────────────────

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  coverEmoji: string;
  coverImageUrl?: string;
  baseCurrency: string;
  status: GroupStatus;
  ownerId: string;
  timezone: string;
  countryCode?: string;
  description?: string;
  defaultSplitRule: SplitRule;
  allowPending: boolean;
  offlineMode: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  // Calculados / relaciones
  members?: GroupMember[];
  memberCount?: number;
  totalAmount?: number;
  pendingCount?: number;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId?: string;
  guestName?: string;
  guestColor?: string;
  role: MemberRole;
  status: 'active' | 'invited' | 'left' | 'removed';
  joinedAt: string;
  // Relaciones
  user?: User;
  displayName: string;
  colorHex: string;
  avatarUrl?: string;
}

// ─── Entry ───────────────────────────────────────────────────────────────────

export interface Entry {
  id: string;
  groupId: string;
  createdBy?: string;
  type: EntryType;
  status: EntryStatus;
  origin: EntryOrigin;
  description: string;
  notes?: string;
  category: EntryCategory;
  amount: number;
  currency: string;
  amountInBase?: number;
  exchangeRate?: number;
  paidBy?: string;
  paidByGuest?: string;
  splitRule: SplitRule;
  aiConfidence?: number;
  rawInput?: string;
  entryDate: string;
  entryTime?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  pendingReasons: PendingReason[];
  attachmentCount: number;
  sortOrder: number;
  // Relaciones
  items?: EntryItem[];
  splits?: EntrySplit[];
  attachments?: Attachment[];
}

export interface EntryItem {
  id: string;
  entryId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number; // calculado: quantity * unitPrice
  category?: EntryCategory;
  splitRule?: SplitRule;
  notes?: string;
  ocrConfidence?: number;
  ocrRawText?: string;
  isConfirmed: boolean;
  sortOrder: number;
}

export interface EntrySplit {
  id: string;
  entryId: string;
  memberId: string;
  amount: number;
  percentage?: number;
  shares?: number;
  isExcluded: boolean;
  entryItemId?: string;
  // Relaciones
  member?: GroupMember;
}

// ─── Attachment ───────────────────────────────────────────────────────────────

export interface Attachment {
  id: string;
  entryId: string;
  groupId: string;
  uploadedBy?: string;
  storagePath: string;
  publicUrl?: string;
  thumbnailUrl?: string;
  fileType?: string;
  fileSize?: number;
  fileName?: string;
  ocrStatus: 'pending' | 'processing' | 'done' | 'failed';
  ocrRawText?: string;
  ocrConfidence?: number;
  createdAt: string;
}

// ─── Balance y Liquidación ───────────────────────────────────────────────────

export interface MemberBalance {
  memberId: string;
  memberName: string;
  colorHex: string;
  userId?: string;
  totalPaid: number;
  totalOwed: number;
  netBalance: number; // positivo = acreedor, negativo = deudor
  currency: string;
}

export interface Settlement {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'disputed';
}

// ─── Daily Closure ────────────────────────────────────────────────────────────

export interface DailyClosure {
  id: string;
  groupId: string;
  closureDate: string;
  closedBy?: string;
  totalAmount: number;
  totalCurrency: string;
  entryCount: number;
  confirmedCount: number;
  pendingCount: number;
  balancesSnapshot: Record<string, number>;
  topCategories: { category: string; amount: number; percentage: number }[];
  aiInsights: string[];
  exportUrl?: string;
  shareImageUrl?: string;
  createdAt: string;
}

// ─── AI Parsing ───────────────────────────────────────────────────────────────

export interface ParsedEntry {
  type: EntryType;
  description: string;
  amount: number | null;
  currency: string | null;
  paidBy: string | null;           // nombre del miembro
  beneficiaries: string[] | 'all' | null;
  splitRule: SplitRule | null;
  category: EntryCategory | null;
  notes: string | null;
  pendingReasons: PendingReason[];
  confidence: number;              // 0.0 - 1.0
  isNoteOnly: boolean;
  entryDate?: string;              // YYYY-MM-DD, optional (override today)
  items?: {                        // para tickets con múltiples líneas
    description: string;
    quantity: number;
    unitPrice: number;
    confidence: number;
  }[];
}

export interface AIParseJob {
  id: string;
  groupId: string;
  createdBy?: string;
  inputType: 'voice' | 'text' | 'ocr';
  rawInput?: string;
  audioUrl?: string;
  imageUrl?: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  parsedResult?: ParsedEntry;
  confidence?: number;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  entryId?: string;
  createdAt: string;
}

// ─── Invite ───────────────────────────────────────────────────────────────────

export interface GroupInvite {
  id: string;
  groupId: string;
  invitedBy: string;
  token: string;
  email?: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  maxUses?: number;
  useCount: number;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
  // Relaciones
  group?: Pick<Group, 'id' | 'name' | 'coverEmoji' | 'type'>;
}

// ─── Change Log ───────────────────────────────────────────────────────────────

export interface ChangeLogEntry {
  id: string;
  groupId: string;
  changedBy?: string;
  entityType: 'entry' | 'entry_item' | 'group' | 'member';
  entityId: string;
  action: 'created' | 'updated' | 'deleted' | 'confirmed' | 'archived';
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  changedFields?: string[];
  createdAt: string;
  // Relaciones
  user?: Pick<User, 'id' | 'displayName' | 'avatarUrl' | 'colorHex'>;
}
