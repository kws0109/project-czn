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

## Current Priority
- **분석서 (전투 매커니즘 분석 문서)** — 지금 집중 작업 중
- 덱 빌더/웹 툴 작업은 분석서 완료 후 진행

## Three Core Features
1. **Deck Builder + Turn Simulator** — AP budget greedy simulation
2. **Team Synergy Analysis** — attribute/class/faction bonuses
3. **Balance Anomaly Detection** — z-score based stat/card outlier detection (QA differentiator)

## Quality Standards
- Every calculation must trace back to prydwen.gg verified formulas
- Balance analysis uses z-score > 1.5 threshold for outlier detection
- Simulation results must be deterministic (expected value, not RNG)
- UI must be functional and informative — this is a portfolio piece for a QA professional

## Progress Log

### 진행중: 전투 매커니즘 분석 문서 (2026-03-02~)
- **마지막 커밋**: `07a59cc` on `main` (19장 버전)
- **현재 상태**: 37장으로 확장, uncommitted
- **산출물**: `docs/analysis/combat-mechanics.md` — Marp 슬라이드
- **관련 파일**:
  - `docs/analysis/czn-dark.css` — Marp 다크 테마
  - `docs/analysis/images/` — 스크린샷 자료
  - `scripts/extract-tag-stats.mjs` — 태그 통계 추출 스크립트
- **빌드 명령**: `npm run slides:pdf`, `npm run slides:pptx`
- **용어 규칙**: Starting→기본, Epiphany→고유, Attack→공격, Skill→스킬, Upgrade→강화, Damage→피해, Shield→실드, Heal→치유
- **추가된 내용 (Day 4-5)**:
  - 스트레스/강인도/브레이크 시스템
  - 합연산 vs 곱연산 표기 규칙
  - 능력치 적용 파이프라인 (3단계)
  - 카오스 세이브 + 카드 복제 제한
  - T0 중립 카드 6종
  - 핵심 발견 10항목, QA 테스트 영역 16항목

### Completed: 번뜩임 바리에이션 데이터 (2026-03-04)
- 28캐릭터 전원 바리에이션 완료 (560 variations, 112 cards)
- `scripts/variation-data.json` — 28캐릭터 스크래핑 원본
- `scripts/merge-new-variations.mjs` — 누락 8캐릭터 머지 스크립트
- `scripts/build-namu-data.mjs` — 바리에이션 데이터 활용 플레이스홀더 카드 개선

### 미완료: main 브랜치 uncommitted 변경사항
- 분석서 보강 + 바리에이션 완성 + 웹 툴 변경사항이 모두 uncommitted 상태
- 커밋 시점은 사용자 판단
