# CZN 한글 위키 사이트 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 기존 단일 페이지 전투 도구를 한글 CZN 위키 사이트로 전환 — Prydwen 스타일 카드형 레이아웃, App Router SSG

**Architecture:** Next.js App Router route groups로 위키 레이아웃(`(wiki)/`)과 레거시(`deck-builder/`)를 분리. 모든 페이지는 `generateStaticParams` + JSON import로 빌드 타임 정적 생성. 기존 `globals.css` 디자인 토큰과 `types.ts` 인터페이스를 그대로 재활용.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9 strict, Tailwind CSS v4, Vercel SSG

**Design Doc:** `docs/plans/2026-03-06-wiki-site-design.md`

---

## Task 1: 레거시 분리 — 기존 페이지를 /deck-builder로 이동

**Files:**
- Move: `src/app/page.tsx` → `src/app/deck-builder/page.tsx`
- Create: `src/app/page.tsx` (새 홈, 임시 리다이렉트)

**Step 1: deck-builder 디렉토리 생성 + 기존 page.tsx 이동**

```bash
mkdir -p src/app/deck-builder
mv src/app/page.tsx src/app/deck-builder/page.tsx
```

**Step 2: 새 루트 page.tsx 작성 (임시 홈)**

`src/app/page.tsx`:
```tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">CZN 위키</h1>
      <p className="text-[var(--color-text-secondary)] mb-8">
        카오스 제로 나이트메어 한글 위키
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/characters" className="px-4 py-2 bg-[var(--color-accent)] rounded hover:bg-[var(--color-accent-hover)]">
          캐릭터
        </Link>
        <Link href="/cards" className="px-4 py-2 bg-[var(--color-accent)] rounded hover:bg-[var(--color-accent-hover)]">
          카드
        </Link>
        <Link href="/glossary" className="px-4 py-2 bg-[var(--color-accent)] rounded hover:bg-[var(--color-accent-hover)]">
          용어집
        </Link>
      </div>
    </div>
  );
}
```

**Step 3: 빌드 확인**

```bash
npm run build
```

Expected: 빌드 성공, `/` 새 홈, `/deck-builder` 기존 기능 동작

**Step 4: 커밋**

```bash
git add -A
git commit -m "refactor: move deck builder to /deck-builder, create wiki home"
```

---

## Task 2: 위키 레이아웃 — 네비게이션 + 푸터

**Files:**
- Create: `src/app/(wiki)/layout.tsx`
- Move: `src/app/page.tsx` → `src/app/(wiki)/page.tsx`
- Modify: `src/app/layout.tsx` (루트 레이아웃 간소화)

**Step 1: 루트 layout.tsx에서 기존 헤더 제거, 최소화**

`src/app/layout.tsx`는 `<html>`, `<body>`, globals.css import만 남기고, 헤더/컨테이너는 위키 레이아웃으로 이동.

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CZN 위키 — 카오스 제로 나이트메어",
  description: "카오스 제로 나이트메어 한글 위키 · 캐릭터 · 카드 · 용어집",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

**Step 2: 위키 레이아웃 작성**

`src/app/(wiki)/layout.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/characters", label: "캐릭터" },
  { href: "/cards", label: "카드" },
  { href: "/glossary", label: "용어집" },
  { href: "/combat", label: "전투 시스템" },
];

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-8">
          <Link href="/" className="text-lg font-bold text-[var(--color-accent)]">
            CZN
          </Link>
          <nav className="hidden md:flex gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  pathname.startsWith(item.href)
                    ? "text-[var(--color-accent)] font-medium"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {/* Mobile hamburger — Task 별도 */}
          <button className="md:hidden ml-auto text-[var(--color-text-secondary)]">
            ☰
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-[var(--color-text-secondary)]">
          © 2026 CZN 위키 · 비공식 팬 사이트 · 게임 데이터 출처: prydwen.gg, 나무위키
        </div>
      </footer>
    </div>
  );
}
```

**Step 3: 홈 페이지를 (wiki) 그룹으로 이동**

```bash
mkdir -p "src/app/(wiki)"
mv src/app/page.tsx "src/app/(wiki)/page.tsx"
```

**Step 4: 빌드 확인**

```bash
npm run build
```

Expected: `/` 위키 홈 (네비 포함), `/deck-builder` 레거시 (네비 없음)

**Step 5: 커밋**

```bash
git add -A
git commit -m "feat: add wiki layout with navigation and footer"
```

---

## Task 3: 카드 이미지 URL 스크래핑 스크립트

prydwen 카드 이미지 URL을 28캐릭터 전원에서 수집하여 매핑 데이터 생성.

**Files:**
- Create: `scripts/scrape-card-images.mjs`
- Create: `src/data/card-images.json`

**Step 1: 스크래핑 스크립트 작성**

`scripts/scrape-card-images.mjs` — Playwright MCP로 각 캐릭터 페이지에서 `img[alt="Card Image"]` URL을 수집. 캐릭터 ID + 카드 순서로 매핑.

입력: `src/data/characters.json` (28캐릭터 ID 목록)
출력: `src/data/card-images.json`

```json
{
  "renoa": {
    "cards": [
      "https://www.prydwen.gg/static/.../ronoa_1.webp",
      "https://www.prydwen.gg/static/.../ronoa_2.webp",
      ...
    ],
    "ego": "https://www.prydwen.gg/static/.../ronoa_ego.webp"
  },
  ...
}
```

**Step 2: Playwright MCP로 28캐릭터 순회 실행**

prydwen URL 패턴: `/chaos-zero-nightmare/characters/{id}`
각 페이지에서 고유 `img[alt="Card Image"]` src 추출.

**Step 3: 결과 확인**

```bash
node -e "const d=require('./src/data/card-images.json'); console.log(Object.keys(d).length, 'characters'); Object.entries(d).forEach(([k,v])=>console.log(k, v.cards.length, 'cards'))"
```

Expected: 28 characters, 각각 7~9장 카드 이미지

**Step 4: 커밋**

```bash
git add scripts/scrape-card-images.mjs src/data/card-images.json
git commit -m "data: scrape prydwen card image URLs for 28 characters"
```

---

## Task 4: GameCard 컴포넌트 — Prydwen 스타일 카드 UI

**Files:**
- Create: `src/components/wiki/GameCard.tsx`

**Step 1: GameCard 컴포넌트 작성**

Prydwen 레이아웃 재현:
- 좌측 속성색 보더
- 상단: AP 배지(원형) + 카드명 + 타입 아이콘/텍스트
- 중앙: 카드 일러스트 (200×300 배경)
- 하단: 효과 텍스트 + 태그 배지

```tsx
// src/components/wiki/GameCard.tsx
interface GameCardProps {
  name: string;          // 한글 카드명
  apCost: number;
  type: string;          // Attack | Skill | Upgrade
  attribute?: string;    // Void | Order | ... (속성색 결정)
  imageUrl?: string;     // prydwen CDN URL
  effect?: string;       // 효과 텍스트
  tags?: string[];       // 한글 태그
  compact?: boolean;     // 목록에서 축소 표시
}
```

타입별 색상: Attack=`--color-passion`, Skill=`--color-order`, Upgrade=`--color-justice`
속성별 보더: `--color-{attribute}`

**Step 2: 빌드 확인**

```bash
npm run build
```

**Step 3: 커밋**

```bash
git add src/components/wiki/GameCard.tsx
git commit -m "feat: add GameCard component (prydwen-style card UI)"
```

---

## Task 5: 캐릭터 목록 페이지

**Files:**
- Create: `src/app/(wiki)/characters/page.tsx`
- Create: `src/components/wiki/CharacterGrid.tsx`
- Create: `src/components/wiki/FilterBar.tsx`

**Step 1: FilterBar 컴포넌트 (재사용)**

속성/클래스/진영 필터 + 텍스트 검색. 클라이언트 컴포넌트.

```tsx
interface FilterBarProps {
  attributes: string[];
  classes: string[];
  factions: string[];
  onFilter: (filters: FilterState) => void;
}
```

**Step 2: CharacterGrid 컴포넌트**

28캐릭터 카드형 그리드. 이미지 + 이름 + 레어리티 + 클래스 + 속성 배지.
4열(md:) / 2열(모바일). 클릭 → `/characters/[id]`.

**Step 3: 캐릭터 목록 페이지**

`src/app/(wiki)/characters/page.tsx` — 서버 컴포넌트로 characters.json import, 클라이언트 CharacterGrid에 전달.

**Step 4: 빌드 확인**

```bash
npm run build
```

Expected: `/characters` 페이지 빌드 성공

**Step 5: 커밋**

```bash
git add -A
git commit -m "feat: add characters list page with filter grid"
```

---

## Task 6: 캐릭터 상세 페이지

**Files:**
- Create: `src/app/(wiki)/characters/[id]/page.tsx`
- Create: `src/components/wiki/CharacterProfile.tsx`
- Create: `src/components/wiki/CardWithVariations.tsx`

**Step 1: generateStaticParams 정의**

```tsx
import characters from "@/data/characters.json";

export function generateStaticParams() {
  return characters.map((c) => ({ id: c.id }));
}
```

28캐릭터 정적 생성.

**Step 2: CharacterProfile 컴포넌트**

캐릭터 이미지 + 이름 + 레어리티 + 클래스/속성/진영 + Lv60 스탯 (ATK/DEF/HP).

**Step 3: CardWithVariations 컴포넌트**

고유 카드 1장의 기본 + #1~#5 바리에이션 종속 표시.
기본이 헤더, 바리에이션은 들여쓰기로 트리 구조.
타입/AP 변경 시 배지 색상으로 차이 표시.

**Step 4: 상세 페이지 조립**

```
← 목록으로
[프로필]
기본 카드 (GameCard × 4)
고유 카드 (CardWithVariations × 4)
```

**Step 5: 빌드 확인**

```bash
npm run build
```

Expected: `/characters/renoa`, `/characters/nine` 등 28개 정적 페이지 생성

**Step 6: 커밋**

```bash
git add -A
git commit -m "feat: add character detail page with card variations"
```

---

## Task 7: 카드 목록 페이지

**Files:**
- Create: `src/app/(wiki)/cards/page.tsx`
- Create: `src/components/wiki/CardGrid.tsx`
- Create: `src/lib/cardData.ts` (캐릭터 카드 + 중립 카드 통합)

**Step 1: 카드 데이터 통합 유틸리티**

`src/lib/cardData.ts` — cards.json(200장) + neutral-cards.json(122장)을 하나의 배열로 통합. 통합된 카드에 소속 캐릭터 정보 역매핑.

**Step 2: CardGrid 컴포넌트**

GameCard 그리드 + 필터 (타입, 카테고리, AP, 태그, effectKeywords 검색).
5열(lg:) / 3열(md:) / 2열(모바일).

**Step 3: 카드 목록 페이지**

서버 컴포넌트로 데이터 import → 클라이언트 CardGrid에 전달.

**Step 4: 빌드 확인 + 커밋**

```bash
npm run build
git add -A
git commit -m "feat: add cards database page with filters"
```

---

## Task 8: 카드 상세 페이지

**Files:**
- Create: `src/app/(wiki)/cards/[id]/page.tsx`

**Step 1: generateStaticParams**

캐릭터 카드 200장 + 중립 카드 122장 = 322개 정적 페이지.

**Step 2: 카드 상세 페이지**

- GameCard (큰 버전)
- 효과 텍스트 (한글 + 영문)
- effectKeywords 배지
- 소속 캐릭터 링크 (캐릭터 카드인 경우)
- 바리에이션 목록 (고유 카드인 경우)
- 클래스 제한 (중립 카드인 경우)

**Step 3: 빌드 확인 + 커밋**

```bash
npm run build
git add -A
git commit -m "feat: add card detail page with variations and keywords"
```

---

## Task 9: 용어집 페이지

**Files:**
- Create: `src/app/(wiki)/glossary/page.tsx`
- Create: `src/components/wiki/GlossarySection.tsx`

**Step 1: GlossarySection 컴포넌트**

접을 수 있는 항목 리스트. 각 항목:
- 한글명 (영문명)
- valuePerStack (한줄 요약)
- 펼침: type, stacking, maxStacks, duration, trigger, desc, descEn

**Step 2: 용어집 페이지**

탭 3개: 상태 효과 | 메커니즘 | 카드 키워드
상태 효과 탭: buff/debuff 그룹핑
glossary.json에서 직접 import.

**Step 3: 빌드 확인 + 커밋**

```bash
npm run build
git add -A
git commit -m "feat: add glossary page with status effects and mechanics"
```

---

## Task 10: 전투 시스템 페이지 (빈 껍데기)

**Files:**
- Create: `src/app/(wiki)/combat/page.tsx`

**Step 1: 빈 페이지 작성**

```tsx
export default function CombatPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold mb-4">전투 시스템</h1>
      <p className="text-[var(--color-text-secondary)]">
        전투 매커니즘 분석서 완성 후 업데이트 예정
      </p>
    </div>
  );
}
```

**Step 2: 빌드 확인 + 커밋**

```bash
npm run build
git add -A
git commit -m "feat: add combat system placeholder page"
```

---

## Task 11: 모바일 네비게이션

**Files:**
- Modify: `src/app/(wiki)/layout.tsx`

**Step 1: 햄버거 메뉴 토글 구현**

모바일에서 ☰ 클릭 시 드롭다운 네비게이션 표시/숨김.
`useState`로 `isMenuOpen` 관리. 링크 클릭 시 자동 닫힘.

**Step 2: 빌드 확인 + 커밋**

```bash
npm run build
git add -A
git commit -m "feat: add mobile hamburger navigation"
```

---

## Task 12: 최종 빌드 검증 + Vercel 배포

**Step 1: 전체 빌드**

```bash
npm run build
```

Expected: 모든 정적 페이지 생성 성공
- `/` 홈
- `/characters` 목록 + 28개 상세
- `/cards` 목록 + 322개 상세
- `/glossary` 용어집
- `/combat` 빈 페이지
- `/deck-builder` 레거시

**Step 2: 로컬 확인**

```bash
npm run dev
```

각 페이지 네비게이션 동작, 이미지 로딩, 필터, 반응형 확인.

**Step 3: 커밋 + 배포**

```bash
git add -A
git commit -m "feat: CZN wiki site - characters, cards, glossary pages"
```

Vercel 자동 배포 또는 수동 push.

---

## 작업 순서 의존성

```
Task 1 (레거시 분리) → Task 2 (위키 레이아웃)
Task 3 (이미지 스크래핑) → Task 4 (GameCard) → Task 5,6,7,8 (페이지들)
Task 9 (용어집) — 독립
Task 10 (전투 빈페이지) — 독립
Task 11 (모바일 네비) — Task 2 이후
Task 12 (최종 검증) — 모두 완료 후
```

병렬 가능: Task 3 + Task 9 + Task 10 동시 진행 가능
