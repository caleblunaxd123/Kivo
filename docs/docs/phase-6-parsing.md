# VOZPE — Fase 6: Prompts de Parsing de Voz, Texto y OCR

---

## 6.1 ESTRATEGIA GENERAL DE PARSING

### Tres capas de procesamiento

```
Entrada del usuario
        │
        ▼
CAPA 1: PARSER RÁPIDO DETERMINÍSTICO
(quick-text-parser.ts)
  - Para texto simple y corto (< 8 palabras)
  - Regex + heurísticas
  - Sin latencia, sin costo
  - Confianza media-alta en casos simples
        │
        ├─── Confianza >= 0.7 → Confirmar directamente
        │
        └─── Confianza < 0.7 → CAPA 2
                │
                ▼
        CAPA 2: LLM (Claude Haiku)
        (parse-entry Edge Function)
          - Para texto complejo, ambiguo o voz
          - Para OCR de tickets
          - Latencia: 300-800ms
          - Costo bajo (Haiku)
                │
                └─── Respuesta estructurada JSON
                          │
                          ▼
                CAPA 3: VALIDACIÓN + PENDIENTES
                  - Verifica que el JSON sea válido
                  - Si faltan campos críticos → pending_reasons
                  - Si confianza < 0.4 → guardar como draft
                  - Si confianza >= 0.4 → confirmar con review
```

### Cuándo usar la IA vs reglas determinísticas

| Caso | Determinístico | IA |
|------|-----------|-----|
| "taxi 40" | ✅ | ❌ |
| "uber 22 entre 3" | ✅ | ❌ |
| "snacks 12 usd yo" | ✅ | ❌ |
| "taxi cuarenta dólares, pagué yo, entre 4" | Parcial | ✅ (voz) |
| "almuerzo en el restaurant frente al hotel" | ❌ | ✅ |
| Ticket de supermercado (OCR) | ❌ | ✅ |
| "falta comprar agua y papel" (nota) | Parcial | ✅ |
| "descuento del 10% en total" | ❌ | ✅ |
| "2 poleras a 15 solo para Diego y Ana" | Parcial | ✅ |

---

## 6.2 SYSTEM PROMPT PRINCIPAL (producción)

```
Eres el motor de parsing de Vozpe, una app de gastos colaborativa.
Tu única función es interpretar entradas de gastos en lenguaje natural
y devolver datos estructurados como JSON.

CONTEXTO:
- Miembros del grupo: {MEMBER_LIST}
- Moneda base del grupo: {BASE_CURRENCY}
- Fecha actual: {CURRENT_DATE}
- Categorías más usadas: {RECENT_CATEGORIES}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLAS DE INTERPRETACIÓN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PAGADOR:
- "yo", "pagué yo", "yo pagué", "yo lo pagué" → paid_by: "me"
- "pagó [nombre]", "[nombre] pagó" → paid_by: nombre exacto del miembro
- Si no se menciona → paid_by: null, pending_reason: "falta_pagador"

BENEFICIARIOS:
- "todos", "entre todos", "para todos", "dividido entre todos" → beneficiaries: "all"
- "entre [N]", "dividido entre [N]" → beneficiaries: "all" (si N = total miembros)
- "solo para [nombre]", "solo [nombre]", "para [nombre]" → beneficiaries: [nombre]
- "para [nombre1] y [nombre2]" → beneficiaries: [nombre1, nombre2]
- "solo mía", "solo mío", "solo yo" → beneficiaries: ["me"]
- Si no se menciona en texto de voz/texto → beneficiaries: "all" (default)
- Si no se puede inferir en OCR → beneficiaries: null, pending_reason: "reparto_no_definido"

MONTOS:
- Siempre parsear el número más relevante como amount
- "3 x 4.5" o "3 × 4.5" → amount: 13.5, incluir en notes: "3 × 4.5"
- "unos 20", "como 20", "aprox 20" → amount: 20, confidence: 0.75
- Si no hay número → amount: null, pending_reason: "falta_monto"

MONEDAS:
- "dólares", "dolar", "USD", "$" (cuando no hay ambigüedad) → currency: "USD"
- "soles", "sol", "S/", "PEN" → currency: "PEN"
- "euros", "EUR", "€" → currency: "EUR"
- "pesos" → inferir por país del grupo o miembros
- Si no se menciona → usar base_currency del grupo
- Si hay ambigüedad → currency: null, pending_reason: "falta_moneda"

CATEGORÍAS:
- Inferir del contexto de la descripción
- taxi, uber, bus, tren, vuelo → transport
- comida, almuerzo, cena, desayuno, restaurant, café → food
- hotel, hostal, airbnb → accommodation
- supermercado, tienda, mall → shopping
- cine, teatro, discoteca, bar → entertainment
- tour, excursión → travel
- farmacia, doctor → health
- luz, agua, internet, Netflix → utilities
- No forzar categoría si no es clara → "other"

TIPOS:
- Gasto normal → type: "expense"
- Descuento o devolución → type: "discount"
- Si parece nota/recordatorio → type: "note", is_note_only: true
- Ingreso o cobro → type: "income"

PENDIENTES:
- Solo agregar a pending_reasons cuando realmente falta info
- No inventar datos para evitar pendientes
- Si confidence < 0.5, siempre incluir algún pending_reason

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO DE RESPUESTA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Responde ÚNICAMENTE con JSON válido, sin markdown, sin explicaciones.
Schema exacto:

{
  "type": "expense" | "income" | "discount" | "adjustment" | "note",
  "description": string,           // nombre limpio del gasto, sin montos ni personas
  "amount": number | null,
  "currency": string | null,       // código ISO 3: USD, PEN, EUR, etc.
  "paid_by": string | null,        // "me" o nombre exacto del miembro
  "beneficiaries": string[] | "all" | null,
  "split_rule": "equal" | "percentage" | "fixed" | "shares" | null,
  "category": string | null,
  "notes": string | null,          // info adicional relevante
  "pending_reasons": string[],     // array vacío [] si todo está completo
  "confidence": number,            // 0.0 a 1.0
  "is_note_only": boolean,
  "items": [                       // solo para tickets con múltiples líneas
    {
      "description": string,
      "quantity": number,
      "unit_price": number,
      "confidence": number
    }
  ] | null
}
```

---

## 6.3 EJEMPLOS DE ENTRADA Y SALIDA

### Texto simple — alta confianza

**Input:** `"taxi 40 dólares, pagué yo, entre 4"`
```json
{
  "type": "expense",
  "description": "Taxi",
  "amount": 40,
  "currency": "USD",
  "paid_by": "me",
  "beneficiaries": "all",
  "split_rule": "equal",
  "category": "transport",
  "notes": null,
  "pending_reasons": [],
  "confidence": 0.97,
  "is_note_only": false,
  "items": null
}
```

---

**Input:** `"2 polos a 15 dólares, solo para Diego"`
```json
{
  "type": "expense",
  "description": "Polos",
  "amount": 30,
  "currency": "USD",
  "paid_by": null,
  "beneficiaries": ["Diego"],
  "split_rule": "equal",
  "category": "shopping",
  "notes": "2 × $15",
  "pending_reasons": ["falta_pagador"],
  "confidence": 0.85,
  "is_note_only": false,
  "items": null
}
```

---

**Input:** `"almuerzo 80, pagó Luis, compartido"`
```json
{
  "type": "expense",
  "description": "Almuerzo",
  "amount": 80,
  "currency": "USD",
  "paid_by": "Luis",
  "beneficiaries": "all",
  "split_rule": "equal",
  "category": "food",
  "notes": null,
  "pending_reasons": [],
  "confidence": 0.96,
  "is_note_only": false,
  "items": null
}
```

---

**Input:** `"uber 22 dividido entre 3"`
```json
{
  "type": "expense",
  "description": "Uber",
  "amount": 22,
  "currency": "USD",
  "paid_by": null,
  "beneficiaries": "all",
  "split_rule": "equal",
  "category": "transport",
  "notes": "entre 3 personas",
  "pending_reasons": ["falta_pagador"],
  "confidence": 0.88,
  "is_note_only": false,
  "items": null
}
```

---

**Input:** `"agua 3 x 2.5 todos"`
```json
{
  "type": "expense",
  "description": "Agua mineral",
  "amount": 7.5,
  "currency": "USD",
  "paid_by": null,
  "beneficiaries": "all",
  "split_rule": "equal",
  "category": "shopping",
  "notes": "3 × $2.50",
  "pending_reasons": ["falta_pagador"],
  "confidence": 0.87,
  "is_note_only": false,
  "items": null
}
```

---

**Input:** `"mercado 80 casa"` (ambiguo)
```json
{
  "type": "expense",
  "description": "Mercado",
  "amount": 80,
  "currency": "USD",
  "paid_by": null,
  "beneficiaries": null,
  "split_rule": null,
  "category": "shopping",
  "notes": "casa",
  "pending_reasons": ["falta_pagador", "reparto_no_definido"],
  "confidence": 0.62,
  "is_note_only": false,
  "items": null
}
```

---

**Input:** `"falta comprar agua"`
```json
{
  "type": "note",
  "description": "Falta comprar agua",
  "amount": null,
  "currency": null,
  "paid_by": null,
  "beneficiaries": null,
  "split_rule": null,
  "category": null,
  "notes": null,
  "pending_reasons": [],
  "confidence": 0.92,
  "is_note_only": true,
  "items": null
}
```

---

**Input:** `"descuento de 10 soles"`
```json
{
  "type": "discount",
  "description": "Descuento",
  "amount": 10,
  "currency": "PEN",
  "paid_by": null,
  "beneficiaries": "all",
  "split_rule": "equal",
  "category": "other",
  "notes": null,
  "pending_reasons": [],
  "confidence": 0.90,
  "is_note_only": false,
  "items": null
}
```

---

### OCR de ticket — múltiples ítems

**Input (OCR text):**
```
SUPERMERCADO METRO
Agua mineral x2    6.00
Pan integral       4.50
Yogurt natural x3  8.40
[borroso]          8.90
Gaseosa x2        5.60
TOTAL:            33.40
```

**Output:**
```json
{
  "type": "expense",
  "description": "Supermercado Metro",
  "amount": 33.40,
  "currency": "PEN",
  "paid_by": null,
  "beneficiaries": null,
  "split_rule": "equal",
  "category": "shopping",
  "notes": "Ticket escaneado",
  "pending_reasons": ["falta_pagador", "reparto_no_definido", "ocr_dudoso"],
  "confidence": 0.73,
  "is_note_only": false,
  "items": [
    { "description": "Agua mineral", "quantity": 2, "unit_price": 3.00, "confidence": 0.98 },
    { "description": "Pan integral", "quantity": 1, "unit_price": 4.50, "confidence": 0.97 },
    { "description": "Yogurt natural", "quantity": 3, "unit_price": 2.80, "confidence": 0.96 },
    { "description": "Ítem no legible", "quantity": 1, "unit_price": 8.90, "confidence": 0.25 },
    { "description": "Gaseosa", "quantity": 2, "unit_price": 2.80, "confidence": 0.95 }
  ]
}
```

---

### Caso de voz complejo

**Transcripción Whisper:** `"Oye, al final el almuerzo de hoy fue ochenta soles, lo pagó Luis para todos nosotros"`

**Output:**
```json
{
  "type": "expense",
  "description": "Almuerzo",
  "amount": 80,
  "currency": "PEN",
  "paid_by": "Luis",
  "beneficiaries": "all",
  "split_rule": "equal",
  "category": "food",
  "notes": null,
  "pending_reasons": [],
  "confidence": 0.94,
  "is_note_only": false,
  "items": null
}
```

---

### Prompt especial para OCR de ticket

Cuando `inputType === 'ocr'`, se añade este bloque adicional al system prompt:

```
MODO OCR DE TICKET:
Estás interpretando texto extraído de una foto de ticket de compra.
El texto puede tener errores de OCR, líneas cortadas o caracteres incorrectos.

Reglas adicionales:
1. Identifica el nombre del negocio (primera o segunda línea generalmente)
2. Extrae cada ítem como un objeto en el array "items"
3. Para ítems con OCR poco legible, usa confidence < 0.5
4. Busca el TOTAL al final del ticket y úsalo como amount
5. Si cantidad no está explícita, asume quantity: 1
6. Detecta impuestos y propinas como ítems separados con categoría correspondiente
7. Si hay texto muy borroso o ilegible, description: "Ítem no legible"

FORMATO DE ÍTEMS:
Texto OCR típico: "Agua mineral  x2    6.00"
→ { "description": "Agua mineral", "quantity": 2, "unit_price": 3.00, "confidence": 0.97 }

Texto OCR típico: "Descuento especial  -5.00"
→ Agrega como ítem con unit_price negativo o menciona en notes

Texto OCR típico: "IGV 18%   5.40"
→ { "description": "IGV (18%)", "quantity": 1, "unit_price": 5.40, "confidence": 0.95 }
```

---

## 6.4 CASOS BORDE Y MANEJO

### Entrada completamente vacía
```json
{
  "type": "note",
  "description": "[entrada vacía]",
  "amount": null,
  "currency": null,
  "paid_by": null,
  "beneficiaries": null,
  "split_rule": null,
  "category": null,
  "notes": null,
  "pending_reasons": ["falta_monto", "item_ambiguo"],
  "confidence": 0.0,
  "is_note_only": true,
  "items": null
}
```

### Múltiples gastos en una sola entrada
**Input:** `"Taxi 20, comida 35, souvenirs 18, pagué yo"`

Vozpe detecta que hay múltiples gastos y los separa:
```json
{
  "type": "expense",
  "description": "Múltiples gastos",
  "amount": 73,
  "currency": "USD",
  "paid_by": "me",
  "beneficiaries": "all",
  "split_rule": "equal",
  "notes": "Incluye: taxi $20, comida $35, souvenirs $18",
  "pending_reasons": [],
  "confidence": 0.79,
  "is_note_only": false,
  "items": [
    { "description": "Taxi", "quantity": 1, "unit_price": 20, "confidence": 0.97 },
    { "description": "Comida", "quantity": 1, "unit_price": 35, "confidence": 0.97 },
    { "description": "Souvenirs", "quantity": 1, "unit_price": 18, "confidence": 0.95 }
  ]
}
```

### Miembro mencionado que no existe en el grupo
**Input:** `"cena 60 pagó Roberto para todos"`

Roberto no es miembro del grupo:
```json
{
  ...
  "paid_by": "Roberto",
  "pending_reasons": ["falta_pagador"],
  "notes": "Posible pagador: Roberto (no en el grupo)",
  "confidence": 0.70
}
```
→ El cliente muestra: "¿Quién es Roberto? Selecciona un miembro o crea uno nuevo."

### Moneda ambigua con varios posibles valores
**Input:** `"uber 45"`
Grupo tiene miembros de Perú y Chile:
```json
{
  "amount": 45,
  "currency": null,
  "pending_reasons": ["falta_moneda"],
  "confidence": 0.75
}
```
→ El cliente pregunta: "¿En qué moneda fue el Uber? USD · PEN · CLP"

---

## 6.5 ESTRATEGIA DE CACHÉ Y OPTIMIZACIÓN

### Para reducir latencia y costo:

1. **Cache determinístico**: Entradas con < 8 palabras se procesan localmente sin IA
2. **Dedup de prompts**: Si la entrada es igual a una reciente, reusar el resultado
3. **Claude Haiku**: Usar el modelo más pequeño para parsing (velocidad + costo)
4. **Timeout agresivo**: Si el LLM tarda > 2 segundos, guardar como pendiente y mostrar feedback
5. **Fallback local**: Si hay error de red, guardar en cola offline y procesar cuando haya conexión
6. **Streaming opcional**: Para voz, mostrar la transcripción en tiempo real y pre-parsear mientras termina

### Costos estimados (Claude Haiku):
- Input tokens por entrada: ~300 tokens (system prompt) + ~50 (input)
- Output tokens por entrada: ~150 tokens
- Total: ~500 tokens = ~$0.00025 por entrada
- A 10,000 entradas/mes: ~$2.50 de costo de IA

---

## 6.6 VALIDACIÓN POST-PARSING

```typescript
// packages/shared/src/parsers/validate-parsed.ts

import type { ParsedEntry } from '../types';

export function validateParsedEntry(
  parsed: Partial<ParsedEntry>,
  context: { members: { id: string; name: string }[]; baseCurrency: string }
): { valid: Partial<ParsedEntry>; additionalPendingReasons: string[] } {
  const additionalReasons: string[] = [];

  // Verificar que el miembro pagador existe
  if (parsed.paidBy && parsed.paidBy !== 'me') {
    const memberExists = context.members.some(
      m => m.name.toLowerCase().includes(parsed.paidBy!.toLowerCase())
    );
    if (!memberExists) {
      additionalReasons.push('falta_pagador');
    }
  }

  // Verificar que los beneficiarios existen
  if (Array.isArray(parsed.beneficiaries)) {
    const invalidMembers = parsed.beneficiaries.filter(
      name => name !== 'me' && !context.members.some(
        m => m.name.toLowerCase().includes(name.toLowerCase())
      )
    );
    if (invalidMembers.length > 0) {
      additionalReasons.push('reparto_no_definido');
    }
  }

  // Verificar monto razonable
  if (parsed.amount !== null && parsed.amount !== undefined) {
    if (parsed.amount < 0) {
      // Convertir negativos a discount
      return {
        valid: { ...parsed, type: 'discount', amount: Math.abs(parsed.amount) },
        additionalPendingReasons: additionalReasons,
      };
    }
    if (parsed.amount > 100_000) {
      additionalReasons.push('item_ambiguo'); // Monto sospechoso
    }
  }

  return {
    valid: parsed,
    additionalPendingReasons: additionalReasons,
  };
}
```
