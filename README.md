# Vozpe

> **"Habla, toma foto o escribe… y todo se ordena solo."**

Vozpe es un workspace colaborativo de captura rápida que transforma entradas caóticas —voz, foto, texto— en una tabla viva, editable, calculada y compartida en tiempo real.

## Estructura del Proyecto

```
vozpe/
├── apps/mobile/        # React Native + Expo (iOS + Android)
├── apps/web/           # Next.js 14 (dashboard web)
├── packages/shared/    # Tipos, calculadores y parsers compartidos
├── supabase/           # Schema, migraciones y Edge Functions
└── docs/               # Documentación de producto (7 fases)
```

## Documentación

| Fase | Archivo | Contenido |
|------|---------|-----------|
| 1 | `docs/phase-1-vision.md` | Visión, diferenciador, arquitectura, mapa de navegación |
| 2 | `docs/phase-2-ux-flows.md` | Flujo UX completo y descripción de todas las pantallas |
| 3 | `docs/phase-3-design-system.md` | Design system, paleta, tipografía, componentes, motion |
| 4 | `docs/phase-4-data-model.md` | Modelo de datos, lógica funcional, arquitectura técnica |
| 5 | (código) | Estructura base React Native + Next.js + Supabase |
| 6 | `docs/phase-6-parsing.md` | Prompts de parsing de voz, texto y OCR |
| 7 | `docs/phase-7-roadmap.md` | Roadmap V1-V5 y estrategia MVP |

## Setup Rápido

```bash
# Instalar dependencias
yarn install

# Variables de entorno (copiar .env.example)
cp apps/mobile/.env.example apps/mobile/.env.local
cp apps/web/.env.example apps/web/.env.local

# Iniciar Supabase local
supabase start
supabase db push

# Desarrollo mobile
yarn dev:mobile

# Desarrollo web
yarn dev:web
```

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Mobile | React Native + Expo SDK 50 |
| Web | Next.js 14 (App Router) |
| Backend | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| AI - Voz | OpenAI Whisper |
| AI - Parser | Anthropic Claude Haiku |
| AI - OCR | Google Vision API |
| State (mobile) | Zustand + React Query |
| Animations | Reanimated 3 + Moti |
| Offline | MMKV |

## Propuesta de Valor

**"Anota ahora, ordena después."**

Vozpe resuelve el caos de los gastos grupales transformando entradas rápidas e incompletas en una hoja clara, editable, calculada y colaborativa.

No es un expense tracker.
No es un clon de Splitwise.
Es el cuaderno operativo inteligente para grupos.
