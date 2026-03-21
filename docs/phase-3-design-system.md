# VOZPE — Fase 3: Design System y Dirección Visual Premium

---

## 3.1 FILOSOFÍA VISUAL

### Principios

**1. Claridad sin ruido**
Cada elemento en pantalla tiene un propósito. No hay decoración vacía. La información es la estética.

**2. Profundidad como jerarquía**
Usamos elevación, blur y transparencia para comunicar jerarquía, no colores llamativos.

**3. Motion con propósito**
Las animaciones comunican estado, no entretienen. Cada transición explica qué está pasando.

**4. Dark mode como primera clase**
No es un modo alternativo. Es la experiencia principal. Diseñado desde el oscuro hacia el claro.

**5. Densidad inteligente**
La sheet necesita densidad. El onboarding necesita espacio. Adaptamos la densidad al contexto.

---

## 3.2 PALETA DE COLORES

### Base — Dark Mode (Default)

```
Background Layers:
─────────────────────────────────────────
bg-base:        #0A0A0F   → Fondo raíz (casi negro con tinte azul)
bg-surface:     #111118   → Superficies primarias (cards, sheets)
bg-elevated:    #1A1A26   → Elementos elevados (modals, overlays)
bg-input:       #1E1E2E   → Campos de entrada
bg-hover:       #252538   → Estados hover
bg-selected:    #2A2A45   → Selección y highlight

Borders:
─────────────────────────────────────────
border-subtle:  #1E1E2E   → Separadores suaves
border-default: #2A2A45   → Bordes estándar
border-strong:  #3A3A5C   → Bordes de énfasis

Text:
─────────────────────────────────────────
text-primary:   #F0F0FF   → Texto principal (casi blanco, tinte lila)
text-secondary: #9090B8   → Texto secundario
text-tertiary:  #5A5A80   → Texto deshabilitado / placeholder
text-inverse:   #0A0A0F   → Texto sobre fondos claros
```

### Accent — El Azul Vozpe

```
Vozpe Blue (primario):
─────────────────────────────────────────
vozpe-50:        #EEF2FF
vozpe-100:       #E0E7FF
vozpe-200:       #C7D2FE
vozpe-300:       #A5B4FC
vozpe-400:       #818CF8
vozpe-500:       #6366F1   → Brand primary (indigo-500)
vozpe-600:       #4F46E5   → Hover
vozpe-700:       #4338CA   → Active/pressed
vozpe-800:       #3730A3
vozpe-900:       #312E81

Uso:
→ vozpe-500: CTAs principales, links, íconos activos
→ vozpe-400: Borders de inputs activos, chips seleccionados
→ vozpe-600: Botones en hover
→ vozpe-300: Decorativo, glows, halos
```

### Semánticos — Estados y Categorías

```
Success (verde):
success-subtle:  #0D2818
success-muted:   #16A34A30
success-base:    #22C55E
success-strong:  #4ADE80
Uso: Entradas confirmadas, saldos positivos

Warning (naranja):
warning-subtle:  #2D1A00
warning-muted:   #EA580C30
warning-base:    #F97316
warning-strong:  #FB923C
Uso: Pendientes, entradas incompletas

Error (rojo):
error-subtle:    #2D0A0A
error-muted:     #DC262630
error-base:      #EF4444
error-strong:    #F87171
Uso: Errores, saldos deudores

Info (azul claro):
info-subtle:     #0A1A2D
info-muted:      #3B82F630
info-base:       #60A5FA
info-strong:     #93C5FD
Uso: Notificaciones informativas

AI / Magic (violeta):
ai-subtle:       #1A0D2D
ai-muted:        #8B5CF630
ai-base:         #A78BFA
ai-strong:       #C4B5FD
Uso: Todo lo relacionado con IA, parsing, sugerencias
```

### Categorías de Gastos (con color)

```
🚗 Transporte:   #60A5FA (blue-400)
🍽 Comida:       #FB923C (orange-400)
🏨 Alojamiento:  #A78BFA (violet-400)
🛒 Compras:      #4ADE80 (green-400)
🎉 Entretenimto: #F472B6 (pink-400)
✈️ Viaje:        #38BDF8 (sky-400)
💊 Salud:        #34D399 (emerald-400)
⚡ Servicios:    #FACC15 (yellow-400)
📦 Otros:        #94A3B8 (slate-400)
```

### Light Mode (secundario)

```
bg-base:        #FAFAFA
bg-surface:     #FFFFFF
bg-elevated:    #F4F4F8
bg-input:       #F0F0F5
border-subtle:  #E8E8F0
border-default: #D4D4E8
text-primary:   #0A0A1A
text-secondary: #4A4A6A
text-tertiary:  #9090B0
```

---

## 3.3 TIPOGRAFÍA

### Familias

```
Display / Headlines:
  Fuente: "Inter" Variable (weight 300–900)
  Fallback: "SF Pro Display", "Segoe UI", system-ui
  Uso: Títulos grandes, taglines, totales

Body / UI:
  Fuente: "Inter" Variable (weight 400–600)
  Uso: Todo el UI, labels, inputs, datos

Monospace / Datos:
  Fuente: "JetBrains Mono" Variable
  Uso: Montos en tabla, timestamps, IDs, código
```

### Escala Tipográfica

```
Scale: T-shirt sizing system

display-2xl:  56px / 64px lh / -1.5% ls / weight 700
display-xl:   48px / 56px lh / -1.2% ls / weight 700
display-lg:   40px / 48px lh / -1.0% ls / weight 600
display-md:   32px / 40px lh / -0.8% ls / weight 600
display-sm:   24px / 32px lh / -0.5% ls / weight 600

heading-xl:   20px / 28px lh / -0.3% ls / weight 600
heading-lg:   18px / 26px lh / -0.2% ls / weight 600
heading-md:   16px / 24px lh / -0.1% ls / weight 600
heading-sm:   14px / 20px lh /  0.0% ls / weight 600

body-xl:      18px / 28px lh / weight 400
body-lg:      16px / 24px lh / weight 400
body-md:      14px / 20px lh / weight 400 (default)
body-sm:      12px / 18px lh / weight 400
body-xs:      11px / 16px lh / weight 400

label-lg:     14px / 20px lh / weight 500
label-md:     12px / 16px lh / weight 500
label-sm:     11px / 14px lh / weight 500 / tracking +0.05em

mono-lg:      14px / 20px lh / JetBrains Mono / weight 500
mono-md:      12px / 18px lh / JetBrains Mono / weight 400
mono-sm:      11px / 16px lh / JetBrains Mono / weight 400
```

### Uso Contextual

| Contexto | Tamaño | Peso | Familia |
|----------|--------|------|---------|
| Total del grupo | display-xl | 700 | Inter |
| Nombre del grupo | heading-xl | 600 | Inter |
| Descripción en sheet | body-md | 400 | Inter |
| Montos en tabla | mono-md | 500 | JetBrains Mono |
| Timestamps | body-xs | 400 | Inter |
| Labels de estado | label-sm | 500 | Inter |
| Totales en balance | display-lg | 700 | Inter + Mono |

---

## 3.4 ESPACIADO Y GRID

### Sistema Base

```
Base unit: 4px

Spacing scale:
space-0:   0
space-1:   4px
space-2:   8px
space-3:   12px
space-4:   16px
space-5:   20px
space-6:   24px
space-8:   32px
space-10:  40px
space-12:  48px
space-16:  64px
space-20:  80px
space-24:  96px
```

### Grid

```
Mobile (375px base):
  Columns: 4
  Gutter: 16px
  Margin: 16px

Mobile Large (428px):
  Columns: 4
  Gutter: 16px
  Margin: 20px

Tablet (768px):
  Columns: 8
  Gutter: 24px
  Margin: 32px

Desktop (1280px):
  Columns: 12
  Gutter: 24px
  Margin: 48px
  Max content: 1200px
```

### Safe Areas y Zonas

```
Mobile:
  Status bar: 44–54px (dependiendo del dispositivo)
  Bottom safe area: 34px (iPhone con notch)
  Tab bar height: 49px + safe area
  Header height: 56px

Sheet row height:
  Compact: 40px
  Default: 48px
  Expanded: 64px (con detalle)
```

---

## 3.5 ELEVACIÓN Y BLUR

### Sistema de Capas

```
Layer 0 — Fondo base:          z-index 0
Layer 1 — Superficies:         z-index 10  (cards, rows)
Layer 2 — Sticky elements:     z-index 20  (header, tab bar)
Layer 3 — Overlay suaves:      z-index 30  (tooltips, popovers)
Layer 4 — Modals/sheets:       z-index 40  (bottom sheets, modals)
Layer 5 — Composer activo:     z-index 50  (al expandir)
Layer 6 — Sistema:             z-index 60  (toasts, notif)
```

### Elevaciones con Blur

```
shadow-xs:    0 1px 2px rgba(0,0,0,0.4)
shadow-sm:    0 2px 8px rgba(0,0,0,0.5)
shadow-md:    0 4px 16px rgba(0,0,0,0.6)
shadow-lg:    0 8px 32px rgba(0,0,0,0.7)
shadow-xl:    0 16px 64px rgba(0,0,0,0.8)

Glow effects (accent):
glow-vozpe:    0 0 20px rgba(99,102,241,0.3)
glow-ai:      0 0 24px rgba(167,139,250,0.25)
glow-success: 0 0 16px rgba(74,222,128,0.2)

Blur backgrounds (glassmorphism):
blur-sm:      backdrop-filter: blur(8px)  + bg rgba(10,10,15,0.7)
blur-md:      backdrop-filter: blur(16px) + bg rgba(10,10,15,0.8)
blur-lg:      backdrop-filter: blur(24px) + bg rgba(10,10,15,0.85)
```

---

## 3.6 BORDER RADIUS

```
radius-none:  0
radius-sm:    4px    → inputs, badges pequeños
radius-md:    8px    → cards pequeñas, chips
radius-lg:    12px   → cards estándar, composer
radius-xl:    16px   → bottom sheets, modals
radius-2xl:   24px   → modals grandes, cards hero
radius-full:  9999px → avatares, indicadores, pills
```

---

## 3.7 ICONOGRAFÍA

### Sistema de Íconos

Librería base: **Lucide Icons** (open source, coherente, limpio)
Complemento: íconos custom para categorías y estados especiales

```
Tamaños estándar:
icon-xs:  12px  → indicadores, badges inline
icon-sm:  16px  → UI de alta densidad (sheet)
icon-md:  20px  → uso general (default)
icon-lg:  24px  → acciones principales, tab bar
icon-xl:  32px  → estados vacíos, hero sections
icon-2xl: 48px  → onboarding, ilustraciones
```

### Íconos Principales de Vozpe

| Función | Ícono Lucide | Notas |
|---------|-------------|-------|
| Voz | `Mic` | Animado al grabar |
| Foto/Cámara | `Camera` | |
| Texto | `PenLine` | |
| IA/Magic | `Sparkles` | Violeta |
| Timeline | `Activity` | |
| Sheet | `Table2` | |
| Balance | `Scale` | |
| Pendiente | `AlertCircle` | Naranja |
| Confirmado | `CheckCircle2` | Verde |
| Agregar | `Plus` | En FAB circular |
| Exportar | `Download` | |
| Cierre del día | `Sun` → `Moon` | |
| Grupo | `Users` | |
| Miembro | `User` | |
| Moneda | `DollarSign` | |
| Categoría | Variable por tipo | |

---

## 3.8 COMPONENTES BASE

### Button System

```tsx
// Variantes
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ai'

// Tamaños
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Anatomía visual:

Primary (filled):
  Background: vozpe-500
  Text: white
  Hover: vozpe-600
  Active: vozpe-700 + scale(0.97)
  Disabled: opacity 40%
  Border-radius: radius-lg (12px)
  Padding: 12px 20px (md)
  Font: label-md weight 600

Secondary (outlined):
  Background: transparent
  Border: 1px border-default
  Text: text-primary
  Hover: bg-hover
  Active: bg-selected

Ghost:
  Background: transparent
  Text: text-secondary
  Hover: bg-hover, text: text-primary

Danger:
  Background: error-base (rojo)
  Text: white

AI / Magic:
  Background: gradient(ai-muted → ai-subtle)
  Border: 1px ai-base
  Text: ai-strong
  Prefix: <Sparkles icon />
  Glow: glow-ai
```

### Input System

```
Anatomía:
┌────────────────────────────────────────┐
│ Label (label-sm, text-secondary)       │
│ ┌──────────────────────────────────┐   │
│ │ [icon?]  Placeholder o valor     │   │
│ └──────────────────────────────────┘   │
│ Helper text o error (body-xs)          │
└────────────────────────────────────────┘

Estados:
Default:  border-default, bg-input
Focus:    border: vozpe-400, glow: glow-vozpe (sutil), label flota arriba
Error:    border: error-base, helper: error-base
Success:  border: success-base
Disabled: opacity 50%, no interacción

Tipos custom:
- MoneyInput: prefijo de moneda, mono font, alineado a la derecha
- VoiceInput: waveform, transcripción live, botón parar
- PersonInput: chips con avatares, búsqueda live
- CurrencySelect: flag + código + nombre
```

### Card System

```
Anatomía de Card de Entrada (Timeline):
┌──────────────────────────────────────────┐
│ [avatar] Caleb · 14:32              [🎤] │ ← header (blur)
│──────────────────────────────────────────│
│ 🚗 Taxi aeropuerto                       │ ← descripción
│ $40.00 USD · ÷4 · Pagó: Caleb          │ ← monto y reparto
│ [Transporte] [Confirmado ✓]              │ ← chips de categoría y estado
└──────────────────────────────────────────┘

Padding: 16px
Border-radius: radius-lg (12px)
Background: bg-surface
Border: 1px border-subtle
Shadow: shadow-sm

States:
Default: como arriba
Hover: bg-hover, border-default
Pressed: scale(0.98), shadow-xs
Pending: border-left: 3px warning-base
Selected: bg-selected, border: vozpe-400
```

### Chip / Badge System

```
Estado chips:
[Confirmado ✓]   → bg: success-muted, text: success-strong, border: success-base
[Pendiente ⚠]   → bg: warning-muted, text: warning-strong, border: warning-base
[Error ✗]        → bg: error-muted, text: error-strong, border: error-base
[Draft]          → bg: bg-elevated, text: text-secondary

Categoría chips:
[🚗 Transporte]  → color del emoji + bg del color de categoría al 15%
[🍽 Comida]      → etc.

Tamaños:
sm: 6px 10px, radius-full, label-sm
md: 8px 12px, radius-full, label-md (default)
lg: 10px 16px, radius-md, label-md
```

### Avatar System

```
Tamaños:
xs:  24px — en timeline, chips de grupo
sm:  32px — lista de participantes
md:  40px — perfil, cards de persona
lg:  56px — header de grupo
xl:  80px — perfil propio

Generación de colores por nombre:
Cada usuario tiene un color único generado de su nombre (hash → hue).
Ejemplo: "Caleb" → indigo, "Diego" → emerald, "Ana" → rose

Avatar con presencia:
[C] + punto verde (8px, border 2px bg-surface) = online
[C] + punto gris = offline/ausente
[C] + animación pulsante = escribiendo/grabando
```

### Sheet Row (componente crítico)

```
Anatomía de fila en Sheet:
┌─────┬────────────────────┬──────────┬──────────┬───────┐
│  #  │ Descripción        │  Monto   │  Pagó    │Estado │
├─────┼────────────────────┼──────────┼──────────┼───────┤
│ 01  │ 🚗 Taxi            │ $40.00   │ [C]Caleb │  ✓   │
│     │ Transporte         │ USD      │          │       │
└─────┴────────────────────┴──────────┴──────────┴───────┘

Altura: 48px (default) / 40px (compact) / 64px (expanded)
Font descripción: body-md Inter
Font monto: mono-md JetBrains Mono
Separador: 1px border-subtle

Pending row:
- Borde izquierdo naranja: 3px warning-base
- Background: warning-subtle
- Ícono ⚠ en columna de estado

Editing row:
- Background: bg-selected
- Border: vozpe-400 en la celda activa
- Input inline visible
```

### Bottom Sheet (Modal mobile)

```
Anatomía:
━━━━━━━━━━━━ [drag handle] ━━━━━━━━━━━━
│                                       │
│  [CONTENIDO]                          │
│                                       │
└───────────────────────────────────────┘

Background: bg-elevated
Border-radius top: radius-2xl (24px)
Blur de fondo: blur-lg
Drag handle: 36px x 4px, bg-hover, centered
Animación: spring(stiffness 300, damping 30)

Variantes:
- Compact: ocupa 40% de pantalla
- Half: ocupa 60%
- Full: ocupa 90% (deixa espacio para cerrar)
- Snap points: puede hacer snap a diferentes alturas
```

### Toast / Feedback System

```
Position: top-center (debajo del status bar)
Duration: 3 segundos default

Success toast:
[✓ Entrada agregada · Taxi $40]
bg: success-subtle, border: success-base

Warning toast:
[⚠ Guardado como pendiente]
bg: warning-subtle, border: warning-base

AI toast:
[✦ Vozpe procesó 3 ítems del ticket]
bg: ai-subtle, border: ai-base

Error toast:
[✗ No se pudo guardar]
bg: error-subtle, border: error-base

Animación: slide-down + fade, dismiss: slide-up + fade
```

---

## 3.9 MOTION DESIGN

### Principios de Animación

```
1. NATURAL — Basada en física (spring, ease-out)
2. RÁPIDA — Duración corta (150–400ms)
3. PROPOSITIVA — Cada animación explica algo
4. NO INTRUSIVA — No interrumpe el flujo
```

### Duraciones

```
instant:    0ms   → feedback sin animación (hover)
ultra-fast: 100ms → micro-feedback (press)
fast:       150ms → aparición de elementos pequeños
normal:     250ms → transiciones estándar
medium:     350ms → modals, bottom sheets
slow:       500ms → onboarding, estados grandes
dramatic:   800ms → cierre del día, momentos wow
```

### Easings

```
ease-standard:    cubic-bezier(0.4, 0, 0.2, 1)  → movimiento general
ease-decelerate:  cubic-bezier(0, 0, 0.2, 1)    → entrar a pantalla
ease-accelerate:  cubic-bezier(0.4, 0, 1, 1)    → salir de pantalla
ease-spring:      spring(stiffness: 300, damping: 30) → elementos rebotantes
ease-bounce:      spring(stiffness: 400, damping: 15) → confirmaciones
```

### Microinteracciones Específicas

**Al confirmar una entrada:**
```
1. Botón "Confirmar": scale(0.95) → 1.0 (spring)
2. Entry → aparece en Sheet con: slide-in-from-top + fade 250ms
3. Total en header: flip animation del número (slot machine) 300ms
4. Partícula de confetti tiny: 3-4 partículas, duration 600ms
5. Toast: "✓ Taxi $40 agregado"
```

**Al grabar voz:**
```
1. Botón mic: scale(1.2) + glow pulsante (vozpe-300) loop
2. Waveform: amplitud reacciona al volumen real (AudioContext)
3. Transcripción: palabras aparecen con fade-in gradual
4. Al terminar: onda colapsa hacia centro → preview aparece
```

**Al procesar OCR:**
```
1. Foto: scale down a miniatura (top-right)
2. Spinner AI: sparkles girando suavemente
3. Barras de progreso: 0% → 100% con ease-decelerate
4. Líneas del ticket: aparecen una a una (stagger 50ms)
5. Total "suma" visualmente con count-up
```

**Al resolver un pendiente:**
```
1. Card de pendiente: fondo naranja → fondo verde (transition 300ms)
2. Ícono ⚠ → ✓ con flip 3D
3. Badge counter -1 con bounce
4. Toast: "✓ Pendiente resuelto"
```

**Cierre del día:**
```
1. Transición: pantalla "fade to dark" completo 500ms
2. Números se cuentan desde 0 (count-up, ease-out, 800ms)
3. Barras de categorías: slide-in desde izquierda con stagger 100ms
4. Saldos: aparecen con escala desde 0 (spring, bounce)
5. Confetti sutil si todo está resuelto
```

**Sheet — nueva fila:**
```
1. Fila nueva: altura 0 → 48px (expand) + fade-in 200ms
2. Celdas: opacity 0 → 1 con stagger 30ms por columna
3. Total del pie: actualiza con flip animation
```

**Presencia de colaboradores:**
```
Avatar: outline pulsante (glow-vozpe) cuando otro user está activo
Cursor de colaborador: aparece con fade en la celda que edita
```

---

## 3.10 ESTADOS VACÍOS

Cada estado vacío debe ser memorable y útil, no genérico.

### Empty — Grupo sin entradas

```
Visual: Ilustración minimal dark
  → Partículas flotando (tickets, recibos, notas)
  → En el centro: "+" con halo azul

Copy:
  Título: "Tu grupo está listo"
  Subtítulo: "Habla, toma foto o escribe lo primero
              que gastaron. Vozpe lo ordena solo."

CTAs:
  [🎤 Di algo]  →  abre modo voz
  [📷 Toma foto]  →  abre cámara
```

### Empty — Sheet sin resultados (con filtro activo)

```
Visual: Lupa con estrellitas

Copy:
  Título: "Nada aquí con ese filtro"
  Subtítulo: "Prueba con otro filtro o quita el actual"

CTA: [Quitar filtros]
```

### Empty — Sin pendientes

```
Visual: Checkmark con glow verde

Copy:
  Título: "¡Todo al día!"
  Subtítulo: "Todas las entradas están completas.
              Buen trabajo."
```

### Empty — Balance sin liquidaciones

```
Visual: Scale en equilibrio

Copy:
  Título: "Todo en orden"
  Subtítulo: "Nadie debe nada. El grupo está saldado."
```

### Empty — Timeline

(coincide con el de grupo sin entradas)

### Empty — Sin grupos

```
Visual: Ilustración de personas conectadas por líneas punteadas

Copy:
  Título: "Tu primer grupo te espera"
  Subtítulo: "Crea uno para organizar un viaje,
              compras, eventos o lo que necesites."

CTA: [Crear grupo]
```

---

## 3.11 COMPONENTES CUSTOM ESPECIALES

### Composer Multimodal

```
El componente más importante de Vozpe. Siempre visible.

Anatomía (collapsed):
┌───────────────────────────────────────────┐
│ [🎤] [📷] [✏]    [ + Agregar entrada ] │
└───────────────────────────────────────────┘
height: 56px, blur-md, sticky bottom

Anatomía (expanded — voz):
─────────────────────────────────────────────
  ●● REC  0:03
  ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈  (waveform)
  "taxi cuarenta dólares..."
  [■ Parar]               [✗]
─────────────────────────────────────────────
height: 200px, blur-lg, z-50

Anatomía (parsing preview):
─────────────────────────────────────────────
  ✦ Vozpe interpreta:
  ┌──────────────────────────────────┐
  │ 🚗 Taxi · $40 · USD · ÷4       │
  │ Pagó: Caleb · Transporte        │
  └──────────────────────────────────┘
  [✓ Confirmar]  [✏ Editar]  [↩ Reintentar]
─────────────────────────────────────────────
```

### Sheet Component

Requisitos técnicos del componente:
- Virtualización de filas (solo renderiza filas visibles)
- Scroll horizontal y vertical independientes
- Headers de columna fijos (sticky)
- Edición inline sin modal
- Multi-select con Shift+tap o long-press
- Swipe actions por fila
- Drag para reordenar (opcional V2)
- Freeze de columnas (primera columna fija en scroll horizontal)

### Waveform Visualizer

```
Durante grabación de voz:
- Barras verticales (30–40 barras)
- Altura de cada barra reacciona al audio en tiempo real (AudioContext API)
- Colores: vozpe-400 → vozpe-300 de izquierda a derecha
- Barras no activas: text-tertiary
- Animación idle: suave oscilación cuando no hay sonido
```

### Currency Display

```
Monto principal:   $1,240.50
                   font: display-lg, JetBrains Mono, weight 700, text-primary

Moneda:            USD
                   font: label-sm, weight 500, text-secondary, uppercase

Monto secundario:  S/4,641.87 (si hay segunda moneda)
                   font: body-sm, JetBrains Mono, text-tertiary

Saldo positivo: text-color → success-strong
Saldo negativo: text-color → error-strong
Saldo neutro:   text-color → text-primary
```

### AI Indicator

```
Siempre que la IA esté trabajando o haya sugerido algo:

Inline badge: [✦ IA] con ai-base color y sparkle icon
Processing: spinner con sparkles girando
Suggestion card: border-left 3px ai-base, bg ai-subtle, text ai-strong
```

---

## 3.12 DIRECCIÓN VISUAL PREMIUM — GUIDELINES

### Lo que Vozpe ES visualmente

- Fondos muy oscuros con profundidad sutil (casi negros con tinte azulado)
- Blur y glassmorphism con moderación y propósito
- Tipografía Inter con peso que varía para crear jerarquía clara
- Montos en JetBrains Mono para legibilidad y carácter técnico-premium
- Color azul-indigo como acento único primario
- Categorías con emojis como acento colorido sobre dark
- Animaciones spring que se sienten físicas y naturales
- Borders ultra-sutiles que definen sin gritar
- Spacing generoso fuera de la sheet, denso dentro de ella

### Lo que Vozpe NO ES visualmente

- No es una app de colores múltiples sin jerarquía
- No tiene fondos claros llenos de cards blancas
- No tiene gradientes arcoíris
- No tiene bordes gruesos o sombras duras
- No usa iconos de línea fina estilo "outline básico"
- No tiene tipografía a tamaño único sin jerarquía
- No tiene animaciones de "rebotar" innecesariamente
- No tiene botones pill de colores diferentes en cada pantalla

### Tokens de Identidad (para comunicar la marca)

```
Logo: "vozpe" — minúsculas, Inter weight 700
      Punto luminoso sobre la "i" (como una estrella/pixel)

Color primario de marca: Indigo (#6366F1)
Personalidad visual: preciso, oscuro, inteligente, cálido
Sensación: "Excel si fuera diseñado por Linear y Notion"
```
