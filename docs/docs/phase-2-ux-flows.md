# VOZPE — Fase 2: Flujo UX Completo y Descripción Detallada de Pantallas

---

## PRINCIPIOS UX DE VOZPE

- **Zero friction first** — Cualquier entrada debe poder completarse en menos de 5 segundos
- **La tabla es la verdad** — Siempre hay una ruta directa a la sheet
- **Contexto persistente** — El compositor multimodal está siempre accesible
- **Progressive disclosure** — Los detalles aparecen cuando se necesitan, no antes
- **Feedback inmediato** — Cada acción tiene respuesta visual instantánea
- **Offline-first** — La app funciona sin red; sincroniza cuando puede

---

## PANTALLA 01 — SPLASH / ONBOARDING

### Objetivo
Crear impacto emocional en los primeros 10 segundos. Comunicar el diferenciador de forma visual y visceral antes de pedir ningún dato.

### Estructura Visual
```
┌─────────────────────────────────────────┐
│                                         │
│         [VOZPE logotipo]                 │
│                                         │
│    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━       │
│    Animación hero (3-4 segundos):       │
│                                         │
│    1. Notas caóticas flotando           │
│       (WhatsApp, papel, tickets)        │
│    2. Voz → onda sonora azul            │
│    3. Foto → flash → OCR en vivo        │
│    4. Todo converge → tabla viva 🔥     │
│    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━       │
│                                         │
│  "Habla, toma foto o escribe…"         │
│  "y todo se ordena solo."               │
│                                         │
│  [Empezar gratis]  [Ya tengo cuenta]   │
│                                         │
│  ── o continúa con ──                  │
│  [G Google]  [ Apple]                  │
│                                         │
└─────────────────────────────────────────┘
```

### Componentes Clave
- **Hero animation**: Lottie o Reanimated 2. Partículas caóticas → ordenamiento → tabla. Duración ~3s. Loop suave.
- **Logotipo**: Aparece con fade desde el centro
- **Tagline**: Dos líneas, tipografía display grande, aparece después de la animación
- **CTAs**: Primario lleno + Secundario ghost. Apple Sign In sobre fondo dark.

### Microinteracciones
- Al tocar "Empezar gratis": botón se comprime, onda de presión, transición slide-up
- Skip disponible desde segundo 2 (indicador sutil de swipe up)

### Estado Vacío
N/A — es pantalla de entrada

### Mobile vs Web
- Mobile: pantalla completa, botones full-width en bottom
- Web: split layout — animación a la izquierda, auth form a la derecha

---

## PANTALLA 02 — LOGIN / SIGNUP

### Objetivo
Acceso rápido sin fricción. Prioridad: Google/Apple OAuth. Email como fallback.

### Estructura Visual
```
┌─────────────────────────────────────────┐
│  ← [back]           [vozpe]              │
│                                         │
│  Bienvenido a Vozpe                      │
│  Tu workspace colaborativo              │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  G  Continuar con Google        │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │   Continuar con Apple          │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ─────────── o con correo ───────────  │
│                                         │
│  tu@correo.com                          │
│  [Continuar →]                          │
│                                         │
│  Al continuar aceptas los Términos      │
│  y Política de Privacidad de Vozpe       │
│                                         │
└─────────────────────────────────────────┘
```

### Flujo de Email
1. Usuario ingresa email → `[Continuar]`
2. Si existe cuenta: solicita contraseña o envía magic link
3. Si es nuevo: crea cuenta, va a onboarding de caso de uso
4. Magic link: email con botón → deep link abre app → sesión activa

### Microinteracciones
- Input email: animación de label flotante al enfocar
- Botón OAuth: scale press + ripple en touch
- Error: shake horizontal del campo + mensaje rojo bajo el input

### Estados de Error
- Email inválido: `"Ese correo no parece válido"`
- Red offline: `"Sin conexión. Intenta más tarde."`
- Error OAuth: `"Algo salió mal. Intenta con otro método."`

---

## PANTALLA 03 — SELECCIÓN DE CASO DE USO

### Objetivo
Personalizar el primer grupo y el tono de la app según el contexto del usuario. Solo se muestra en el primer uso.

### Estructura Visual
```
┌─────────────────────────────────────────┐
│                                         │
│  ¿Para qué vas a usar Vozpe hoy?        │
│  Puedes cambiar esto después            │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │  ✈️      │  │  🏠      │            │
│  │  Viaje   │  │ Casa /   │            │
│  │          │  │ Roomies  │            │
│  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐            │
│  │  🎉      │  │  🛒      │            │
│  │  Evento  │  │ Compras  │            │
│  │          │  │          │            │
│  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐            │
│  │  💼      │  │  🔧      │            │
│  │ Trabajo  │  │ Materiales│           │
│  │          │  │          │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  [Otro — escribir tipo]                 │
│                                         │
│  [Crear mi primer grupo →]             │
│                                         │
└─────────────────────────────────────────┘
```

### Comportamiento
- Selección single-tap, toggle visual (borde iluminado + checkmark)
- Se puede seleccionar uno solo
- El tipo seleccionado pre-configura el primer grupo
- "Otro" abre un input libre

### Microinteracciones
- Card seleccionada: border glow del color de acento + scale up ligero
- CTA aparece con slide-up solo cuando hay selección

---

## PANTALLA 04 — CREAR GRUPO

### Objetivo
Permitir crear un grupo de forma rápida (< 30 segundos) o detallada. El flujo rápido es el default.

### Estructura Visual — Flujo Rápido
```
┌─────────────────────────────────────────┐
│  Crear grupo                     [✕]    │
│                                         │
│  [cover emoji / foto] ⬅️ toca para      │
│                           cambiar       │
│                                         │
│  Nombre del grupo                       │
│  ┌─────────────────────────────────┐    │
│  │ Ej: Viaje a Chile…              │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Tipo: [Viaje ▾]                        │
│                                         │
│  Moneda base: [USD ▾]                   │
│                                         │
│  Participantes                          │
│  ┌─────────────────────────────────┐    │
│  │ Buscar contactos o escribir…    │    │
│  └─────────────────────────────────┘    │
│  [Caleb] [Diego] [Luis] [+ agregar]    │
│                                         │
│  [Crear grupo →]                        │
│                                         │
│  ─── o crea con voz ───                │
│  🎤 "Crea grupo viaje a Chile…"        │
│                                         │
└─────────────────────────────────────────┘
```

### Crear por Voz
```
Usuario toca [🎤 Crear por voz]
    │
    ▼
Overlay de grabación: onda sonora animada
    │
    ▼
Habla: "Crea grupo Viaje a Chile con Caleb, Diego y Luis"
    │
    ▼
Transcripción en tiempo real (debajo de la onda)
    │
    ▼
Parser extrae:
  nombre: "Viaje a Chile"
  tipo: "viaje" (inferido)
  participantes: ["Caleb", "Diego", "Luis"]
    │
    ▼
Preview del grupo creado:
  "¿Creamos este grupo?"
  [✔ Confirmar]  [✏ Editar]
```

### Sección Avanzada (expandible)
- Monedas secundarias
- Reglas de reparto por defecto
- País / timezone
- Modo offline
- Permisos de edición

### Microinteracciones
- Cover: toca → picker de emojis o cámara. Selección con bounce-in
- Participantes: chips animados que aparecen con spring al añadir
- CTA: se habilita al completar nombre + mínimo 0 participantes

---

## PANTALLA 05 — INVITACIÓN DE PARTICIPANTES

### Objetivo
Máxima facilidad para sumar al grupo a las personas correctas.

### Estructura Visual
```
┌─────────────────────────────────────────┐
│  Invitar al grupo            [Listo]    │
│                                         │
│  [🔗 Copiar link del grupo]            │
│  [📱 QR del grupo]                     │
│                                         │
│  ── Buscar en contactos ──             │
│  ┌─────────────────────────────────┐    │
│  │ 🔍 Nombre o correo…             │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Contactos sugeridos                    │
│  ┌──────────────────────────────────┐   │
│  │ [A] Ana García          [Agregar]│   │
│  │ [D] Diego López         [Agregar]│   │
│  │ [L] Luis Martínez       [Agregar]│   │
│  └──────────────────────────────────┘   │
│                                         │
│  Ya en el grupo (2)                     │
│  [C Caleb ✓] [D Diego ✓]              │
│                                         │
│  ── Compartir enlace ──                │
│  [WhatsApp] [Copiar] [Más]             │
│                                         │
└─────────────────────────────────────────┘
```

### Link de Invitación
- URL única con token de 6 días de vida
- Al abrir: preview del grupo → aceptar → join automático
- Si no tiene app: landing page → descargar o usar web

---

## PANTALLA 06 — HOME DEL GRUPO ⭐ (PANTALLA PROTAGONISTA)

### Objetivo
Centro operativo del grupo. Todo sucede aquí: ver, capturar, revisar, colaborar.

### Estructura Visual
```
┌─────────────────────────────────────────┐
│ ← Grupos    Viaje a Chile    [···] [🔔] │
│─────────────────────────────────────────│
│ ✈️  Viaje a Chile                       │
│     Caleb, Diego, Luis, Ana (+1)        │
│                                         │
│  💰 Total: $1,240.50 USD               │
│  📅 Día 3 de 7  ·  4 pendientes ⚠      │
│─────────────────────────────────────────│
│                                         │
│  ╔═══════════════════════════════════╗  │
│  ║  [🎤 Habla]  [📷 Foto]  [✏️ texto]║  │
│  ║                                   ║  │
│  ║  ┌──────────────────────────────┐ ║  │
│  ║  │ Ej: "taxi 20 entre 4"…       │ ║  │
│  ║  └──────────────────────────────┘ ║  │
│  ║  [+ Agregar entrada]              ║  │
│  ╚═══════════════════════════════════╝  │
│                                         │
│─────────────────────────────────────────│
│  [Timeline]     [Sheet ✦]   [Balance]  │
│─────────────────────────────────────────│
│                                         │
│  [CONTENIDO DEL TAB ACTIVO]            │
│                                         │
└─────────────────────────────────────────┘
```

### Cabecera Dinámica
- **Fija en scroll** con blur effect (glassmorphism) cuando hay contenido debajo
- Cover del grupo como imagen de fondo con overlay gradiente
- Chips de participantes: avatares circulares pequeños con iniciales de color
- Total del grupo en grande, moneda secundaria en pequeño debajo
- Estado del día (día N de viaje, o fecha) + badge de pendientes

### Composer Multimodal — Zona Central
El compositor es el corazón de la experiencia. Siempre visible, nunca colapsado.

```
Estado default:
┌─────────────────────────────────────────┐
│  [🎤]  [📷]  [⌨️]          [+ Agregar] │
│  ┌──────────────────────────────────┐   │
│  │ ¿Qué pasó? Habla, foto o escribe │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘

Estado grabando voz:
┌─────────────────────────────────────────┐
│  ●REC  ━━━━━━━━━━━━━━━━━━  0:03        │
│  ~~Transcripción en vivo aquí~~        │
│  [● Parar]                [✗ Cancelar] │
└─────────────────────────────────────────┘

Estado procesando:
┌─────────────────────────────────────────┐
│  ✦ Procesando…                          │
│  Taxi · $40 · USD · pagó Caleb · ÷4   │
│  [✓ Confirmar]  [✏ Editar]  [✗]       │
└─────────────────────────────────────────┘
```

### Tab Bar del Grupo
Tres vistas principales:
1. **Timeline** — actividad cronológica
2. **Sheet ✦** — spreadsheet viva (default y favorita)
3. **Balance** — saldos y liquidación

### Microinteracciones
- Nuevo gasto confirmado: fila aparece en la sheet con slide-in desde el compositor + partícula de confirmación
- Pendiente creado: badge +1 con bounce en header
- Participante activo: indicador de presencia en avatar (punto verde animado)
- Total se actualiza: flip animation del número

### Estado Vacío (grupo recién creado)
```
┌─────────────────────────────────────────┐
│                                         │
│     🌟                                  │
│                                         │
│  Tu grupo está listo                    │
│  ¡Empieza a registrar!                 │
│                                         │
│  Habla, toma una foto o escribe         │
│  lo que gastaron. Nosotros              │
│  organizamos todo.                      │
│                                         │
│  [🎤 Di algo]  [📷 Toma foto]          │
│                                         │
└─────────────────────────────────────────┘
```

---

## PANTALLA 07 — COMPOSITOR MULTIMODAL (EXPANDIDO)

### Objetivo
El modo de captura activo. Se expande sobre el home al activar cualquier entrada.

### A. MODO VOZ

```
┌─────────────────────────────────────────┐
│                        [✕ Cancelar]     │
│                                         │
│         ●  GRABANDO                     │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  ~~~~~~~~~~~~~~~~~~~~~~~~       │   │
│   │    onda sonora animada          │   │
│   │  ~~~~~~~~~~~~~~~~~~~~~~~~       │   │
│   └─────────────────────────────────┘   │
│                                         │
│  "taxi cuarenta dólares pa-…"           │
│   (transcripción en tiempo real)        │
│                                         │
│         [⬛ Terminar grabación]         │
│                                         │
│  Sugerencias rápidas:                  │
│  [Taxi] [Comida] [Hotel] [Uber]        │
│                                         │
└─────────────────────────────────────────┘
```

**Post-grabación — Preview de parsing:**
```
┌─────────────────────────────────────────┐
│  ✦ Vozpe interpretó esto                │
│─────────────────────────────────────────│
│  Descripción:  Taxi              [✏]   │
│  Monto:        $ 40.00           [✏]   │
│  Moneda:       USD               [✏]   │
│  Pagó:         Caleb             [✏]   │
│  Para:         Todos (÷4)        [✏]   │
│  Categoría:    🚗 Transporte     [✏]   │
│─────────────────────────────────────────│
│  [✓ Confirmar y agregar]               │
│  [✏ Editar antes]                      │
│  [↩ Regrabar]                          │
└─────────────────────────────────────────┘
```

### B. MODO FOTO / OCR

```
┌─────────────────────────────────────────┐
│  [✕]        Escanear                    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │      [VISOR DE CÁMARA]          │    │
│  │                                 │    │
│  │  ┌─────────────────────┐        │    │
│  │  │  guía de ticket     │        │    │
│  │  └─────────────────────┘        │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Galería]   [📸 Capturar]   [Flash]   │
│                                         │
│  Soporta: tickets, listas, cuadernos   │
│                                         │
└─────────────────────────────────────────┘
```

**Post-foto — OCR en proceso:**
```
┌─────────────────────────────────────────┐
│  ✦ Analizando imagen…                  │
│                                         │
│  [imagen miniatura]                    │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━  78%         │
│  Extrayendo texto · Interpretando…     │
│                                         │
└─────────────────────────────────────────┘
```

**Post-OCR — Preview editable de ticket:**
```
┌─────────────────────────────────────────┐
│  Ticket · Supermercado Wong    [📷 ver] │
│─────────────────────────────────────────│
│  ┌─────────────────────────────────┐    │
│  │ ☑  Agua mineral    x2  $ 3.00   │    │
│  │ ☑  Pan integral        $ 4.50   │    │
│  │ ☑  Yogurt          x3  $ 7.80   │    │
│  │ ☐  [?] Ítem 4 borroso   ---     │    │ ← pendiente
│  └─────────────────────────────────┘    │
│  Total detectado: $15.30               │
│  Total ticket:    $15.30  ✓            │
│─────────────────────────────────────────│
│  Pagó: [Seleccionar ▾]                 │
│  Para: [Todos ▾]                       │
│─────────────────────────────────────────│
│  [Agregar todo]  [Seleccionar ítems]   │
└─────────────────────────────────────────┘
```

### C. MODO TEXTO RÁPIDO

```
┌─────────────────────────────────────────┐
│  Escribe rápido                 [✕]     │
│─────────────────────────────────────────│
│  ┌─────────────────────────────────┐    │
│  │ uber 22 dividido entre 3        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─ Parsing en vivo ──────────────┐    │
│  │ 🚗 Uber · $22 · ÷3            │    │
│  └────────────────────────────────┘    │
│                                         │
│  Tips de formato:                       │
│  "taxi 20 entre 4"                     │
│  "snacks 12 usd yo"                    │
│  "agua 3 x 2.5 todos"                  │
│                                         │
│  Historial rápido:                     │
│  [↩ Taxi $40] [↩ Snacks $12]          │
│                                         │
│  [Agregar →]                            │
└─────────────────────────────────────────┘
```

**Parsing en vivo mientras escribe:**
- Debajo del input, aparece una preview chip que se actualiza en tiempo real
- Verde cuando el parser tiene confianza alta
- Amarillo cuando falta información
- El usuario ve el resultado antes de confirmar

---

## PANTALLA 08 — TIMELINE

### Objetivo
Mostrar la actividad del grupo como narrativa visual viva. Útil para entender qué pasó, cuándo y quién lo registró.

### Estructura Visual
```
┌─────────────────────────────────────────┐
│  Timeline · Viaje a Chile               │
│                                         │
│  ── Hoy, Día 3 ─────────────────────   │
│                                         │
│  ○ 14:32  Caleb                        │
│  │  🎤 "Taxi al aeropuerto"            │
│  │  ┌────────────────────────────┐     │
│  │  │ 🚗 Taxi · $40 · ÷4        │     │
│  │  │ Confirmado ✓               │     │
│  │  └────────────────────────────┘     │
│                                         │
│  ○ 14:45  Ana                          │
│  │  📷 Foto de ticket                  │
│  │  ┌────────────────────────────┐     │
│  │  │ 🛒 Supermercado · $32.50   │     │
│  │  │ 4 ítems · Ana pagó         │     │
│  │  └────────────────────────────┘     │
│                                         │
│  ○ 15:10  Sistema / IA                 │
│  │  ✦ 2 entradas procesadas            │
│  │  📊 Total del día va por $156.30   │
│                                         │
│  ○ 15:30  Diego                        │
│  │  ⌨️ "almuerzo 80 pagó Luis todos"  │
│  │  ┌────────────────────────────┐     │
│  │  │ 🍽 Almuerzo · $80 · ÷4    │     │
│  │  │ Pagó: Luis                 │     │
│  │  └────────────────────────────┘     │
│                                         │
│  ── Ayer, Día 2 ── [Expandir] ─────    │
│                                         │
└─────────────────────────────────────────┘
```

### Tipos de Eventos en Timeline

| Tipo | Icono | Color |
|------|-------|-------|
| Entrada por voz | 🎤 | Azul |
| Entrada por foto/OCR | 📷 | Morado |
| Entrada por texto | ⌨️ | Verde |
| Nota | 📝 | Amarillo |
| Pendiente creado | ⚠️ | Naranja |
| Pendiente resuelto | ✅ | Verde |
| Cierre del día | 📊 | Blanco |
| Sugerencia IA | ✦ | Índigo |
| Miembro unido | 👤 | Gris |

### Microinteracciones
- Pull-to-refresh: onda de actualización suave
- Card nueva: slide-in desde top con spring
- Card tocada: expand con blur del background
- Filtro por día: swipe horizontal entre días

---

## PANTALLA 09 — SHEET VIVA / SPREADSHEET ⭐

### Objetivo
El corazón de la verdad. Todos los datos en una tabla hermosa, editable y poderosa. La experiencia debe sentirse como un Google Sheets de alta gama, pero diseñada para móvil y para este contexto.

### Estructura Visual
```
┌─────────────────────────────────────────┐
│  Sheet · Viaje a Chile   [⊞ Columnas]  │
│  [🔍 Filtrar] [⬇ Grupo] [+ Nueva fila]│
│─────────────────────────────────────────│
│                                         │
│  ┌────┬──────────────┬──────┬──────────┐│
│  │ #  │ Descripción  │Monto │  Pagó    ││
│  ├────┼──────────────┼──────┼──────────┤│
│  │ 01 │🚗 Taxi aer.. │$40.00│ Caleb   ││
│  │ 02 │🛒 Supermerc. │$32.50│ Ana     ││
│  │ 03 │🍽 Almuerzo   │$80.00│ Luis    ││
│  │ ⚠4 │🎤 mercado 80 │$80.00│ ?       ││  ← pendiente
│  │ 05 │🏨 Hotel noche│$240.0│ Diego   ││
│  └────┴──────────────┴──────┴──────────┘│
│                                         │
│  [← →] Desliza para ver más columnas   │
│                                         │
│  ─────────────────────────────────────  │
│  Total: $472.50         [Ver balance]  │
│                                         │
└─────────────────────────────────────────┘
```

### Columnas Disponibles (configurables)

| Columna | Tipo | Default visible |
|---------|------|----------------|
| # | Número | ✓ |
| Descripción | Texto | ✓ |
| Categoría | Chip | ✓ |
| Cantidad | Número | ○ |
| Precio unitario | Moneda | ○ |
| Subtotal | Moneda calculado | ✓ |
| Moneda | Chip | ○ |
| Pagó | Persona | ✓ |
| Beneficiarios | Personas | ○ |
| Tipo de reparto | Chip | ○ |
| Fecha/hora | Timestamp | ○ |
| Origen | Icono | ○ |
| Estado | Chip | ✓ |
| Notas | Texto | ○ |

### Edición Inline
- **Tap en celda** → entra en modo edición directa
- Input aparece en la celda, sin modal
- `Enter` o tap fuera → confirma
- `Escape` → cancela
- Cambio se sincroniza en tiempo real a todos los participantes

### Agrupación y Filtros
```
Agrupar por: [Día ▾] [Categoría ▾] [Persona ▾]
Filtrar: [Solo pendientes] [Solo confirmados] [Mis entradas]
```

### Row States (colores de fila)
```
Confirmada:   fondo normal, sin indicador especial
Pendiente:    borde izquierdo naranja + ícono ⚠
Draft:        texto en gris, opacidad reducida
Archivada:    tachada y opaca
Seleccionada: fondo highlight azul suave
```

### Acciones Rápidas en Fila
- **Swipe izquierda**: Editar | Archivar
- **Swipe derecha**: Resolver pendiente | Copiar
- **Long press**: Selección múltiple → acciones en batch
- **Tap**: Expande el detalle bajo la fila (inline accordion)

### Detalle Expandido Inline
```
┌─────────────────────────────────────────┐
│ 03 🍽 Almuerzo         $80.00           │
│────────────────────────────────────────  │
│ ▼ DETALLE                               │
│   Pagó: Luis                            │
│   Beneficiarios: Todos (÷4 = $20c/u)   │
│   Categoría: Comida                     │
│   Origen: ⌨️ Texto · 15:30             │
│   Fecha: Lunes 18 Mar                  │
│   [Editar completo]  [Archivar]        │
└─────────────────────────────────────────┘
```

### Pie de Tabla
```
Total (15 entradas): $472.50
Subtotal confirmado: $392.50
Subtotal pendiente:  $80.00 ⚠
```

### Estado Vacío de Sheet
```
┌─────────────────────────────────────────┐
│                                         │
│         📋                             │
│                                         │
│  La hoja está vacía                     │
│                                         │
│  Cada entrada que agregues aparecerá   │
│  aquí como una fila editable.           │
│                                         │
│  [+ Agregar primera entrada]           │
│                                         │
└─────────────────────────────────────────┘
```

---

## PANTALLA 10 — PENDIENTES INTELIGENTES

### Objetivo
Resolver el caos pendiente sin interrumpir el flujo. No punir al usuario por registrar rápido e incompleto.

### Estructura Visual
```
┌─────────────────────────────────────────┐
│  Pendientes              4 por resolver │
│                                         │
│  ✦ Vozpe te ayuda a completarlos        │
│                                         │
│  ── FALTA QUIÉN PAGÓ ─────────────     │
│  ┌──────────────────────────────────┐   │
│  │ ⚠ "mercado 80"                   │   │
│  │ Falta: quién pagó y moneda       │   │
│  │                                  │   │
│  │ [Yo pagué]  [Seleccionar ▾]     │   │
│  │ [Moneda: USD] [PEN] [Otra]      │   │
│  │                               ✓ │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ── OCR INCIERTO ─────────────────     │
│  ┌──────────────────────────────────┐   │
│  │ 📷 Ticket foto · Ítem borroso    │   │
│  │ "Ítem 4: ??? $8.90"              │   │
│  │                                  │   │
│  │ [Editar descripción]             │   │
│  │ [Ignorar este ítem]              │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ── POSIBLE DUPLICADO ────────────     │
│  ┌──────────────────────────────────┐   │
│  │ 🔄 "Taxi $40" parece igual a     │   │
│  │ "Taxi aeropuerto $40" del día 1  │   │
│  │                                  │   │
│  │ [Son diferentes] [Fusionar]      │   │
│  └──────────────────────────────────┘   │
│                                         │
│  [Resolver todo con IA ✦]              │
│                                         │
└─────────────────────────────────────────┘
```

### Tipos de Pendiente y Resolución

| Tipo | Causa | Resolución sugerida |
|------|-------|---------------------|
| `falta_pagador` | No se identificó quién pagó | Selector de participante |
| `falta_moneda` | Monto sin moneda | Botones de moneda rápida |
| `falta_monto` | Descripción sin número | Input de monto |
| `ocr_dudoso` | Texto poco legible | Ver foto + editar |
| `posible_duplicado` | Entrada similar ya existe | Fusionar o mantener |
| `ticket_mixto` | Ticket con ítems de diferentes personas | Asignación por ítem |
| `reparto_no_definido` | No se especificó cómo dividir | Selector de reparto |
| `item_ambiguo` | Descripción poco clara | Input libre |

---

## PANTALLA 11 — DETALLE DE ENTRADA / EDICIÓN

### Objetivo
Ver y editar todos los campos de una entrada. Historial de cambios. Resolver pendientes. Adjuntos.

### Estructura Visual
```
┌─────────────────────────────────────────┐
│  ←   Detalle de entrada         [···]  │
│─────────────────────────────────────────│
│                                         │
│  🍽 Almuerzo Restaurante               │
│  Confirmado ✓ · Lunes 18 Mar · 13:45  │
│                                         │
│  ─ Monto ─────────────────────────    │
│  $80.00 USD                            │
│                                         │
│  ─ Pagó ───────────────────────────    │
│  [L] Luis Martínez                     │
│                                         │
│  ─ Beneficiarios y reparto ──────────  │
│  Todos los miembros · División igual   │
│  Caleb $20 · Diego $20 · Luis $20 · Ana $20│
│                                         │
│  ─ Categoría ──────────────────────    │
│  🍽 Comida                             │
│                                         │
│  ─ Origen ─────────────────────────    │
│  ⌨️ Texto: "almuerzo 80 pagó luis todos"│
│                                         │
│  ─ Notas ──────────────────────────    │
│  [Sin notas. Toca para agregar]        │
│                                         │
│  ─ Adjuntos ───────────────────────    │
│  [+ Agregar foto o archivo]            │
│                                         │
│  ─ Historial ──────────────────────    │
│  18 Mar 13:45 · Diego creó la entrada  │
│  18 Mar 14:02 · Caleb confirmó         │
│                                         │
│  [Editar]          [Archivar]          │
│                                         │
└─────────────────────────────────────────┘
```

---

## PANTALLA 12 — RESOLVER TICKET OCR

### Objetivo
Edición guiada del resultado de OCR. El usuario puede confirmar, editar o ignorar cada línea del ticket.

### Estructura Visual
```
┌─────────────────────────────────────────┐
│  ← Ticket · Supermercado     [📷 ver]  │
│─────────────────────────────────────────│
│  Total detectado: $47.30               │
│  Confianza OCR: Alta ✓                 │
│─────────────────────────────────────────│
│                                         │
│  Línea por línea:                       │
│                                         │
│  ☑ Agua mineral x2    $6.00    [para ▾]│
│  ☑ Pan integral       $4.50    [para ▾]│
│  ☑ Yogurt natural x3  $8.40    [para ▾]│
│  ☑ Leche entera       $3.90    [para ▾]│
│  ☐ ??? borroso        $8.90    [✏ editar]│
│  ☑ Gaseosa x2         $5.60    [para ▾]│
│  ─────────────────────────────────      │
│  Subtotal selec.: $28.40               │
│                                         │
│  Dividir todo entre: [Todos ▾]         │
│  Pagó: [Seleccionar ▾]                 │
│                                         │
│  [✓ Agregar seleccionados (5)]         │
│  [Agregar como un solo gasto]          │
│                                         │
└─────────────────────────────────────────┘
```

---

## PANTALLA 13 — CIERRE DEL DÍA ⭐

### Objetivo
Crear un momento memorable al final del día. Resumen visual potente. El equivalente al "recap" de Spotify Wrapped pero diario.

### Estructura Visual — Diseño Editorial
```
┌─────────────────────────────────────────┐
│                                         │
│  📊 CIERRE DEL DÍA                     │
│  Lunes 18 de Marzo · Día 3 de viaje    │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Total del día                          │
│  $247.50 USD                            │
│  ↑ $47 más que ayer                     │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Saldos al cierre de hoy               │
│  ┌──────┬─────────────────────────┐     │
│  │  C   │ Caleb     +$18.50 ✓   │     │
│  │  D   │ Diego     -$32.00 ⬇   │     │
│  │  L   │ Luis      +$61.25 ✓   │     │
│  │  A   │ Ana       -$47.75 ⬇   │     │
│  └──────┴─────────────────────────┘     │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  🔥 Lo más destacado de hoy             │
│  Hotel $240 · Almuerzo $80 · Taxi $40  │
│                                         │
│  Categorías del día:                    │
│  🏨 Alojamiento 49%                     │
│  🍽 Comida 28%                         │
│  🚗 Transporte 16%                     │
│  🛒 Compras 7%                         │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ✦ Insight de Vozpe                     │
│  "Diego y Ana tienen saldo negativo.   │
│  Sugerimos que mañana paguen ellos."   │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  4 pendientes sin resolver ⚠           │
│  [Resolver ahora] [Dejar para mañana]  │
│                                         │
│  [📤 Compartir resumen]                │
│  [📊 Exportar Excel del día]           │
│  [✓ Cerrar este día]                   │
│                                         │
└─────────────────────────────────────────┘
```

### Imagen Compartible (generada)
Formato story (9:16):
```
┌─────────────────────────────────────────┐
│  ✈️ Viaje a Chile · Día 3              │
│                                         │
│  Total: $247.50                        │
│                                         │
│  🏨 49%  🍽 28%  🚗 16%  🛒 7%       │
│                                         │
│  4 personas · 12 entradas              │
│                                         │
│  Registrado con Vozpe ✦                 │
└─────────────────────────────────────────┘
```

### Microinteracciones
- Números de saldo aparecen con count-up animation
- Categorías: barras animadas de izquierda a derecha
- Insight de IA: aparece con fade después de 1 segundo
- "Cerrar este día": confirmación con confetti sutil

---

## PANTALLA 14 — BALANCE FINAL

### Objetivo
Vista definitiva de quién debe a quién. Liquidación clara y exportable.

### Estructura Visual
```
┌─────────────────────────────────────────┐
│  Balance Final · Viaje a Chile          │
│  7 días · 23 entradas · 4 personas     │
│─────────────────────────────────────────│
│                                         │
│  Total del viaje: $1,847.50 USD        │
│  Por persona promedio: $461.88         │
│                                         │
│  ─ Saldos netos ──────────────────    │
│  [C] Caleb     +$112.50  acreedor ✓   │
│  [D] Diego     +$  45.00  acreedor ✓   │
│  [L] Luis      -$ 82.50  debe ⬇       │
│  [A] Ana       -$ 75.00  debe ⬇       │
│                                         │
│  ─ Liquidación sugerida ──────────    │
│  ┌────────────────────────────────┐    │
│  │ Luis → Caleb     $82.50       │    │
│  │ Ana  → Caleb     $75.00       │    │
│  └────────────────────────────────┘    │
│  2 transferencias y queda todo saldo.  │
│                                         │
│  ─ Por categoría ──────────────────   │
│  🏨 Alojamiento:  $860.00  46%        │
│  🍽 Comida:       $540.00  29%        │
│  🚗 Transporte:   $320.00  17%        │
│  🛒 Otros:        $127.50   7%        │
│                                         │
│  ─ Exportar ───────────────────────   │
│  [📊 Excel]  [📄 PDF]  [🖼 Imagen]    │
│                                         │
│  [Cerrar grupo]  [Duplicar plantilla]  │
│                                         │
└─────────────────────────────────────────┘
```

---

## PANTALLA 15 — EXPORTAR / COMPARTIR

### Objetivo
Exportar y compartir los datos del grupo en los formatos más útiles.

### Estructura Visual
```
┌─────────────────────────────────────────┐
│  ← Exportar                            │
│                                         │
│  Viaje a Chile · 7 días                │
│                                         │
│  ── Formatos ─────────────────────     │
│  ┌──────────────────────────────────┐   │
│  │ 📊 Excel (.xlsx)                 │   │
│  │ Hoja completa, saldos, resumen   │   │
│  │ [Exportar]  [Preview]            │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │ 📄 PDF                           │   │
│  │ Resumen visual del grupo         │   │
│  │ [Exportar]  [Preview]            │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │ 🖼 Imagen resumen                │   │
│  │ Para WhatsApp o redes sociales   │   │
│  │ [Generar]  [Compartir]           │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ── Incluir ──────────────────────     │
│  ☑ Todas las entradas                  │
│  ☑ Saldos por persona                  │
│  ☑ Liquidación sugerida                │
│  ☐ Historial de cambios                │
│  ☐ Entradas archivadas                 │
│                                         │
│  ── Período ──────────────────────     │
│  [Todo el grupo] [Solo día actual]     │
│  [Rango personalizado]                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## PANTALLA 16 — PERFIL / PREFERENCIAS

### Objetivo
Configuración personal del usuario sin overwhelm. Limpia y directa.

### Estructura Visual
```
┌─────────────────────────────────────────┐
│                           [···]         │
│                                         │
│  [C] Caleb Rodríguez                   │
│  caleb@email.com                        │
│                                         │
│  ─ Preferencias ───────────────────    │
│  Moneda por defecto     [USD ▾]        │
│  Idioma                 [Español ▾]    │
│  Timezone               [Lima UTC-5 ▾] │
│  Tema                   [Dark ●] [Light]│
│                                         │
│  ─ Notificaciones ─────────────────    │
│  Nuevas entradas al grupo    [ON ●]    │
│  Pendientes sin resolver     [ON ●]    │
│  Resumen diario              [OFF ○]   │
│  Solicitudes de liquidación  [ON ●]    │
│                                         │
│  ─ Mis grupos ─────────────────────    │
│  Viaje a Chile             ✈️  Activo  │
│  Casa Miraflores           🏠  Activo  │
│  Cumpleaños Ana            🎉  Cerrado │
│                                         │
│  ─ Cuenta ─────────────────────────   │
│  Plan: Gratuito   [Ver planes]         │
│  [Cerrar sesión]                       │
│                                         │
└─────────────────────────────────────────┘
```

---

## PANTALLA 17 — MODO OFFLINE / SINCRONIZACIÓN

### Objetivo
El usuario debe sentir que la app funciona aunque no haya internet. La sincronización es invisible y confiable.

### Estados de Conexión

**Banner de offline (aparece en top, no intrusivo):**
```
┌─────────────────────────────────────────┐
│  📡 Sin conexión · 3 entradas en cola  │
└─────────────────────────────────────────┘
```

**Al recuperar conexión:**
```
┌─────────────────────────────────────────┐
│  ✓ Sincronizado · 3 entradas enviadas  │
└─────────────────────────────────────────┘
(desaparece en 2 segundos)
```

### Comportamiento Offline
- Captura por texto y voz guarda localmente (MMKV / WatermelonDB)
- Fotos se guardan en cola para upload
- Sheet local se mantiene con los datos cacheados
- Al reconectar: merge automático con resolución de conflictos
- Conflictos: "Caleb también editó esta entrada. ¿Cuál versión usar?"

---

## PANTALLA 18 — NOTIFICACIONES

### Objetivo
Notificaciones útiles, no spam. Cada una debe ser accionable.

### Tipos de Notificación

```
Push notifications:
──────────────────────────────────────────
🟢 Nueva entrada
   "Diego agregó Taxi $25 al grupo Viaje Chile"
   [Ver]

⚠️ Pendiente urgente
   "3 entradas esperan tu revisión"
   [Resolver]

💰 Solicitud de liquidación
   "Luis te debe $82.50. ¿Ya te pagó?"
   [Marcar pagado] [Ver detalles]

📊 Resumen del día
   "Día 3 cerrado: $247.50 en 12 entradas"
   [Ver resumen]

👤 Nuevo miembro
   "Ana se unió al grupo Viaje Chile"
   [Ver grupo]
```

---

## PANTALLA 19 — HISTORIAL / AUDIT TRAIL LIGERO

### Objetivo
El usuario puede ver qué cambió, cuándo y quién lo hizo. Ligero, no abrumador.

### Estructura Visual (dentro del detalle de entrada)
```
Historial de cambios:
──────────────────────────────────────────
18 Mar 15:45 · Diego
  Creó: "almuerzo 80 pagó luis todos"
  Origen: texto rápido

18 Mar 16:02 · Caleb
  Editó descripción: "Almuerzo" → "Almuerzo Restaurante"
  Editó categoría: sin categoría → Comida

18 Mar 16:10 · Sistema
  Moneda confirmada: USD (por defecto del grupo)
```

### Historial del Grupo
Vista de auditoria completa accesible desde Settings del grupo.

---

## PANTALLA 20 — PLANTILLAS (V5)

### Objetivo
Permite duplicar configuraciones de grupo para reutilizar en contextos recurrentes.

### Flujo Básico
```
Al cerrar un grupo:
"¿Guardar como plantilla?"
  Nombre: "Viaje de amigos"
  Se guarda: tipo, monedas, reglas de reparto, categorías

Al crear nuevo grupo:
"¿Usar una plantilla?"
  [Viaje de amigos]  [Casa/Roomies]  [Caja chica]
  → Pre-configura el grupo nuevo
```

---

## FLUJO COMPLETO — STORYBOARD

```
USUARIO NUEVO:
Splash → Login → Selección caso de uso → Crear grupo (manual o voz)
→ Invitar participantes → Home del grupo (vacío)
→ Primera captura (voz/foto/texto) → Parsing → Confirmación
→ Fila en Sheet → Timeline se actualiza → Balance live

DURANTE EL DÍA (uso recurrente):
Home → Composer → Captura rápida (< 5 segundos)
→ Entry aparece en sheet → Pendiente si faltan datos

FIN DEL DÍA:
Notificación "¿Cierras el día?" → Cierre del día
→ Resumen visual → Resolver pendientes → Compartir resumen

FIN DEL VIAJE/GRUPO:
Balance final → Liquidación → Export → Compartir
→ Cerrar grupo o Duplicar como plantilla
```
