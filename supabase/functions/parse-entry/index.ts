/**
 * VOZPE — Edge Function: parse-entry
 * Procesa entradas por voz, texto u OCR y las convierte en datos estructurados.
 * Ver Fase 6 para los prompt patterns completos.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParseRequest {
  mode?: 'transcribe' | 'parse';
  // Transcribe-only mode
  audioBase64?: string;
  audioFormat?: string;
  // Full parse mode
  groupId?: string;
  inputType?: 'voice' | 'text' | 'ocr';
  rawInput?: string;
  audioUrl?: string;
  imageUrl?: string;
  jobId?: string;
  groupContext?: {
    members: { id: string; name: string }[];
    baseCurrency: string;
    recentCategories?: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: ParseRequest = await req.json();

    // ── Transcribe-only mode (mobile sends audioBase64) ──────────────────────
    if (body.mode === 'transcribe') {
      const { audioBase64, audioFormat = 'm4a' } = body;
      if (!audioBase64) {
        return new Response(
          JSON.stringify({ success: false, error: 'audioBase64 required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBytes], { type: `audio/${audioFormat}` });

      const formData = new FormData();
      formData.append('file', audioBlob, `recording.${audioFormat}`);
      formData.append('model', 'whisper-1');
      formData.append('language', 'es');
      formData.append('response_format', 'text');

      const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}` },
        body: formData,
      });

      if (!whisperRes.ok) {
        const whisperError = await whisperRes.text();
        console.error(`[parse-entry] Whisper error ${whisperRes.status}:`, whisperError);
        return new Response(
          JSON.stringify({ success: false, error: `Whisper ${whisperRes.status}: ${whisperError}` }),
          { status: whisperRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const transcription = await whisperRes.text();
      return new Response(
        JSON.stringify({ success: true, transcription }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Full parse mode ───────────────────────────────────────────────────────
    const { groupId, inputType, rawInput, audioUrl, imageUrl, jobId, groupContext } = body;

    if (!groupContext) {
      return new Response(
        JSON.stringify({ success: false, error: 'groupContext required for parse mode' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Update job status to processing
    if (jobId) {
      await supabase.from('ai_parse_jobs').update({
        status: 'processing',
        started_at: new Date().toISOString(),
      }).eq('id', jobId);
    }

    const startTime = Date.now();
    let textToProcess = rawInput;

    // Step 1: Transcribe if voice
    if (inputType === 'voice' && audioUrl) {
      textToProcess = await transcribeWithWhisper(audioUrl);
    }

    // Step 2: OCR if photo
    let ocrText = '';
    if (inputType === 'ocr' && imageUrl) {
      ocrText = await extractTextWithVision(imageUrl);
      textToProcess = ocrText;
    }

    // Step 3: Parse with Claude
    const parsed = await parseWithClaude(
      textToProcess ?? '',
      inputType,
      groupContext,
      ocrText
    );

    const durationMs = Date.now() - startTime;

    // Update job with result
    if (jobId) {
      await supabase.from('ai_parse_jobs').update({
        status: 'done',
        parsed_result: parsed,
        confidence: parsed.confidence,
        raw_input: textToProcess,
        completed_at: new Date().toISOString(),
        duration_ms: durationMs,
      }).eq('id', jobId);
    }

    return new Response(
      JSON.stringify({ success: true, parsed, transcription: textToProcess }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('parse-entry error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function transcribeWithWhisper(audioUrl: string): Promise<string> {
  // Download audio
  const audioResponse = await fetch(audioUrl);
  const audioBlob = await audioResponse.blob();

  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.m4a');
  formData.append('model', 'whisper-1');
  formData.append('language', 'es');
  formData.append('response_format', 'text');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}` },
    body: formData,
  });

  if (!response.ok) throw new Error(`Whisper error: ${response.status}`);
  return await response.text();
}

async function extractTextWithVision(imageUrl: string): Promise<string> {
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${Deno.env.get('GOOGLE_VISION_KEY')}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { source: { imageUri: imageUrl } },
          features: [
            { type: 'TEXT_DETECTION', maxResults: 100 },
            { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 },
          ],
        }],
      }),
    }
  );

  const data = await response.json();
  return data.responses?.[0]?.fullTextAnnotation?.text ?? '';
}

async function parseWithClaude(
  text: string,
  inputType: string,
  context: ParseRequest['groupContext'],
  rawOcrText?: string
): Promise<Record<string, unknown>> {
  const systemPrompt = buildSystemPrompt(context, inputType, rawOcrText);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001', // Rápido y económico para parsing
      max_tokens: 1024,
      temperature: 0,
      system: systemPrompt,
      messages: [{ role: 'user', content: text || '[entrada vacía]' }],
    }),
  });

  const data = await response.json();
  const content = data.content?.[0]?.text ?? '{}';

  try {
    return JSON.parse(content);
  } catch {
    return {
      type: 'expense',
      description: text,
      amount: null,
      currency: null,
      paid_by: null,
      beneficiaries: null,
      split_rule: null,
      category: 'other',
      notes: null,
      pending_reasons: ['item_ambiguo'],
      confidence: 0.2,
      is_note_only: false,
    };
  }
}

function buildSystemPrompt(
  context: ParseRequest['groupContext'],
  inputType: string,
  rawOcrText?: string
): string {
  const memberList = context.members.map(m => m.name).join(', ');
  const currency = context.baseCurrency;
  const isOcr = inputType === 'ocr';

  return `Eres el motor de parsing de Vozpe, una app de gastos colaborativa. Tu tarea es interpretar entradas en lenguaje natural y convertirlas en datos estructurados.

CONTEXTO DEL GRUPO:
- Miembros: ${memberList}
- Moneda base: ${currency}
- Categorías recientes: ${context.recentCategories?.join(', ') ?? 'ninguna'}
${isOcr ? `\nTEXTO OCR CRUDO (para referencia):\n${rawOcrText}\n` : ''}

REGLAS DE INTERPRETACIÓN:
1. "yo", "pagué yo", "yo pagué" → pagador es el usuario actual (usa "me")
2. "todos", "entre todos", "dividido" → beneficiarios son todos los miembros
3. "solo para X" o "solo X" → beneficiario es ese miembro específico
4. Cantidades con "x" o "×" → multiplicar (ej: "3 x 4.5" = total 13.5)
5. Si falta información → agregar a pending_reasons en lugar de inventar
6. Para tickets OCR → extraer línea por línea en el array "items"
7. Si parece una nota o recordatorio → is_note_only: true, type: "note"
8. Siempre detectar la moneda del texto; si no hay, usar ${currency}
9. Descuentos → type: "discount", amount positivo, se restará automáticamente

CATEGORÍAS VÁLIDAS:
transport, food, accommodation, shopping, entertainment, travel, health, utilities, other

PENDING REASONS VÁLIDAS:
falta_pagador, falta_moneda, falta_monto, ocr_dudoso, posible_duplicado, ticket_mixto, reparto_no_definido, item_ambiguo

RESPONDE SIEMPRE con JSON válido, sin markdown, sin explicaciones:
{
  "type": "expense|income|discount|adjustment|note",
  "description": "string",
  "amount": number | null,
  "currency": "USD|PEN|EUR|..." | null,
  "paid_by": "nombre_miembro|me" | null,
  "beneficiaries": ["nombre1", "nombre2"] | "all" | null,
  "split_rule": "equal|percentage|fixed|shares" | null,
  "category": "categoria_valida" | null,
  "notes": "string" | null,
  "pending_reasons": ["razon1", ...],
  "confidence": 0.0-1.0,
  "is_note_only": boolean,
  "items": [
    { "description": "str", "quantity": num, "unit_price": num, "confidence": num }
  ] | null
}`;
}
