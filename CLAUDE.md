# CZN Combat Tool - Project Rules

## Authority & Workflow
- Claude has full authority to create, modify, delete, and refactor any file
- Quality over speed — take time to get it right
- Korean UI text, English code identifiers
- Always verify builds compile before claiming completion
- Commit only when explicitly asked

## Project Context
- **Purpose**: 슈퍼크리에이티브 [카오스 제로 나이트메어] 개발QA 지원용 포트폴리오
- **Style**: Path of Building (PoE) 스타일 전투 유틸리티 툴
- **Author**: 김우성 (7년차 게임 QA, 펄어비스)
- **Data Source**: prydwen.gg (primary), 나무위키 (supplementary Korean data)

## Tech Stack
- Next.js 16 + React 19 + TypeScript 5.9 (strict mode)
- Tailwind CSS v4 via `@tailwindcss/postcss`
- npm (not yarn/pnpm/bun)
- Deploy target: Vercel

## Architecture
```
src/
  app/           # Next.js App Router pages
  components/    # React UI components
  hooks/         # Custom React hooks
  lib/           # Core logic (calculator, simulator, balance, types)
  data/          # Static JSON data (characters, cards, synergies, partners)
```

## Code Conventions

### TypeScript
- Strict mode enabled — no `any`, no type assertions unless truly necessary
- Types live in `src/lib/types.ts` — single source of truth
- Use `@/*` path alias for all imports (maps to `./src/*`)
- Prefer `interface` over `type` for object shapes
- Export types separately from runtime values

### React Components
- Functional components only, `"use client"` directive where needed
- Props interface named `{ComponentName}Props`
- One component per file in `src/components/`
- Custom hooks in `src/hooks/` prefixed with `use`

### Styling
- Tailwind utility classes only — no CSS modules, no styled-components
- Design tokens via CSS custom properties: `var(--color-accent)`, `var(--color-bg-primary)`, etc.
- Dark theme by default (game tool aesthetic)
- Responsive: mobile-first, breakpoints at `md:` (768px)

### Data
- Game data stored as static JSON in `src/data/`
- All numeric values from prydwen.gg — do not fabricate game stats
- Character stats are Lv60 max values (Lv1 base unavailable)
- IDs use kebab-case: `renoa`, `nine`, `mika`

## Game Mechanics (CZN Damage Formula)
- **ATK-based**: `CardMultiplier × ATK × 0.35 × modifiers`
- **DEF-based** (Nine etc.): `CardMultiplier × ((ATK × 0.3) + (DEF × 2.1)) × 0.35 × modifiers`
- Crit is not a character innate stat — comes from Potential nodes (+10% CC, +12% CD)
- AP system: cards cost AP to play, budget per turn

## Three Core Features
1. **Deck Builder + Turn Simulator** — AP budget greedy simulation
2. **Team Synergy Analysis** — attribute/class/faction bonuses
3. **Balance Anomaly Detection** — z-score based stat/card outlier detection (QA differentiator)

## Quality Standards
- Every calculation must trace back to prydwen.gg verified formulas
- Balance analysis uses z-score > 1.5 threshold for outlier detection
- Simulation results must be deterministic (expected value, not RNG)
- UI must be functional and informative — this is a portfolio piece for a QA professional
