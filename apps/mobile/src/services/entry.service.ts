/**
 * Entry Service — handles creation, parsing and management of entries
 */

import { supabase } from '../lib/supabase';
import { parseQuickText } from '@kivo/shared';
import type { Entry, ParsedEntry, GroupMember } from '@kivo/shared';

const AI_PARSE_ENDPOINT = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/parse-entry`;

export interface CreateEntryOptions {
  groupId: string;
  members: GroupMember[];
  defaultCurrency: string;
  createdBy: string;
}

// ─── Create from text ─────────────────────────────────────────────────────────

export async function createEntryFromText(
  rawText: string,
  options: CreateEntryOptions
): Promise<{ entry: Partial<Entry>; needsAI: boolean; parsed: Partial<ParsedEntry> }> {
  const { parsed, needsAI } = parseQuickText(
    rawText,
    options.members.map(m => ({ id: m.id, name: m.displayName })),
    options.defaultCurrency
  );

  if (needsAI || parsed.confidence! < 0.6) {
    // Delegate to AI
    const aiResult = await parseWithAI(rawText, 'text', options);
    return { entry: buildEntry(aiResult, rawText, 'text', options), needsAI: true, parsed: aiResult };
  }

  return { entry: buildEntry(parsed as ParsedEntry, rawText, 'text', options), needsAI: false, parsed };
}

// ─── Create from voice ────────────────────────────────────────────────────────

export async function createEntryFromVoice(
  audioUri: string,
  options: CreateEntryOptions
): Promise<{ entry: Partial<Entry>; parsed: Partial<ParsedEntry> }> {
  // Upload audio to Supabase Storage
  const audioPath = `groups/${options.groupId}/audio/${Date.now()}.m4a`;
  const audioBlob = await fetch(audioUri).then(r => r.blob());

  const { data: uploadData } = await supabase.storage
    .from('attachments')
    .upload(audioPath, audioBlob, { contentType: 'audio/m4a' });

  const { data: { publicUrl } } = supabase.storage
    .from('attachments')
    .getPublicUrl(audioPath);

  // Parse with AI (includes Whisper transcription)
  const aiResult = await parseWithAI(undefined, 'voice', options, publicUrl);

  return { entry: buildEntry(aiResult, undefined, 'voice', options), parsed: aiResult };
}

// ─── Create from photo ────────────────────────────────────────────────────────

export async function createEntryFromPhoto(
  imageUri: string,
  options: CreateEntryOptions
): Promise<{ jobId: string; imageUrl: string }> {
  // Upload image to Supabase Storage
  const imagePath = `groups/${options.groupId}/receipts/${Date.now()}.jpg`;
  const imageBlob = await fetch(imageUri).then(r => r.blob());

  const { data: uploadData } = await supabase.storage
    .from('attachments')
    .upload(imagePath, imageBlob, { contentType: 'image/jpeg' });

  const { data: { publicUrl } } = supabase.storage
    .from('attachments')
    .getPublicUrl(imagePath);

  // Start async OCR + parsing job
  const { data: job } = await supabase
    .from('ai_parse_jobs')
    .insert({
      group_id: options.groupId,
      created_by: options.createdBy,
      input_type: 'ocr',
      image_url: publicUrl,
      status: 'pending',
    })
    .select()
    .single();

  // Trigger edge function (don't await — it's async)
  fetch(AI_PARSE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jobId: job.id,
      groupId: options.groupId,
      inputType: 'ocr',
      imageUrl: publicUrl,
      groupContext: {
        members: options.members.map(m => ({ id: m.id, name: m.displayName })),
        baseCurrency: options.defaultCurrency,
      },
    }),
  });

  return { jobId: job.id, imageUrl: publicUrl };
}

// ─── Save entry to DB ─────────────────────────────────────────────────────────

export async function saveEntry(
  entry: Partial<Entry>,
  splits?: { memberId: string; amount: number; percentage: number }[]
): Promise<Entry> {
  const { data, error } = await supabase
    .from('entries')
    .insert({
      group_id: entry.groupId,
      created_by: entry.createdBy,
      type: entry.type ?? 'expense',
      status: entry.pendingReasons?.length ? 'pending_review' : 'confirmed',
      origin: entry.origin ?? 'text',
      description: entry.description ?? '',
      notes: entry.notes,
      category: entry.category ?? 'other',
      amount: entry.amount ?? 0,
      currency: entry.currency ?? 'USD',
      paid_by: entry.paidBy,
      split_rule: entry.splitRule ?? 'equal',
      raw_input: entry.rawInput,
      entry_date: entry.entryDate ?? new Date().toISOString().split('T')[0],
      pending_reasons: entry.pendingReasons ?? [],
      ai_confidence: entry.aiConfidence,
    })
    .select()
    .single();

  if (error) throw error;

  // Create splits if provided and entry is confirmed
  if (splits && data.status === 'confirmed' && data.id) {
    await supabase.from('entry_splits').insert(
      splits.map(s => ({ entry_id: data.id, member_id: s.memberId, amount: s.amount, percentage: s.percentage }))
    );
  }

  return data;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function parseWithAI(
  text: string | undefined,
  inputType: 'text' | 'voice' | 'ocr',
  options: CreateEntryOptions,
  mediaUrl?: string
): Promise<ParsedEntry> {
  const response = await fetch(AI_PARSE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      groupId: options.groupId,
      inputType,
      rawInput: text,
      audioUrl: inputType === 'voice' ? mediaUrl : undefined,
      imageUrl: inputType === 'ocr' ? mediaUrl : undefined,
      groupContext: {
        members: options.members.map(m => ({ id: m.id, name: m.displayName })),
        baseCurrency: options.defaultCurrency,
        recentCategories: [],
      },
    }),
  });

  const data = await response.json();
  return data.parsed as ParsedEntry;
}

function buildEntry(
  parsed: Partial<ParsedEntry>,
  rawInput: string | undefined,
  origin: 'text' | 'voice' | 'photo',
  options: CreateEntryOptions
): Partial<Entry> {
  return {
    groupId: options.groupId,
    createdBy: options.createdBy,
    origin,
    type: parsed.type ?? 'expense',
    description: parsed.description ?? '',
    amount: parsed.amount ?? 0,
    currency: parsed.currency ?? options.defaultCurrency,
    paidBy: parsed.paidBy === 'me' ? options.createdBy : parsed.paidBy ?? undefined,
    splitRule: parsed.splitRule ?? 'equal',
    category: parsed.category ?? 'other',
    notes: parsed.notes ?? undefined,
    rawInput,
    pendingReasons: parsed.pendingReasons ?? [],
    aiConfidence: parsed.confidence,
    entryDate: new Date().toISOString().split('T')[0],
  };
}
