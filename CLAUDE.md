# Kivo — Contexto para Claude

## Qué es esto
Kivo es un producto digital premium: app móvil colaborativa para registrar gastos, compras y listas de forma rápida mediante voz, foto o texto. El caos se convierte en una tabla viva organizada.

## Stack
- Mobile: React Native + Expo (apps/mobile)
- Web: Next.js 14 (apps/web)
- Backend: Supabase (DB + Auth + Realtime + Storage)
- Shared: packages/shared (tipos, calculadores, parsers)
- IA: Claude Haiku (parser), Whisper (voz), Google Vision (OCR)

## Arquitectura importante
- Monorepo con yarn workspaces + Turbo
- `@kivo/shared` exporta todos los tipos TypeScript, calculadores de reparto, y el parser de texto rápido
- El parser tiene dos capas: local (determinístico) → IA (Claude Haiku via Edge Function)
- Offline-first: MMKV para cache local, cola de sincronización en SyncQueue
- Realtime: Supabase channels por grupo (`group:{groupId}`)

## Convenciones de código
- TypeScript estricto en todo el proyecto
- Componentes en PascalCase, hooks en camelCase con prefijo `use`
- Styles en StyleSheet.create (mobile) o Tailwind CSS (web)
- Stores con Zustand, queries con TanStack Query
- Formularios con React Hook Form + Zod

## Decisiones de diseño
- Dark mode por defecto (bg: #0A0A0F)
- Color de acento: Indigo (#6366F1) — kivo brand
- Tipografía: Inter (UI) + JetBrains Mono (montos/datos)
- Componentes premium, no genéricos. Ver phase-3-design-system.md

## Módulos clave
- `MultimodalComposer`: el componente más importante, en apps/mobile/src/components/composer/
- `calculateSplits`: lógica de reparto en packages/shared/src/calculations/split.ts
- `parseQuickText`: parser local en packages/shared/src/parsers/quick-text-parser.ts
- Edge Function `parse-entry`: parsing con IA en supabase/functions/parse-entry/
- Migration SQL: supabase/migrations/001_initial_schema.sql

## Contexto de producto
- Propuesta de valor: "Anota ahora, ordena después"
- NO es un expense tracker genérico
- NO es un clon de Splitwise
- La sheet viva es el corazón del producto
- Ver docs/phase-1-vision.md para el diferenciador completo
