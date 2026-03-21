# VOZPE — Fase 7: Roadmap por Versiones y Estrategia MVP

---

## 7.1 ESTRATEGIA MVP (V1)

### ¿Qué es el MVP de Vozpe?

El MVP debe probar **una sola hipótesis core**:
> "Los usuarios prefieren capturar gastos por texto rápido o voz y verlos en una tabla viva, en lugar de llenar formularios."

El MVP no necesita IA avanzada. Necesita:
1. Captura de texto rápido que funcione bien
2. Una tabla viva hermosa y usable
3. Cálculo automático de saldos
4. Colaboración en tiempo real

### Criterios de éxito del MVP

| Métrica | Objetivo |
|---------|----------|
| Retención día 7 | > 40% |
| Entradas por sesión | > 3 |
| Tiempo de primera entrada | < 30 segundos |
| NPS | > 50 |
| Grupos con > 2 miembros | > 60% de grupos activos |
| Captura por voz/texto (vs manual) | > 70% de entradas |

---

## 7.2 V1 — MVP FUNCIONAL (Semanas 1-8)

### Alcance

**Incluye:**
- ✅ Auth con Google / Apple / Email
- ✅ Crear y configurar grupos
- ✅ Invitar participantes por link / QR
- ✅ Captura por texto rápido con parser local
- ✅ Captura por voz (Whisper) con parsing IA básico
- ✅ Timeline de actividad del grupo
- ✅ Sheet viva con columnas básicas (edición inline)
- ✅ Cálculos automáticos de totales y saldos
- ✅ Reparto igual entre todos (el 80% de los casos)
- ✅ Pendientes Inteligentes (bandeja de entradas incompletas)
- ✅ Balance por persona
- ✅ Cierre del día básico (resumen + totales)
- ✅ Exportación básica (share image)
- ✅ Modo offline-first con cola de sincronización
- ✅ Notificaciones push básicas
- ✅ Dark mode por defecto

**Excluye en V1:**
- ❌ OCR de tickets (V2)
- ❌ Múltiples monedas con conversión (V3)
- ❌ IA avanzada con sugerencias (V4)
- ❌ Export Excel/PDF (V2)
- ❌ Modo negocio (V5)
- ❌ Web app completa (V2 parcial)

### Stack V1

```
Mobile: React Native + Expo SDK 50
Navigation: Expo Router
State: Zustand + React Query
UI: Custom DS (NativeWind)
Animations: Reanimated 3 + Moti
Backend: Supabase (PG + Auth + Realtime + Storage)
Voice: OpenAI Whisper API
Parser: Claude Haiku + reglas locales
Offline: MMKV
```

### Milestones V1

```
Semana 1-2: Setup + Auth + Grupos básicos
  ├── Monorepo configurado
  ├── Auth flujo completo (Google, Apple, Email)
  ├── Crear/editar grupos
  └── Invitar por link

Semana 3-4: Captura + Parser
  ├── Composer multimodal (texto + voz)
  ├── Parser local determinístico
  ├── Parser IA (Claude Haiku)
  └── Pendientes Inteligentes

Semana 5-6: Sheet + Timeline
  ├── Sheet viva con edición inline
  ├── Cálculos de saldos en tiempo real
  ├── Timeline de actividad
  └── Realtime colaborativo

Semana 7: Cierre del día + Balance
  ├── Pantalla de cierre del día
  ├── Balance y liquidación
  └── Share image generada

Semana 8: Polish + Testing
  ├── Bug fixing
  ├── Performance
  ├── Test con usuarios beta
  └── Preparar TestFlight / Play Store beta
```

---

## 7.3 V2 — OCR + EXPORTS (Semanas 9-14)

### Nuevas funcionalidades

**OCR de Tickets:**
- 📷 Foto de ticket → extracción por líneas (Google Vision)
- Preview editable del ticket escaneado
- Selección de ítems a incluir / excluir
- Asignación individual por ítem
- Detección de impuestos y propinas
- OCR de notas manuscritas y listas
- Manejo de tickets borrosos (pendiente inteligente)

**Exports mejorados:**
- 📊 Export Excel (.xlsx) con ExcelJS
  - Hoja de entradas completas
  - Hoja de saldos y liquidación
  - Hoja de resumen por categoría y día
- 📄 Export PDF con diseño premium
- 🖼 Imagen resumen compartible mejorada (generada con Canvas)

**Web app básica:**
- Acceso web a grupos (Next.js)
- Sheet viva en web (TanStack Table virtual)
- Vistas de balance y exportación

**Mejoras V2:**
- Reparto por porcentaje y monto fijo
- Descuentos e impuestos en entradas
- Notas con formato básico en timeline
- Propinas
- Adjuntos manuales (fotos) a entradas existentes

---

## 7.4 V3 — MÚLTIPLES MONEDAS (Semanas 15-20)

### Nuevas funcionalidades

**Motor de múltiples monedas:**
- 💱 Definir moneda base del grupo + monedas secundarias
- Tipo de cambio automático (API externa)
- Tipo de cambio manual por grupo y por fecha
- Historial de conversiones
- Comparación monto original vs convertido en la sheet
- Edición manual de tipo de cambio por entrada

**Sheet mejorada:**
- Columnas de moneda original y monto en moneda base
- Filtros por moneda
- Agrupación por moneda
- Total en dos monedas simultáneas en el header

**Exports multimoneda:**
- Tabla de conversiones en el Excel
- Nota de tipo de cambio en el PDF

---

## 7.5 V4 — IA AVANZADA (Semanas 21-28)

### Nuevas funcionalidades

**IA operativa mejorada:**
- 🔍 Detección automática de duplicados (entrada similar ya existe)
- 🏷 Clasificación automática de categorías (aprendizaje por historial del grupo)
- 💡 Sugerencias contextuales ("¿Diego pagó el hotel? La última vez también lo hizo él")
- 📝 Resumen inteligente del día (narrative generada por IA)
- 🎯 Comandos más naturales ("agrega el mismo taxi de ayer")
- 🔮 Predicción de gastos ("similar a tu último viaje, estimado: $X")

**Parser mejorado:**
- Comandos de edición por voz ("edita la última entrada", "cambia el taxi a $45")
- Multi-entrada en un solo mensaje ("taxi 20, almuerzo 35, agua 5, pagué yo")
- Contexto conversacional básico (recordar la última entrada para referencia)

**Análisis y reportes:**
- Categorías más frecuentes por persona
- Comparación de gastos entre viajes/grupos
- Insight de quién suele pagar más
- Patrones de gasto por día de semana

---

## 7.6 V5 — MODO NEGOCIO (Mes 7+)

### Nuevas funcionalidades

**Para uso empresarial:**
- 💼 Modo "Caja Chica"
  - Balance de caja chica
  - Aprobación de gastos
  - Rendición de cuentas
  - Adjuntos obligatorios
- 📦 Modo "Materiales / Obra"
  - Listas de materiales con cantidades
  - Proveedores
  - Cotizaciones vs gastos reales
  - Inventario básico
- 📋 Modo "Pedidos"
  - Lista de pedidos por encargado
  - Estado de pedidos
  - Verificación de entrega

**Roles avanzados:**
- Admin con aprobación de gastos
- Visualizador (solo lectura)
- Aprobador de settlements

**Plantillas:**
- Guardar configuración de grupo como plantilla
- Plantillas públicas por tipo (viaje, obra, etc.)
- Duplicar grupo con o sin entradas

**Reportes:**
- Dashboard de resumen mensual
- Reportes por categoría y período
- Exportación en formato de rendición de cuentas

---

## 7.7 MONETIZACIÓN

### Free

- Hasta 3 grupos activos simultáneos
- Hasta 10 miembros por grupo
- Historial de 30 días
- Captura por texto y voz (100 entradas/mes con IA)
- Export imagen básica

### Pro ($4.99/mes o $39/año)

- Grupos ilimitados
- Miembros ilimitados
- Historial ilimitado
- OCR de tickets ilimitado
- Export Excel y PDF
- Múltiples monedas
- IA avanzada con sugerencias
- Análisis y reportes

### Business ($14.99/mes o $119/año)

- Todo Pro
- Modo Negocio (Caja Chica, Materiales, Pedidos)
- Roles avanzados y aprobaciones
- Plantillas empresariales
- API básica
- Soporte prioritario

---

## 7.8 QUÉ HARÍA REALMENTE DIFERENCIAL AL PRODUCTO

### Los 5 momentos wow que hay que cuidar:

**1. Primera entrada en < 5 segundos**
El momento "¡eso fue rápido!" es la primera retención. La app debe procesar y mostrar la primera entrada en menos de 5 segundos desde que el usuario habla.

**2. La Sheet que aparece como magia**
Ver cómo la entrada caótica se convierte en una fila ordenada en la sheet, en tiempo real, es el diferenciador visual más poderoso.

**3. El cierre del día**
Un resumen visual hermoso al final del día que el usuario quiera compartir. Si parece una infografía bien diseñada, se vuelve viral.

**4. Resolver 3 pendientes en 10 segundos**
La bandeja de pendientes inteligentes debe permitir resolver todo con taps mínimos. Un swipe = resuelto.

**5. El "share" que no da vergüenza**
La imagen de resumen del grupo debe verse tan bien que la gente la comparta en WhatsApp y eso sea marketing orgánico.

### Las 3 cosas que la competencia NO tiene:

1. **Sheet viva en mobile** — Nadie tiene una spreadsheet hermosa y usable en móvil para gastos
2. **Modo caos funcional** — Guardar incompleto y resolver después es counter-intuitive pero brillante
3. **Timeline colaborativo + Sheet** — La dualidad timeline narrativo + hoja de datos es única

### Lo que el equipo debe proteger a cualquier costo:

- **Velocidad de captura** — Si agregar una entrada tarda más de 10 segundos, la app fracasa
- **La belleza de la sheet** — Si la tabla se ve genérica, el diferenciador desaparece
- **El momento de parsing** — La microinteracción de "texto → datos estructurados" es la magia del producto

---

## 7.9 ESTRUCTURA DE CARPETAS FINAL DEL PROYECTO

```
vozpe/
├── apps/
│   ├── mobile/                    # React Native + Expo
│   │   ├── src/
│   │   │   ├── app/               # Expo Router (file-based navigation)
│   │   │   │   ├── index.tsx      # Root redirect
│   │   │   │   ├── onboarding/    # Splash + selección caso de uso
│   │   │   │   ├── (auth)/        # Login, signup, magic link
│   │   │   │   └── (app)/         # App principal (tab nav)
│   │   │   │       ├── index.tsx  # Home global (lista de grupos)
│   │   │   │       ├── groups/    # Crear/editar grupos
│   │   │   │       └── group/     # Workspace del grupo
│   │   │   │           ├── [id].tsx        # Home del grupo
│   │   │   │           ├── [id]/sheet.tsx  # Sheet viva
│   │   │   │           ├── [id]/timeline.tsx
│   │   │   │           ├── [id]/balance.tsx
│   │   │   │           ├── [id]/pending.tsx
│   │   │   │           └── [id]/closure.tsx
│   │   │   ├── components/
│   │   │   │   ├── composer/      # MultimodalComposer + Waveform
│   │   │   │   ├── sheet/         # SheetRow, SheetHeader, SheetFilter
│   │   │   │   ├── timeline/      # TimelineCard, TimelineEvent
│   │   │   │   ├── balance/       # BalanceCard, SettlementCard
│   │   │   │   └── common/        # Button, Input, Card, Avatar, Badge, etc.
│   │   │   ├── stores/            # Zustand stores
│   │   │   │   ├── auth.store.ts
│   │   │   │   ├── group.store.ts
│   │   │   │   └── ui.store.ts
│   │   │   ├── services/          # Lógica de negocio y API calls
│   │   │   │   ├── entry.service.ts
│   │   │   │   ├── group.service.ts
│   │   │   │   └── export.service.ts
│   │   │   ├── hooks/             # Custom hooks
│   │   │   │   ├── useVoiceRecording.ts
│   │   │   │   ├── useGroupRealtime.ts
│   │   │   │   └── useOfflineQueue.ts
│   │   │   └── lib/               # Utils, supabase client
│   │   └── assets/
│   │
│   └── web/                       # Next.js 14
│       ├── src/
│       │   ├── app/               # App Router
│       │   │   ├── page.tsx       # Landing
│       │   │   ├── auth/          # Auth pages
│       │   │   └── app/           # Dashboard
│       │   │       ├── page.tsx   # Home (lista grupos)
│       │   │       └── group/
│       │   │           └── [id]/
│       │   │               ├── page.tsx     # Home del grupo
│       │   │               ├── sheet/       # Sheet viva web
│       │   │               └── balance/     # Balance web
│       │   ├── components/
│       │   └── lib/
│       └── public/
│
├── packages/
│   ├── shared/                    # Tipos, utils, calculadores compartidos
│   │   └── src/
│   │       ├── types/             # TypeScript types
│   │       ├── calculations/      # split.ts, settlement.ts
│   │       ├── parsers/           # quick-text-parser.ts
│   │       ├── constants/         # currencies, categories, etc.
│   │       └── utils/             # format.ts, colors.ts
│   │
│   └── ui/                        # Componentes de UI compartidos (futuro)
│
└── supabase/
    ├── migrations/
    │   ├── 001_initial_schema.sql
    │   ├── 002_rls_policies.sql
    │   └── 003_seed_data.sql
    ├── functions/
    │   ├── parse-entry/           # Main parsing Edge Function
    │   ├── export-excel/          # Generación de Excel
    │   └── daily-closure/         # Cierre del día automático
    └── seed/
        └── dev_seed.sql           # Datos de prueba
```

---

## 7.10 CHECKLIST DE LANZAMIENTO MVP

### Técnico
- [ ] Auth (Google + Apple + Email) funcionando en iOS y Android
- [ ] Crear grupo + invitar por link
- [ ] Compositor multimodal (texto + voz)
- [ ] Parser funcionando (local + IA)
- [ ] Sheet viva con edición inline
- [ ] Realtime sincronización
- [ ] Offline queue funcionando
- [ ] Cálculo de saldos correcto
- [ ] Cierre del día
- [ ] Share image generada
- [ ] Notificaciones push
- [ ] Error tracking (Sentry)
- [ ] Analytics (PostHog)

### Producto
- [ ] Onboarding < 60 segundos hasta primera entrada
- [ ] Estado vacío memorable en todos los contextos
- [ ] Microinteracciones de confirmación de entrada
- [ ] Estados de pendientes claros y accionables
- [ ] Modo offline comunicado visualmente
- [ ] Animación de parsing funcionando

### Lanzamiento
- [ ] Landing page en web
- [ ] TestFlight beta (iOS)
- [ ] Play Store beta (Android)
- [ ] Grupo de beta testers (20-50 usuarios)
- [ ] Ciclo de feedback semanal
- [ ] Iteración rápida basada en métricas clave
