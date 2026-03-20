/**
 * KIVO Quick Text Parser
 * Parsea entradas de texto rápido sin necesidad de IA para casos simples.
 * La IA se usa como fallback para casos más complejos.
 */

import type { ParsedEntry, EntryCategory } from '../types';
import { AI_CATEGORY_KEYWORDS } from '../constants';

// Patrones de moneda
const CURRENCY_PATTERNS = {
  USD: /(?:usd|dólares?|dolar|us\$|\$\s*(?!(?:\d+\s*soles)))/i,
  PEN: /(?:pen|soles?|sol|s\/)/i,
  EUR: /(?:eur|euros?|€)/i,
  CLP: /(?:clp|pesos?\s*chilenos?)/i,
  COP: /(?:cop|pesos?\s*colombianos?)/i,
  MXN: /(?:mxn|pesos?\s*mexicanos?)/i,
};

// Patrones de reparto
const SPLIT_PATTERNS = {
  equal_all: /(?:para\s+)?todos(?:\s+(?:por\s+)?igual)?|entre\s+todos|dividido?\s+(?:entre\s+)?todos/i,
  equal_n: /(?:entre|dividido?\s+entre|para)\s+(\d+)(?:\s+personas?)?/i,
  personal: /(?:solo?\s+)?(?:para\s+)?(?:mí|mi|yo|yo\s+solo|personal|mia|mio)/i,
  for_person: /(?:solo?\s+)?(?:para\s+)([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/,
};

// Patrones de pago
const PAID_BY_PATTERNS = {
  me: /(?:pagu[eé]?\s+yo|yo\s+pagu[eé]?|(?:lo\s+)?pagu[eé]?\s+(?:yo)?|yo\s+(?:lo\s+)?pagu[eé]?|(?:pagué?\s+yo))/i,
  person_paid: /(?:pag[oóo]\s+|pagu[eé]?\s+)([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/i,
  person_paid_alt: /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)\s+pag[oó]/i,
};

// Patrones de cantidad × precio
const QUANTITY_PRICE_PATTERN = /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/i;

// Patrones de monto simple
const AMOUNT_PATTERN = /(?<!\d)(\d{1,6}(?:[.,]\d{1,4})?)(?!\d)/g;

export interface QuickParseResult {
  parsed: Partial<ParsedEntry>;
  confidence: number;
  needsAI: boolean;
}

export function parseQuickText(
  input: string,
  groupMembers: { id: string; name: string }[],
  defaultCurrency = 'USD'
): QuickParseResult {
  const text = input.trim().toLowerCase();
  const originalText = input.trim();

  let confidence = 0;
  const pending: ParsedEntry['pendingReasons'] = [];

  // 1. Detectar monto
  const { amount, currency, quantityPrice } = extractAmount(text, defaultCurrency);

  // 2. Detectar descripción (primeras palabras antes del monto)
  const description = extractDescription(originalText, amount);

  // 3. Detectar quién pagó
  const paidBy = extractPaidBy(text, groupMembers);

  // 4. Detectar beneficiarios y reparto
  const { beneficiaries, splitRule } = extractSplit(text, groupMembers);

  // 5. Detectar categoría
  const category = inferCategory(description.toLowerCase());

  // 6. Detectar si es nota
  const isNoteOnly = /^(?:nota|note|recordar|recuerda|anotar|falta)\s*:?\s*/i.test(text);

  // Calcular confianza
  if (amount !== null) confidence += 0.3;
  if (description) confidence += 0.2;
  if (paidBy !== null) confidence += 0.2;
  if (beneficiaries !== null) confidence += 0.2;
  if (currency) confidence += 0.1;

  // Determinar pendientes
  if (amount === null && !isNoteOnly) pending.push('falta_monto');
  if (paidBy === null && !isNoteOnly) pending.push('falta_pagador');
  if (!currency) pending.push('falta_moneda');

  // ¿Necesita IA? Si tiene más de 5 palabras y baja confianza
  const wordCount = text.split(/\s+/).length;
  const needsAI = confidence < 0.5 && wordCount > 4;

  return {
    parsed: {
      type: isNoteOnly ? 'note' : 'expense',
      description: description || originalText,
      amount: amount ?? null,
      currency: currency || null,
      paidBy,
      beneficiaries,
      splitRule: splitRule || 'equal',
      category: category || 'other',
      pendingReasons: pending,
      confidence,
      isNoteOnly,
    },
    confidence,
    needsAI,
  };
}

function extractAmount(
  text: string,
  defaultCurrency: string
): { amount: number | null; currency: string; quantityPrice?: { qty: number; price: number } } {
  // Primero buscar patrón cantidad × precio
  const qpMatch = text.match(QUANTITY_PRICE_PATTERN);
  if (qpMatch) {
    const qty = parseFloat(qpMatch[1].replace(',', '.'));
    const price = parseFloat(qpMatch[2].replace(',', '.'));
    const total = qty * price;
    return {
      amount: total,
      currency: detectCurrency(text, defaultCurrency),
      quantityPrice: { qty, price },
    };
  }

  // Buscar monto simple
  const amounts: number[] = [];
  const amountRegex = /(?<!\d)(\d{1,6}(?:[.,]\d{1,4})?)(?!\d)/g;
  let match;
  while ((match = amountRegex.exec(text)) !== null) {
    const val = parseFloat(match[1].replace(',', '.'));
    if (val > 0 && val < 1_000_000) {
      amounts.push(val);
    }
  }

  if (amounts.length === 0) return { amount: null, currency: defaultCurrency };

  // Tomar el monto más grande como el total (heurística simple)
  const amount = amounts.length === 1 ? amounts[0] : Math.max(...amounts);
  const currency = detectCurrency(text, defaultCurrency);

  return { amount, currency };
}

function detectCurrency(text: string, defaultCurrency: string): string {
  for (const [code, pattern] of Object.entries(CURRENCY_PATTERNS)) {
    if (pattern.test(text)) return code;
  }
  return defaultCurrency;
}

function extractDescription(original: string, amount: number | null): string {
  // Remover el monto y palabras de contexto para quedarse con la descripción
  let desc = original;

  // Remover monedas
  desc = desc.replace(/\b(usd|eur|pen|soles?|dólares?|dollars?|s\/)\b/gi, '');

  // Remover montos
  if (amount !== null) {
    desc = desc.replace(new RegExp(`\\b${amount}\\b`), '');
  }

  // Remover patrones de reparto comunes
  desc = desc.replace(/(?:entre|para|dividido\s+entre)\s+(?:todos|\d+)/gi, '');
  desc = desc.replace(/(?:pag[oóué]+\s+)?(?:yo|luis|diego|ana|caleb|todos)/gi, '');
  desc = desc.replace(/\b(yo|mi|mia|mio|personal|todos)\b/gi, '');

  // Limpiar y capitalizar primera letra
  desc = desc.replace(/\s+/g, ' ').trim();
  if (desc) {
    return desc.charAt(0).toUpperCase() + desc.slice(1).toLowerCase();
  }
  return original.split(/\s+/)[0] || original;
}

function extractPaidBy(
  text: string,
  members: { id: string; name: string }[]
): string | null {
  // ¿Pagué yo?
  if (PAID_BY_PATTERNS.me.test(text)) {
    return 'me'; // El cliente lo resuelve al usuario actual
  }

  // ¿Pagó X?
  const personPaidMatch = text.match(PAID_BY_PATTERNS.person_paid);
  if (personPaidMatch) {
    const name = personPaidMatch[1];
    return matchMemberName(name, members) || name;
  }

  const altMatch = text.match(PAID_BY_PATTERNS.person_paid_alt);
  if (altMatch) {
    const name = altMatch[1];
    return matchMemberName(name, members) || name;
  }

  // Intentar encontrar nombre de miembro en el texto
  for (const member of members) {
    const firstName = member.name.split(' ')[0].toLowerCase();
    if (firstName.length >= 3 && text.includes(firstName)) {
      // Verificar que no sea beneficiario (contexto)
      const idx = text.indexOf(firstName);
      const before = text.substring(Math.max(0, idx - 10), idx);
      if (/pag[oóué]/.test(before)) {
        return member.id;
      }
    }
  }

  return null;
}

function extractSplit(
  text: string,
  members: { id: string; name: string }[]
): { beneficiaries: string[] | 'all' | null; splitRule: 'equal' | 'custom' | null } {
  // ¿Para todos?
  if (SPLIT_PATTERNS.equal_all.test(text)) {
    return { beneficiaries: 'all', splitRule: 'equal' };
  }

  // ¿Entre N personas?
  const nMatch = text.match(SPLIT_PATTERNS.equal_n);
  if (nMatch) {
    return { beneficiaries: 'all', splitRule: 'equal' }; // simplificado
  }

  // ¿Solo para mí?
  if (SPLIT_PATTERNS.personal.test(text)) {
    return { beneficiaries: ['me'], splitRule: 'equal' };
  }

  // ¿Para nombre específico?
  for (const member of members) {
    const firstName = member.name.split(' ')[0].toLowerCase();
    if (firstName.length >= 3 && text.includes(`para ${firstName}`)) {
      return { beneficiaries: [member.id], splitRule: 'equal' };
    }
    if (firstName.length >= 3 && new RegExp(`solo.*${firstName}`, 'i').test(text)) {
      return { beneficiaries: [member.id], splitRule: 'equal' };
    }
  }

  return { beneficiaries: null, splitRule: null };
}

function inferCategory(description: string): EntryCategory {
  for (const [category, keywords] of Object.entries(AI_CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => description.includes(kw))) {
      return category as EntryCategory;
    }
  }
  return 'other';
}

function matchMemberName(
  name: string,
  members: { id: string; name: string }[]
): string | null {
  const nameLower = name.toLowerCase();
  for (const member of members) {
    const firstName = member.name.split(' ')[0].toLowerCase();
    if (firstName === nameLower || member.name.toLowerCase() === nameLower) {
      return member.id;
    }
  }
  return null;
}
