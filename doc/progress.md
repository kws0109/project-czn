# CZN Combat Utility Tool - 개발 진행상황

> 슈퍼크리에이티브 [카오스 제로 나이트메어] 개발QA 포지션 지원용 포트폴리오
> Path of Building(PoE) 스타일의 전투 유틸리티 툴

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 목표 | 면접관이 URL 하나로 확인 가능한 웹 기반 전투 유틸리티 |
| 기술스택 | Next.js 16 + React 19 + TypeScript 5.9 + Tailwind CSS 4.2 |
| 배포 | Vercel (예정) |
| 데이터 소스 | prydwen.gg (실제 게임 데이터 기반 수동 정리) |
| 개발 기간 | 1주일 MVP |

---

## 진행 현황 요약

| 단계 | 상태 | 완료일 |
|------|------|--------|
| Day 1: 프로젝트 셋업 + 데이터 구조 | ✅ 완료 | 2025-02-28 |
| Day 2-3: 전체 데이터 입력 + UI | ✅ 완료 | 2025-03-01 |
| Day 4-5: 계산 엔진 고도화 + 시뮬레이터 | 🔲 예정 | |
| Day 6: QA 밸런스 분석 강화 | 🔲 예정 | |
| Day 7: 폴리싱 + Vercel 배포 | 🔲 예정 | |

---

## Day 1 완료 내역 (2025-02-28)

### 프로젝트 셋업
- Next.js 16.1.6 + TypeScript + Tailwind CSS 프로젝트 생성 및 빌드 확인
- App Router 기반 레이아웃 구성 (다크 테마 기본)
- CSS 변수 기반 테마 시스템 (`globals.css`)

### 타입 시스템 설계 (`types.ts` - 191줄)
- `Character`: 캐릭터 기본 정보 + 스탯 (ATK/DEF/HP base-max, CritChance, CritDamage)
- `Card`: 카드 데이터 (이름, AP Cost, Type, Effects, Tags)
- `CardEffect`: 효과 타입 (damage, buff, debuff, create, discard, draw, heal, shield)
- `SynergyRule`: 속성/클래스/진영별 시너지 규칙
- `TeamSlot`, `SimulationResult`, `BalanceAlert` 등 전체 도메인 모델

### 샘플 데이터 (3캐릭터)
- Renoa (5성, Hunter, Void) - 기본 ATK형 딜러
- Nine (5성, Vanguard, Order) - DEF-based 데미지 캐릭터
- Mika (4성, Controller, Justice) - 4성이지만 T0 티어

### 핵심 엔진 1차 구현
- **calculator.ts**: CZN 실제 데미지 공식 반영
  - ATK-based: `카드배율 × ATK × 0.35 × 모디파이어`
  - DEF-based: `카드배율 × ((ATK×0.3) + (DEF×2.1)) × 0.35 × 모디파이어`
- **simulator.ts**: AP 예산 기반 그리디 시뮬레이션 (카드 효율순 사용)
- **balance.ts**: 스탯 이상치 z-score 분석, 카드 AP 효율 분석

### UI 컴포넌트 구현 (7개)
- TeamSlot, CharacterSelect(필터/검색), DeckBuilder, CardList
- StatPanel, SynergyPanel, BalanceAlert

---

## Day 2-3 완료 내역 (2025-03-01)

### 전체 캐릭터 데이터 입력 완료

**캐릭터 28명** (`characters.json` - 709줄)

| 등급 | 수량 | 캐릭터 |
|------|------|--------|
| 5성 | 17명 | Renoa, Nine, Rin, Yuki, Chizuru, Luke, Orlea, Kayron, Khalipe, Miya, Serina, Tiphera, Lucas, Rei, Magna, Astei, Narja |
| 4성 | 11명 | Mika, Amir, Levi, Maribell, Seo Yeon, Seo Jun, Prim, Lilien, Karin, Abel, Hyun Woo |

**속성 분포:**
- Void: 6명 / Order: 6명 / Instinct: 6명 / Passion: 6명 / Justice: 4명

**클래스 분포:**
- Controller: 7명 / Vanguard: 5명 / Striker: 5명 / Hunter: 4명 / Ranger: 4명 / Psionic: 3명

**진영 분포:**
- Terrascion: 11명 / Stella Familia: 5명 / Wanderer: 4명 / Ironrain: 4명 / Peltion: 3명 / The Holy Crusaders: 1명

### 전체 카드 데이터 입력 완료

**카드 203장** (`cards.json` - 4,660줄)
- 캐릭터당 7장 (Starting 4장 + Epiphany 3장 기본)
- 일부 캐릭터 8장 보유

| 카드 타입 | 수량 |
|-----------|------|
| Attack | 96장 |
| Skill | 89장 |
| Upgrade | 18장 |

### 시너지 규칙 완성

**시너지 20개** (`synergies.json` - 162줄)

| 타입 | 수량 | 예시 |
|------|------|------|
| 속성 시너지 | 8개 | 공허 공명(ATK+10%), 본능 폭주(Crit+15%) |
| 클래스 시너지 | 6개 | 헌터 무리(Crit+10%), 뱅가드 방벽(DEF+15%) |
| 진영 시너지 | 6개 | 테라시온 동맹(ATK+15%), 펠티온 전술(Crit+8%) |

### 버그 수정 및 최적화

1. **치명타 데미지 공식 오류 수정**
   - 문제: `critDamage: 12`를 직접 사용하여 크리티컬 배율이 `1.012`로 거의 무의미
   - 수정: 기본 150% + 보너스 구조로 변경 → `(150 + 12) / 100 = 1.62` 정상 반영
   - 영향 파일: `calculator.ts`, `StatPanel.tsx`, `TeamSlot.tsx`

2. **밸런스 분석 성능 최적화**
   - 문제: `analyzeCardEfficiency()`에서 모든 카드 효율을 내부 루프마다 재계산 (O(n×m))
   - 수정: 효율 계산을 루프 외부로 호이스팅, 평균/표준편차 1회 계산
   - 영향 파일: `balance.ts`

3. **CritDMG 표시값 수정**
   - 문제: TeamSlot에서 보너스값 12%만 표시
   - 수정: `150 + critDamage`로 총 치명타 데미지(162%) 표시

### 브라우저 테스트 검증 완료
- 28캐릭터 전체 렌더링 확인 (필터/검색 동작)
- 시너지 활성화 확인 (Nine + Rin → 방랑자의 자유 +10% ATK)
- 밸런스 탭 22개 이상치 알림 정상 표시
- 시뮬레이션 DPS 계산 정상 동작
- 빌드 성공 (`npm run build` 통과)

---

## 현재 코드베이스 구조

```
src/                          (2,186줄)
├── app/
│   ├── globals.css           (49줄) - 테마 변수 + Tailwind
│   ├── layout.tsx            (33줄) - 글로벌 레이아웃
│   └── page.tsx              (346줄) - 메인 페이지 (탭 UI)
├── components/
│   ├── BalanceAlert.tsx       (66줄) - 밸런스 이상치 경고
│   ├── CardList.tsx          (105줄) - 카드 목록
│   ├── CharacterSelect.tsx   (337줄) - 캐릭터 선택 모달
│   ├── DeckBuilder.tsx        (45줄) - 덱 구성
│   ├── StatPanel.tsx         (236줄) - 스탯 계산 결과
│   ├── SynergyPanel.tsx      (165줄) - 시너지 패널
│   └── TeamSlot.tsx          (114줄) - 팀 슬롯
├── data/
│   ├── characters.json       (709줄) - 28캐릭터
│   ├── cards.json           (4,660줄) - 203카드
│   └── synergies.json        (162줄) - 20시너지
├── hooks/
│   └── useTeamBuilder.ts     (108줄) - 팀 상태 관리
└── lib/
    ├── balance.ts            (170줄) - 밸런스 분석 엔진
    ├── calculator.ts         (115줄) - 데미지 계산 엔진
    ├── simulator.ts          (106줄) - 턴 시뮬레이터
    └── types.ts              (191줄) - 타입 정의
```

**총 소스 코드**: 2,186줄 (TypeScript/TSX/CSS)
**총 데이터**: 5,531줄 (JSON)

---

## 남은 작업 (Day 4-7)

### Day 4-5: 계산 엔진 고도화 + 시뮬레이터
- [ ] 카드별 예상 데미지 표시 (CardList에 계산된 DMG 표시)
- [ ] 시뮬레이터에 버프/디버프 효과 반영
- [ ] 캐릭터 간 DPS 비교 기능
- [ ] 결과 패널 UI 개선 (카드 사용 로그, 턴별 상세)

### Day 6: QA 밸런스 분석 강화
- [ ] 캐릭터별 DPS 이상치 탐지 추가
- [ ] 시너지 가성비 분석 (어떤 시너지가 DPS 증가에 가장 효율적인지)
- [ ] 카드 타입 분포 분석 (Attack/Skill/Defense 비율)
- [ ] QA 관점 코멘트 영역 (밸런스 개선 제안)
- [ ] 이상치 시각화 (바 차트 / 편차 그래프)

### Day 7: 폴리싱 + 배포
- [ ] 반응형 UI 점검 (모바일/태블릿)
- [ ] Vercel 배포
- [ ] 팀 구성 URL 공유 (쿼리 파라미터)
- [ ] 최종 테스트 + 스크린샷

---

## 기술적 결정 사항

### 데미지 공식
CZN 실제 공식 (prydwen.gg 기반):
- **ATK-based**: `카드배율 × Final ATK × 0.35 × 크리티컬 기대값`
- **DEF-based**: `카드배율 × ((Final ATK × 0.3) + (Final DEF × 2.1)) × 0.35 × 크리티컬 기대값`
- **크리티컬 기대값**: `1 + (CritChance/100) × ((150 + CritDmgBonus)/100 - 1)`

### DEF-based 캐릭터 목록
Nine, Khalipe, Magna, Narja, Tiphera, Amir, Maribell
(`traits: ["defBasedDamage"]`로 구분)

### 밸런스 이상치 탐지 기준
- **z-score > 1.5**: 이상치로 판단
- **편차 50% 이상**: CRITICAL
- **편차 25% 이상**: WARNING
- **편차 25% 미만**: INFO

### 시너지 시스템
- 같은 속성/클래스/진영 캐릭터 2명 이상 → 시너지 활성
- 3명 시너지는 별도 상위 보너스 (누적 아닌 교체)
- 잠재 시너지 (1명 부족) 표시로 팀 구성 가이드 제공
