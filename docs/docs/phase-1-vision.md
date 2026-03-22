# VOZPE — Fase 1: Visión del Producto, Diferenciador, Arquitectura y Navegación

---

## 1.1 VISIÓN DEL PRODUCTO

### Qué es Vozpe

Vozpe es un **workspace colaborativo de captura rápida** que transforma entradas caóticas —voz, foto, texto— en una tabla viva, editable, calculada y compartida en tiempo real.

No es un expense tracker.
No es una app contable.
No es un clon de Splitwise.

Vozpe es el **cuaderno operativo inteligente** para grupos: viajes, compras, eventos, trabajo, familia, roomies, encargos.

### Proposición de Valor Central

> **"Anota ahora, ordena después."**

El usuario no tiene que pensar en formularios. Habla, toma foto o escribe una línea. La app organiza, calcula y presenta los datos en una hoja viva. El caos se convierte en claridad, de forma casi mágica.

### El Sentimiento que Debe Transmitir

Vozpe debe sentirse como una mezcla entre:
- Un **smart notebook** que se organiza solo
- Un **collaboration workspace** tipo Notion pero para lo cotidiano
- Un **asistente operativo** que entiende lenguaje natural
- Una **spreadsheet moderna** que no asusta a nadie
- Un **fintech premium** que da claridad financiera sin ser contable
- Un **travel OS** que acompaña al grupo en tiempo real

---

## 1.2 EL PROBLEMA REAL

### Hoy el grupo usa esto:

| Herramienta | Problema |
|-------------|----------|
| WhatsApp | Mensajes perdidos, sin cálculos, sin estructura |
| Notas del celular | No es colaborativo, sin cálculo |
| Cuaderno físico | Se pierde, no comparte, no calcula |
| Calculadora | Solo suma, no guarda historia |
| Excel después | Requiere tiempo y disciplina que nadie tiene |
| Splitwise | Solo gastos, flujo rígido, formulario obligatorio |
| Memoria | El peor de todos |

### El momento del dolor:

Un grupo va de viaje. Alguien paga el taxi. Otro paga el hotel. Otro paga comida. Al final del día hay tickets perdidos, montos olvidados, discusiones, estimaciones. Nadie recuerda cuánto gastó quién. El Excel "lo hacemos después" nunca se hace.

**Vozpe resuelve esto en el momento, sin interrumpir el flujo.**

---

## 1.3 DIFERENCIADORES REALES

### D1 — Captura sin fricción absoluta
El compositor multimodal es el protagonista. Un toque al micrófono, una foto, un texto de una línea. No hay formularios. No hay pasos previos.

### D2 — Modo "Anota ahora, ordena después"
Si la entrada es ambigua o incompleta, no se bloquea el flujo. Se guarda en **Pendientes Inteligentes** para resolver luego, sin romper la sesión.

### D3 — Tabla viva tipo spreadsheet premium
Los datos no se esconden en listas de cards. Se presentan en una hoja editable, calculada, con agrupaciones, filtros, edición inline y recálculo en tiempo real. Hermosa y funcional.

### D4 — Timeline colaborativo vivo
Junto a la sheet, existe un timeline que muestra la actividad del grupo como una narrativa visual: quién agregó qué, cuándo procesó la IA, qué cambios hubo, cierres del día.

### D5 — IA operativa, no decorativa
La IA no es un chatbot. Es el motor de parsing: interpreta voz, texto natural, OCR de tickets. Extrae entidades, asigna categorías, detecta faltantes, sugiere repartos. Silenciosa pero esencial.

### D6 — Cierre del día con impacto visual
Al final del día, Vozpe presenta un resumen visual potente: totales, saldos, actividad del grupo, insights automáticos, pendientes resueltos. Como un "end-of-day brief" elegante.

### D7 — Grupos flexibles para cualquier contexto
No solo viajes. Roomies, cumpleaños, materiales de obra, caja chica, pedidos, compras familiares. Vozpe se adapta al contexto sin cambiar su ADN.

---

## 1.4 PRINCIPIOS DE PRODUCTO

1. **Velocidad sobre perfección** — Es mejor registrar algo incompleto que no registrar nada.
2. **La tabla es la verdad** — Todo fluye hacia la sheet. La sheet es el producto.
3. **La IA no molesta** — Procesa en silencio, sugiere cuando ayuda, no interrumpe el flujo.
4. **Colaborativo por defecto** — Incluso en modo personal, la arquitectura es multiusuario.
5. **Mobile-first siempre** — Diseñado para el teléfono en la mano, escalable a web para gestión.
6. **Dark mode premium** — La experiencia visual predeterminada es oscura, elegante y sin ruido.
7. **Sin burocracia** — Cero campos obligatorios innecesarios, cero formularios como flujo principal.

---

## 1.5 PERSONAS DE USUARIO

### Persona 1 — El Organizador del Grupo
- Viaja con amigos, coordina gastos y encargos
- Odia perder tiempo en Excel después del viaje
- Quiere claridad sin convertirse en el "contador del grupo"
- **Uso**: crea el grupo, agrega más entradas, cierra el día

### Persona 2 — El Participante Casual
- Se une por link, agrega su parte cuando puede
- No quiere aprender una app compleja
- Prefiere ver cuánto debe sin entrar a detalles
- **Uso**: ve el balance, agrega entradas rápidas, confirma saldos

### Persona 3 — El Power User Individual
- Usa Vozpe para su propia caja chica o compras
- Le gusta ver los datos en tabla, filtrar, exportar
- Valora la captura por voz para no interrumpir lo que hace
- **Uso**: uso diario, cierra el día, exporta a Excel

### Persona 4 — El Coordinador Operativo
- Maneja materiales de obra, pedidos, encargos de trabajo
- Necesita saber quién pidió qué, cuánto se debe, qué falta
- Quiere exportar y compartir reportes
- **Uso**: grupos de trabajo, modo negocio (V5)

---

## 1.6 ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                         VOZPE PLATFORM                           │
├─────────────────┬───────────────────────┬───────────────────────┤
│   MOBILE APP    │       WEB APP         │    ADMIN / FUTURE     │
│  React Native   │      Next.js 14       │      Next.js          │
│     + Expo      │   App Router + RSC    │                       │
└────────┬────────┴───────────┬───────────┴───────────────────────┘
         │                   │
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────┐
         │   API LAYER       │
         │  Supabase Edge    │
         │  Functions +      │
         │  PostgREST        │
         └─────────┬─────────┘
                   │
    ┌──────────────┼──────────────────────────┐
    │              │                          │
    ▼              ▼                          ▼
┌───────┐   ┌─────────────┐         ┌────────────────┐
│  DB   │   │  REALTIME   │         │  AI SERVICES   │
│Postgres│  │  Supabase   │         │                │
│       │   │  Channels   │         │ ┌────────────┐ │
│ RLS   │   │  + Presence │         │ │  Whisper   │ │
│ Policies  └─────────────┘         │ │ Speech→Text│ │
│       │                           │ └────────────┘ │
└───────┘                           │ ┌────────────┐ │
                                    │ │  Claude /  │ │
                                    │ │  GPT-4o    │ │
                                    │ │  Parser    │ │
                                    │ └────────────┘ │
                                    │ ┌────────────┐ │
                                    │ │  Google    │ │
                                    │ │  Vision    │ │
                                    │ │  OCR       │ │
                                    │ └────────────┘ │
                                    └────────────────┘
                                             │
                                    ┌────────▼───────┐
                                    │    STORAGE     │
                                    │ Supabase S3    │
                                    │ Fotos / Audio  │
                                    │ Attachments    │
                                    └────────────────┘
```

### Capas del Sistema

| Capa | Tecnología | Responsabilidad |
|------|-----------|-----------------|
| Mobile | React Native + Expo | App iOS/Android, captura multimodal, offline |
| Web | Next.js 14 (App Router) | Dashboard web, gestión avanzada de sheet |
| Auth | Supabase Auth + Clerk | JWT, OAuth Google/Apple, magic link |
| Database | PostgreSQL (Supabase) | Datos, RLS, Row Level Security |
| Realtime | Supabase Realtime | Presencia, cambios en vivo, colaboración |
| Storage | Supabase Storage | Fotos, audios, exports |
| Speech | OpenAI Whisper / deepgram | Transcripción de voz a texto |
| OCR | Google Vision API / ML Kit | Extracción de texto de fotos |
| Parser IA | Claude API + reglas | Interpretación de entradas naturales |
| Exports | ExcelJS + Puppeteer PDF | Exportación a XLSX y PDF |
| Analytics | PostHog | Eventos, funnels, feature flags |
| Monitoring | Sentry | Errores, performance |
| Sync offline | WatermelonDB / MMKV | Cache local y cola de sincronización |

---

## 1.7 MAPA DE NAVEGACIÓN

```
VOZPE — Navigation Map v1.0
═══════════════════════════════════════════════════════════════════

SPLASH / ONBOARDING
    └── Login / Signup
            └── Selección de caso de uso (primer uso)
                    └── HOME GLOBAL
                            ├── [+] Crear Grupo
                            │       ├── Configuración del Grupo
                            │       │       ├── Nombre + Tipo
                            │       │       ├── Moneda base
                            │       │       ├── Invitar participantes
                            │       │       └── → HOME DEL GRUPO
                            │       └── Crear por Voz
                            │               └── → HOME DEL GRUPO
                            │
                            ├── LISTA DE GRUPOS
                            │       └── → HOME DEL GRUPO [seleccionado]
                            │
                            └── PERFIL / SETTINGS GLOBALES
                                    ├── Cuenta y preferencias
                                    ├── Notificaciones
                                    └── Seguridad

HOME DEL GRUPO
    ├── COMPOSER MULTIMODAL [protagonista, siempre visible]
    │       ├── 🎤 Entrada por Voz
    │       │       └── → Transcripción → Parsing IA → Entry + feedback
    │       ├── 📷 Entrada por Foto
    │       │       └── → OCR → Preview editable → Entry o Pendiente
    │       └── ⌨️  Entrada por Texto
    │               └── → Parser rápido → Entry + feedback inline
    │
    ├── WORKSPACE DUAL [tab o split view]
    │       ├── TIMELINE
    │       │       ├── Actividad cronológica del grupo
    │       │       ├── Cards de entradas (gastos, notas, fotos, IA)
    │       │       ├── Marcadores de cierre diario
    │       │       └── Sugerencias de IA
    │       │
    │       └── SHEET VIVA
    │               ├── Tabla editable con todas las entradas
    │               ├── Columnas configurables
    │               ├── Filtros y agrupación
    │               ├── Edición inline
    │               └── → DETALLE DE ENTRADA
    │                       ├── Ver y editar todos los campos
    │                       ├── Adjuntos / foto original
    │                       ├── Historial de cambios
    │                       └── Resolver pendiente
    │
    ├── PENDIENTES INTELIGENTES [badge si hay pendientes]
    │       ├── Lista de entradas incompletas o ambiguas
    │       ├── Resolver por ítem
    │       └── → Detalle de entrada
    │
    ├── BALANCE
    │       ├── Total del grupo
    │       ├── Saldo por persona
    │       ├── Quién debe a quién
    │       └── Sugerencia de liquidación
    │
    ├── CIERRE DEL DÍA [acción contextual]
    │       ├── Resumen visual del día
    │       ├── Total + saldos del día
    │       ├── Insights automáticos
    │       ├── Pendientes del día
    │       └── Exportar / compartir
    │
    ├── CIERRE FINAL DEL GRUPO
    │       ├── Balance total definitivo
    │       ├── Liquidación final
    │       ├── Export Excel / PDF
    │       ├── Imagen resumen compartible
    │       └── Duplicar como plantilla
    │
    └── SETTINGS DEL GRUPO
            ├── Nombre, cover, tipo
            ├── Monedas
            ├── Participantes y permisos
            ├── Reglas de reparto por defecto
            └── Modo offline

PERFIL GLOBAL
    ├── Datos de cuenta
    ├── Preferencias de idioma y moneda
    ├── Notificaciones push
    └── Historial de grupos

═══════════════════════════════════════════════════════════════════
```

### Jerarquía de Navegación Mobile

```
Tab Bar (fija, bottom)
┌──────────────────────────────────────────────┐
│  Grupos   │   Actividad   │  [ + ]  │  Yo    │
└──────────────────────────────────────────────┘

Dentro de un Grupo:
┌──────────────────────────────────────────────┐
│  Timeline │    Sheet    │  Balance  │  ···   │
└──────────────────────────────────────────────┘

El Composer [+] es siempre el CTA protagonista,
accesible desde cualquier pantalla dentro del grupo.
```

---

## 1.8 FLUJO DE CAPTURA — HAPPY PATH

```
Usuario → Toca [🎤] → Habla "Taxi 40 dólares, pagué yo, entre 4"
    │
    ▼
Whisper transcribe: "Taxi 40 dólares, pagué yo, entre 4"
    │
    ▼
Parser IA extrae:
{
  tipo: "expense",
  descripción: "Taxi",
  monto: 40,
  moneda: "USD",
  pagó: "yo" → [usuario_actual],
  beneficiarios: "todos" → [4 miembros],
  reparto: "equal",
  categoría: "transporte"
}
    │
    ▼
Feedback visual: animación de entrada procesada + preview de fila
    │
    ▼
Fila aparece en Sheet VIVA + evento en Timeline
    │
    ▼
Recálculo automático de saldos, totales, balance
    │
    ▼
Notificación push a otros miembros (si está activo)
```

---

## 1.9 FLUJO MODO "ANOTA AHORA, ORDENA DESPUÉS"

```
Usuario → "mercado 80"
    │
    ▼
Parser detecta: monto=80, descripción="mercado"
Falta: moneda, pagó, beneficiarios
    │
    ▼
Entry guardada con estado: "pending_review"
    │
    ▼
Fila en Sheet con estado amarillo "⚠ Incompleta"
Badge en [Pendientes] +1
    │
    ▼
Usuario puede: ignorar por ahora → resolver después
    │
    ▼
[Pendientes] sugiere:
  → "¿Asignar a todos?"
  → "¿Moneda: USD o PEN?"
  → "¿Quién pagó?"
    │
    ▼
Un toque → resuelto → fila pasa a "confirmed" (verde)
```

---

## 1.10 POSICIONAMIENTO COMPETITIVO

| | Vozpe | Splitwise | Tricount | Excel | Notion |
|--|------|----------|---------|-------|--------|
| Captura por voz | ✅ | ❌ | ❌ | ❌ | ❌ |
| OCR de tickets | ✅ | Parcial | ❌ | ❌ | ❌ |
| Sheet viva | ✅ | ❌ | ❌ | ✅ | ✅ |
| Modo offline-first | ✅ | Parcial | ✅ | ✅ | Parcial |
| Anota ahora, ordena después | ✅ | ❌ | ❌ | ❌ | Parcial |
| Cierre del día | ✅ | ❌ | ❌ | ❌ | ❌ |
| IA operativa | ✅ | ❌ | ❌ | ❌ | ❌ |
| Grupos flexibles | ✅ | Limitado | ✅ | ✅ | ✅ |
| Mobile-first | ✅ | ✅ | ✅ | ❌ | Parcial |
| Experiencia premium | ✅ | ❌ | ❌ | ❌ | ✅ |
| Dark mode | ✅ | ❌ | ❌ | ✅ | ✅ |
