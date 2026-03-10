# 전투 매커니즘 분석서 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Marp 기반 전투 매커니즘 분석서 (~30슬라이드) 작성, PDF/PPTX 출력 가능하게 구성

**Architecture:** `docs/analysis/` 디렉토리에 Marp markdown + 커스텀 다크 테마 CSS 배치. 태그 통계 데이터는 Node.js 스크립트로 cards.json에서 추출. marp-cli devDependency로 설치하여 npm script로 빌드.

**Tech Stack:** Marp CLI, Markdown, CSS (custom theme), Node.js (data extraction)

---

### Task 1: Marp 환경 셋업

**Files:**
- Modify: `package.json` (devDependency + scripts 추가)
- Create: `docs/analysis/` 디렉토리

**Step 1: marp-cli 설치**

Run: `npm install -D @marp-team/marp-cli`

**Step 2: npm scripts 추가**

`package.json`에 추가:
```json
"scripts": {
  "slides:preview": "marp docs/analysis/combat-mechanics.md --preview",
  "slides:pdf": "marp docs/analysis/combat-mechanics.md --pdf --theme docs/analysis/czn-dark.css -o docs/analysis/combat-mechanics.pdf",
  "slides:pptx": "marp docs/analysis/combat-mechanics.md --pptx --theme docs/analysis/czn-dark.css -o docs/analysis/combat-mechanics.pptx"
}
```

**Step 3: 디렉토리 생성 확인**

Run: `mkdir -p docs/analysis`

**Step 4: Commit**

```bash
git add package.json package-lock.json docs/analysis/
git commit -m "chore: add marp-cli for analysis document"
```

---

### Task 2: 커스텀 다크 테마 CSS

**Files:**
- Create: `docs/analysis/czn-dark.css`

**Step 1: CZN 다크 테마 작성**

```css
/* @theme czn-dark */
@import 'default';

section {
  background: #0f1117;
  color: #e2e8f0;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  font-size: 28px;
  padding: 50px 60px;
}

h1 {
  color: #a78bfa;
  font-size: 48px;
  border-bottom: 2px solid #7c3aed;
  padding-bottom: 12px;
}

h2 {
  color: #c4b5fd;
  font-size: 36px;
}

h3 {
  color: #93c5fd;
  font-size: 30px;
}

strong {
  color: #fbbf24;
}

code {
  background: #1e293b;
  color: #7dd3fc;
  padding: 2px 6px;
  border-radius: 4px;
}

blockquote {
  border-left: 4px solid #7c3aed;
  background: rgba(124, 58, 237, 0.1);
  padding: 12px 20px;
  margin: 16px 0;
}

table {
  border-collapse: collapse;
  width: 100%;
}

th {
  background: #1e293b;
  color: #a78bfa;
  padding: 10px 16px;
  text-align: left;
}

td {
  border-bottom: 1px solid #334155;
  padding: 8px 16px;
}

/* 표지 슬라이드 */
section.lead {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

section.lead h1 {
  font-size: 56px;
  border-bottom: none;
}

/* 태그 카테고리 색상 */
.tag-attack { color: #ef4444; }
.tag-timing { color: #f59e0b; }
.tag-resource { color: #3b82f6; }
.tag-defense { color: #10b981; }
.tag-special { color: #8b5cf6; }

/* 페이지 번호 */
section::after {
  color: #475569;
  font-size: 14px;
}
```

**Step 2: 테마 적용 확인용 테스트 슬라이드 작성**

`docs/analysis/combat-mechanics.md` 에 최소 2슬라이드 작성 후:

Run: `npx marp docs/analysis/combat-mechanics.md --preview --theme docs/analysis/czn-dark.css`

테마가 적용되는지 시각적 확인.

**Step 3: Commit**

```bash
git add docs/analysis/czn-dark.css
git commit -m "feat: add CZN dark theme for Marp slides"
```

---

### Task 3: 태그 통계 데이터 추출 스크립트

**Files:**
- Create: `scripts/extract-tag-stats.mjs`

**Step 1: 스크립트 작성**

`cards.json`에서 태그별 통계를 추출하여 슬라이드 작성에 활용할 수 있는 요약을 출력하는 Node.js 스크립트. 출력:
- 태그별 카드 수, 캐릭터 수
- 태그별 대표 카드 (이름, AP, 타입)
- 태그 × 캐릭터 매트릭스 (히트맵용)
- 바리에이션에서의 태그 출현 빈도

```javascript
import { readFileSync } from 'fs';

const cards = JSON.parse(readFileSync('src/data/cards.json', 'utf-8'));

// 태그별 통계
const tagStats = {};
cards.forEach(c => {
  const charId = c.id.split('-card-')[0];
  const processTags = (tags, cardInfo) => {
    tags?.forEach(t => {
      if (!tagStats[t]) tagStats[t] = { count: 0, characters: new Set(), cards: [], varCount: 0 };
      tagStats[t].count++;
      tagStats[t].characters.add(charId);
      if (cardInfo) tagStats[t].cards.push(cardInfo);
    });
  };
  processTags(c.tags, { id: c.id, name: c.nameKo, apCost: c.apCost, type: c.type, category: c.category });
  c.variations?.forEach(v => {
    processTags(v.tags, null);
    v.tags?.forEach(t => { if (tagStats[t]) tagStats[t].varCount++; });
  });
});

// 정렬된 출력
console.log('=== 태그 분포 (카드 수 내림차순) ===\n');
const sorted = Object.entries(tagStats).sort((a,b) => b[1].count - a[1].count);
sorted.forEach(([tag, s]) => {
  console.log(`## ${tag}: ${s.count}장 (${s.characters.size}캐릭터, 바리에이션 ${s.varCount}건)`);
  console.log(`캐릭터: ${[...s.characters].join(', ')}`);
  if (s.cards.length > 0) {
    console.log('대표 카드:');
    s.cards.slice(0, 5).forEach(c => console.log(`  - ${c.name} (AP:${c.apCost}, ${c.type}, ${c.category})`));
  }
  console.log('');
});

// 캐릭터 × 태그 매트릭스
console.log('\n=== 캐릭터 × 태그 매트릭스 ===\n');
const allChars = [...new Set(cards.map(c => c.id.split('-card-')[0]))].sort();
const allTags = sorted.map(([t]) => t);
console.log('캐릭터,' + allTags.join(','));
allChars.forEach(char => {
  const row = allTags.map(tag => {
    const charCards = tagStats[tag]?.cards.filter(c => c.id.startsWith(char + '-')) || [];
    return charCards.length;
  });
  console.log(char + ',' + row.join(','));
});
```

**Step 2: 실행 및 결과 저장**

Run: `node scripts/extract-tag-stats.mjs > docs/analysis/tag-stats.txt`

**Step 3: Commit**

```bash
git add scripts/extract-tag-stats.mjs docs/analysis/tag-stats.txt
git commit -m "feat: add tag statistics extraction script"
```

---

### Task 4: 섹션 1 — 표지 + 개요 (슬라이드 1~3)

**Files:**
- Create: `docs/analysis/combat-mechanics.md`

**Step 1: Marp 프론트매터 + 표지**

```markdown
---
marp: true
theme: czn-dark
paginate: true
---

<!-- _class: lead -->
<!-- _paginate: false -->

# 카오스 제로 나이트메어
## 전투 매커니즘 분석서

**김우성** | QA 7년차
2026.03

---
```

**Step 2: 분석 목적 & 범위 슬라이드**

핵심 메시지: 게임 전투 시스템의 구조적 이해를 바탕으로 효과적인 QA 수행

| 항목 | 수치 |
|------|------|
| 분석 캐릭터 | 28명 (5성 17 / 4성 11) |
| 분석 카드 | 200장 (Starting + Epiphany) |
| 카드 태그 | 16종 |
| 바리에이션 | 80장 × 5종 |

**Step 3: 전투 시스템 아키텍처 다이어그램**

ASCII 또는 Marp 호환 다이어그램으로 구성:
- 턴 → AP 할당 → 카드 선택 → 태그 발동 → 효과 해소
- 덱 구조: Starting(4장) + Epiphany(4장), 바리에이션

**Step 4: Preview 확인**

Run: `npx marp docs/analysis/combat-mechanics.md --preview --theme docs/analysis/czn-dark.css`

**Step 5: Commit**

```bash
git add docs/analysis/combat-mechanics.md
git commit -m "feat: add analysis doc section 1 - cover and overview"
```

---

### Task 5: 섹션 2 — 전투 시스템 기초 (슬라이드 4~7)

**Files:**
- Modify: `docs/analysis/combat-mechanics.md`

**Step 1: 턴 구조 & AP 시스템 (슬라이드 4)**

내용:
- 턴 진행 흐름 다이어그램
- AP 예산 (턴당 기본 AP)
- 카드별 AP 코스트 범위 (데이터: 0~3 AP)
- AP 관리 = 전투의 핵심 의사결정

**Step 2: 카드 시스템 개요 (슬라이드 5)**

내용:
- Starting(기본) vs Epiphany(번뜩임) 구분
- 4가지 카드 타입: Attack / Skill / Defense / Upgrade
- 번뜩임 바리에이션 시스템 (#1~#5) 설명
- 카드 타입별 분포 통계 (cards.json에서 추출)

**Step 3: 데미지 공식 (슬라이드 6)**

내용:
- ATK-based: `CardMultiplier × ATK × 0.35 × modifiers`
- DEF-based (Nine 등): `CardMultiplier × ((ATK×0.3) + (DEF×2.1)) × 0.35`
- 크리티컬 기대값: `1 + (CC/100) × ((150 + CD)/100 - 1)`
- 공식 시각화 (수식 + 예시 계산)

**Step 4: 효과 타입 분류 (슬라이드 7)**

내용:
- 8가지 효과 타입 표: damage, buff, debuff, shield, heal, draw, create, discard
- 각 효과의 전투 내 역할
- 효과 타입별 카드 수 통계

**Step 5: Preview 확인 후 Commit**

```bash
git add docs/analysis/combat-mechanics.md
git commit -m "feat: add analysis doc section 2 - combat system basics"
```

---

### Task 6: 섹션 3 — 태그 카테고리 맵 (슬라이드 8)

**Files:**
- Modify: `docs/analysis/combat-mechanics.md`

**Step 1: 카테고리 맵 슬라이드**

5개 카테고리로 16개 태그 분류 + 각 카테고리 색상 구분:

| 카테고리 | 태그 | 카드 수 |
|----------|------|---------|
| 공격 강화 | 점화, 분쇄, 약점 공격 | 17장 |
| 타이밍/조건 | 개전, 종극, 신속, 주도 | 88장 |
| 자원 관리 | 회수, 소멸, 증발 | 38장 |
| 방어/유지 | 보존, 천상 | 48장 |
| 특수 | 유일, 탄환 | 58장 |

(수치는 tag-stats.txt 참조하여 정확하게)

**Step 2: Commit**

```bash
git add docs/analysis/combat-mechanics.md
git commit -m "feat: add analysis doc section 3 - tag category map"
```

---

### Task 7: 섹션 4a — 공격 강화 태그 (점화, 분쇄, 약점 공격)

**Files:**
- Modify: `docs/analysis/combat-mechanics.md`

**Step 1: 점화 태그 슬라이드**

점화: 2장, 1캐릭터
- 발동 조건, 효과, 등장 카드, 전략적 의미

**Step 2: 분쇄 태그 슬라이드**

분쇄: 14장, 2캐릭터
- 발동 조건, 효과, 주요 카드 예시, 전략적 의미

**Step 3: 약점 공격 태그 슬라이드**

약점 공격: 1장, 1캐릭터
- 발동 조건, 효과, 등장 카드, 전략적 의미

> **NOTE**: 점화/약점 공격은 카드 수가 적으므로 1슬라이드에 합칠 수 있음. 분쇄는 별도 슬라이드.
> **USER INPUT NEEDED**: 각 태그의 정확한 발동 조건과 효과는 게임 플레이 경험 기반으로 보충 필요.

**Step 4: Commit**

```bash
git add docs/analysis/combat-mechanics.md
git commit -m "feat: add analysis doc - attack enhancement tags"
```

---

### Task 8: 섹션 4b — 타이밍/조건 태그 (개전, 종극, 신속, 주도)

**Files:**
- Modify: `docs/analysis/combat-mechanics.md`

**Step 1: 개전 태그 슬라이드**

개전: 42장, 10캐릭터 — 주요 태그
- 발동 조건, 효과, 캐릭터별 분포, 전략적 의미

**Step 2: 신속 태그 슬라이드**

신속: 28장, 3캐릭터 — 소수 캐릭터에 집중
- 발동 조건, 효과, 해당 캐릭터와의 관계

**Step 3: 주도 태그 슬라이드**

주도: 17장, 6캐릭터
- 발동 조건, 효과, 주요 카드 예시

**Step 4: 종극 태그 (소형 — 1슬라이드 내 포함 가능)**

종극: 1장, 1캐릭터
- 희소 태그로서의 특수성

> **USER INPUT NEEDED**: 개전/신속/주도/종극 발동 타이밍 정확한 설명 필요.

**Step 5: Commit**

```bash
git add docs/analysis/combat-mechanics.md
git commit -m "feat: add analysis doc - timing/condition tags"
```

---

### Task 9: 섹션 4c — 자원 관리 태그 (회수, 소멸, 증발)

**Files:**
- Modify: `docs/analysis/combat-mechanics.md`

**Step 1: 소멸 태그 슬라이드**

소멸: 24장 + 소멸 2(4장), 11캐릭터 — 광범위한 태그
- 발동 조건, 효과, "소멸 2"와의 차이

**Step 2: 증발 태그 슬라이드**

증발: 5장, 2캐릭터
- 발동 조건, 효과, 소멸과의 관계

**Step 3: 회수 태그 (회수 + 회수 4)**

회수: 4장 + 회수 4(1장), 4캐릭터
- 발동 조건, 효과, 자원 재활용 매커니즘

> **USER INPUT NEEDED**: 소멸/증발/회수의 자원 관리 플로우 설명 필요.

**Step 4: Commit**

```bash
git add docs/analysis/combat-mechanics.md
git commit -m "feat: add analysis doc - resource management tags"
```

---

### Task 10: 섹션 4d — 방어/유지 태그 (보존, 천상)

**Files:**
- Modify: `docs/analysis/combat-mechanics.md`

**Step 1: 보존 태그 슬라이드**

보존: 46장, 12캐릭터 — 2번째로 많은 태그
- 발동 조건, 효과, 캐릭터별 분포, 전략적 의미

**Step 2: 천상 태그 슬라이드**

천상: 2장, 1캐릭터
- 발동 조건, 효과, 특수성

> **USER INPUT NEEDED**: 보존/천상의 방어 매커니즘 설명 필요.

**Step 3: Commit**

```bash
git add docs/analysis/combat-mechanics.md
git commit -m "feat: add analysis doc - defense/sustain tags"
```

---

### Task 11: 섹션 4e — 특수 태그 (유일, 탄환)

**Files:**
- Modify: `docs/analysis/combat-mechanics.md`

**Step 1: 유일 태그 슬라이드**

유일: 57장, 14캐릭터 — 가장 많은 태그
- 발동 조건, 효과, 왜 이렇게 많은지 분석
- 캐릭터별 분포 차트

**Step 2: 탄환 태그 슬라이드**

탄환: 1장, 1캐릭터 (Renoa)
- 발동 조건, 효과, 캐릭터 고유 매커니즘

> **USER INPUT NEEDED**: 유일/탄환 태그의 정확한 매커니즘 설명 필요.

**Step 3: Commit**

```bash
git add docs/analysis/combat-mechanics.md
git commit -m "feat: add analysis doc - special tags"
```

---

### Task 12: 섹션 5 — 태그 간 시너지 & 상호작용 (슬라이드 ~26~28)

**Files:**
- Modify: `docs/analysis/combat-mechanics.md`

**Step 1: 태그 시너지 매트릭스 슬라이드**

- 같이 등장하는 태그 조합 빈도 (co-occurrence)
- 강력한 시너지 조합 예시
- 상충하는 조합 (있다면)

데이터: cards.json에서 같은 카드에 2개 이상 태그가 붙은 경우 분석

**Step 2: 캐릭터별 태그 프로필 슬라이드**

- 캐릭터 × 태그 히트맵 (ASCII 테이블 or Marp 테이블)
- 태그 편중도 분석
- 유니크 태그 조합을 가진 캐릭터 식별

**Step 3: Commit**

```bash
git add docs/analysis/combat-mechanics.md
git commit -m "feat: add analysis doc section 5 - tag synergies"
```

---

### Task 13: 섹션 6 — 마무리 (슬라이드 ~29~30)

**Files:**
- Modify: `docs/analysis/combat-mechanics.md`

**Step 1: 분석 요약 & QA 시사점 슬라이드**

내용:
- 핵심 발견 3~5가지 요약
- QA 관점에서 집중 테스트가 필요한 매커니즘
- 태그 시스템의 설계 특성 (밸런스 관점)

**Step 2: Preview 전체 확인**

Run: `npx marp docs/analysis/combat-mechanics.md --preview --theme docs/analysis/czn-dark.css`

모든 슬라이드 순서, 레이아웃, 가독성 확인.

**Step 3: Commit**

```bash
git add docs/analysis/combat-mechanics.md
git commit -m "feat: add analysis doc section 6 - conclusion"
```

---

### Task 14: 최종 빌드 & 출력

**Files:**
- Output: `docs/analysis/combat-mechanics.pdf`
- Output: `docs/analysis/combat-mechanics.pptx`

**Step 1: PDF 빌드**

Run: `npm run slides:pdf`

파일 생성 확인: `docs/analysis/combat-mechanics.pdf`

**Step 2: PPTX 빌드**

Run: `npm run slides:pptx`

파일 생성 확인: `docs/analysis/combat-mechanics.pptx`

**Step 3: .gitignore에 출력물 추가 (선택)**

PDF/PPTX는 빌드 산출물이므로 gitignore 고려:
```
docs/analysis/*.pdf
docs/analysis/*.pptx
```

**Step 4: 최종 Commit**

```bash
git add docs/analysis/ .gitignore
git commit -m "feat: complete combat mechanics analysis document"
```
