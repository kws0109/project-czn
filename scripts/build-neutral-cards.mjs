/**
 * Build neutral cards data by merging Prydwen (English) + Namu Wiki (Korean) sources.
 * Output: src/data/neutral-cards.json
 */
import fs from 'fs';

const prydwen = JSON.parse(fs.readFileSync('./scripts/neutral-cards-prydwen.json', 'utf8'));
const glossary = JSON.parse(fs.readFileSync('./src/data/glossary.json', 'utf8'));

// Build keyword extraction maps from glossary
const EN_KEYWORDS = {}; // English keyword → glossary key
const KO_KEYWORDS = {}; // Korean keyword → glossary key
for (const [category, entries] of Object.entries(glossary)) {
  for (const [en, val] of Object.entries(entries)) {
    EN_KEYWORDS[en.toLowerCase()] = en;
    KO_KEYWORDS[val.ko] = en;
  }
}
// Sort by length descending for longest-first matching
const enSorted = Object.keys(EN_KEYWORDS).sort((a, b) => b.length - a.length);
const koSorted = Object.keys(KO_KEYWORDS).sort((a, b) => b.length - a.length);

function extractKeywords(effectEn, effectKo) {
  const found = new Set();
  // Extract from English text
  if (effectEn) {
    const lower = effectEn.toLowerCase();
    for (const en of enSorted) {
      if (lower.includes(en)) found.add(EN_KEYWORDS[en]);
    }
  }
  // Extract from Korean text
  if (effectKo) {
    for (const ko of koSorted) {
      if (effectKo.includes(ko)) found.add(KO_KEYWORDS[ko]);
    }
  }
  return [...found].sort();
}

// Korean name mapping from namu wiki scraping (English → Korean)
const KO_NAMES = {
  // === 일반 (Common) ===
  // 공격
  'Overwhelm': '압도',
  'Quickdraw': '퀵드로우',
  'Hidden Bullet': '비장의 한 발',
  'Leap Attack': '도약 공격',
  'Skull Bash': '두개골 강타',
  'Consecutive Attack': '연속 공격',
  'Destruction': '파멸',
  'Spiked Shield': '가시 방패',
  'Heavy Bash': '무거운 강타',
  'Shock': '충격',
  'Devotion': '혼신',
  'Rage': '격분',
  'Tackle': '태클',
  // 스킬
  'Attack!': '공격하라!',
  'Rally': '집결',
  'Protective Shout': '보호의 외침',
  'Counterattack Preparation': '반격 준비',
  'Repent': '참회',
  'Tactical Reformation': '전략의 재구성',
  'Fortitude': '견고함',
  'Negotiate': '협상',
  'Acid Gas': '산성 가스',
  'Wind of Relief': '해소의 바람',
  'Financial Therapy': '금융 치료',
  'Sadism': '가학성',
  'Relentless Endurance': '집요한 인내',
  'First Aid Kit': '구급 키트',
  // 강화
  'Arcane Rush': '마력 폭주',
  'Instinct Ignition': '직감 점화',
  'Determination': '각오',
  'Glorious Resistance': '영광의 저항',

  // === 희귀 (Rare) ===
  // 공격
  'Quick Shelling': '빠른 연사',
  'Maneuvering Fire': '기동 사격',
  'Ambush': '기습',
  'Hand-to-Hand Combat': '육탄전',
  'Sacred Strike': '신성한 일격',
  'Muscle-Enhanced Evolver': '근육 강화 진화체',
  'Atomic Decomposition': '원자 분해',
  'Deadly Shot': '필살의 사격',
  'Propagative Virus': '증식형 바이러스',
  // 스킬
  'Wanderer of the Void': '공허의 방랑자',
  'Energy Barrier': '에너지 보호막',
  'Recycling': '재활용',
  'Aggressive Mutant': '공격성 돌연변이',
  'Shell-Forming Cell': '껍질 형성 세포',
  'Strategic Starting Point': '전략의 시작점',
  'Knowledge of Darkness': '어둠의 지식',
  'Somnolent Fruit': '수면 열매',
  'Camouflage': '카모플라쥬',
  // 강화
  'Iron Wall': '철벽',
  'Tactical Action': '전술 대응',
  'Self-Generating Experiment': '자가 발전 실험',
  'Forced Learning Apparatus': '강제 학습 장치',

  // === 전설 (Legendary) ===
  'Precision Aim': '정밀 조준',
  'Aimed Fire': '조준 사격',
  'Pulverize': '짓이기기',
  'Belligerence': '호전성',
  'Confiscation': '압류',
  'Prepare for Battle': '전투 준비',
  'Gear Bag': '장비 가방',
  'Reorganize': '재정비',
  'Forbidden Algorithm': '금지된 알고리즘',

  // === 금기 (Forbidden) ===
  'Forbidden: Portrait of Fury': '금기 : 분노의 초상',
  'Forbidden: Ecstasy of Violence': '금기 : 폭력의 환희',
  'Forbidden: Gesture of Freedom': '금기 : 자유의 손짓',
  'Forbidden: Eternal Hunger': '금기 : 영생의 허기',
  'Forbidden: Disposable Ego': '금기 : 일회용 자아',
  'Forbidden: Engraved Malice': '금기 : 새겨진 악의',
  'Forbidden: Guidance of Falling': '금기 : 허무의 인도',

  // === 몬스터 (Monster) ===
  'Shy Gardener': '수줍은 정원사',
  'Sorrowful Godfather': '음울한 대부',
  'Slaughter': '슬로터',
  'Beam Shooter': '빔슈터',
  'Winged Humanoid Beast': '날개 인면수',
  'Wolves Bane': '울브즈 베인',
  'Dark Grip': '어둠 손아귀',
  'Seraphim of Pain': '고통의 치천사',
  'Abyssal Bug': '나락충',
  'Trapper': '트래퍼',
  'Cultist Arbiter': '컬티스트 아비터',
  'Rotten Ripper': '로튼 리퍼',
  'Chilling Godfather': '서늘한 대부',
  'Hunger of the Void': '공허의 굶주림',
  'Gloomy Godmother': '음산한 대모',
  'Automata Cavalry': '오토마타 카발리',
  'Evil Spirit Salamander': '악령 샐러맨더',
  'Elemental Phoenix': '정령 피닉스',
  'Spirit Kefox': '정령 캐폭스',
  'Arbitum': '알비툼',
  'Shell Bug': '갑각충',
  'Soldier Prime': '솔저 프라임',
  'Hunger of Loss': '상실의 굶주림',
  'Dominion': '도미니온',
  'Evil Spirit Dullahan': '악령 듀라한',
  'Seven Arms': '세븐 암즈',

  // === 시즌 (Season) — 루멘 ===
  'Amber Lumen': '노란 루멘',
  'Azure Lumen': '푸른 루멘',
  'Broken Ebony Lumen': '부서진 검은 루멘',
  'Crimson Lumen': '붉은 루멘',
  'Ebony Lumen': '검은 루멘',
  'Fragments of Ebony Lumen': '검은 루멘의 파편',

  // === 시즌 (Season) — 포자 ===
  'Contaminated Spore': '오염된 포자',
  'Mushroom Ammo': '버섯 탄환',
  'Spore Harvester': '포자 채집기',
  'Nature\'s Gift': '자연의 선물',
  'Forgotten Grave': '잊혀진 무덤',

  // === 시즌 (Season) — 저주 ===
  'Blissful Oblivion': '행복한 망각',
  'Fracturing Memories': '파편화된 기억들',

  // === 시즌 (Season) — 기타 ===
  'Charged Strike': '충전된 일격',
  'Forest\'s Hunger': '숲의 굶주림',
  'Forgotten Sword': '잊혀진 검',
  'Heavy Blow': '묵직한 타격',
  'Judgement': '심판',
  'Nutrient Absorption': '양분 흡수',
  'One with All': '물아일체',
  'Pierce': '꿰뚫기',
  'Residual Herb': '잔상초',
  'Rocket Punch': '로켓 펀치',
  'Shield Blast': '방패 폭발',

  // === 미분류 ===
  'Counterattack Preperation': '반격 준비',  // prydwen 오타
  'HA-00': 'HA-00',

  // === 시즌 몬스터 ===
  'Cyborg Automaton': '사이보그 오토마톤',
  'Vine Lord': '바인 로드',
};

// Korean effect text mapping (English card name → Korean effect description)
// Source: 나무위키 카오스 제로 나이트메어/중립 카드 (2026-02-08)
const KO_EFFECTS = {
  // === 일반 (Common) — 공격 ===
  'Overwhelm': '모든 적 피해 100% × 3\n뽑을 카드에 과부하 2장 생성',
  'Quickdraw': '피해 150%\n표식 1',
  'Hidden Bullet': '피해 100%\n보존: 피해량 +50%',
  'Leap Attack': '피해 200%\n영감: 비용 1 감소, 드로우 1',
  'Skull Bash': '피해 200%\n약점 공격: 피해량 +50%',
  'Consecutive Attack': '피해 50% x 3',
  'Destruction': '피해 300%\n버리기 1',
  'Spiked Shield': '모든 적 방어 기반 피해 100%\n파괴: 타격 1회 추가',
  'Heavy Bash': '피해 200%\n취약 2, 약화 2',
  'Shock': '모든 적 피해 200%\n취약 2',
  'Devotion': '방어 기반 피해 100% x 2\n결의 수만큼 피해량 +20%',
  'Rage': '피해 300%\n핸드에 다른 전투원의 카드가 없다면 이 카드 비용 2 감소',
  'Tackle': '방어 기반 피해 400%\n체력이 가득 찬 상태라면 이 카드 비용 1 감소',
  // === 일반 (Common) — 스킬 ===
  'Attack!': '뽑을 카드의 공격 카드 1장 선택, 그 카드 핸드로 이동',
  'Rally': '드로우 1\n모든 적 행동 카운트 3 증가',
  'Protective Shout': '실드 130%\n실드가 없다면 실드 100% 증가',
  'Counterattack Preparation': '에고 스킬 슬롯을 다른 에고 스킬들로 교체',
  'Repent': '사기 1 감소\n결의 1 감소',
  'Tactical Reformation': '다음 사용하는 에고 스킬의 비용 1 감소',
  'Fortitude': '실드 150%\n연속 : 다음 턴 시작 시 실드 150%',
  'Negotiate': '사기 2\n모든 적 사기 2',
  'Acid Gas': '모든 적 손상 3',
  'Wind of Relief': '모든 적 고통 2\n핸드의 상태이상, 저주 카드 2장 까지 선택 소멸',
  'Financial Therapy': '치유 200%\n체력이 가득 찬 상태라면 크레딧 30 획득',
  'Sadism': '모든 적 취약 1\n핸드의 무작위 공격 카드 1장 1턴간 비용 1 감소',
  'Relentless Endurance': '실드 350%',
  'First Aid Kit': '치유 200%',
  // === 일반 (Common) — 강화 ===
  'Arcane Rush': '면역 2',
  'Instinct Ignition': '카드 생성 시 무작위 번뜩임 부여\n(턴당 1회)',
  'Determination': '턴 시작 시 핸드의 무작위 공격 카드 1장 1턴간 피해량 +50%',
  'Glorious Resistance': '턴 시작 시 아군에게 최대 체력 10% 고정 피해\n행동 포인트 1 획득',

  // === 희귀 (Rare) — 공격 ===
  'Quick Shelling': '피해 80%\n드로우 1',
  'Maneuvering Fire': '모든 적 피해 200%',
  'Ambush': '피해 80%\n격파 시 이 카드를 무덤에서 핸드로 이동',
  'Hand-to-Hand Combat': '방어 기반 피해 200%\n결정화 2',
  'Sacred Strike': '피해 200%\n강인도 피해 2',
  'Muscle-Enhanced Evolver': '피해 80% × 2\n영감 : 타격 2회 추가',
  'Atomic Decomposition': '모든 적 관통 피해 230%',
  'Deadly Shot': '피해 350%\n다음 턴 시작 시 드로우 1',
  'Propagative Virus': '피해 120% x 1\n감응 : 타격 1회 추가 (최대 5 중첩)',
  // === 희귀 (Rare) — 스킬 ===
  'Wanderer of the Void': '1턴간 대상의 행동 카운트 감소하지 않음',
  'Energy Barrier': '실드 100%\n행동 포인트 1 획득',
  'Recycling': '에고 포인트 2 이상일 시 행동 포인트 1 획득, 에고 포인트 2 감소',
  'Aggressive Mutant': '자신의 공격 카드 드로우 1, 1턴간 그 카드 피해량 +50%',
  'Shell-Forming Cell': '실드 70%\n핸드의 카드 수만큼 실드 +25%',
  'Strategic Starting Point': '에고 포인트 2 획득',
  'Knowledge of Darkness': '드로우 1\n그 카드 발동',
  'Somnolent Fruit': '무작위 전투원 스트레스 5 감소',
  'Camouflage': '회피 1\n다음 턴 드로우 2',
  // === 희귀 (Rare) — 강화 ===
  'Iron Wall': '결의 1\n불굴 1',
  'Tactical Action': '실드를 보유한 대상에게 피해량 25% 증가 (최대 1)',
  'Self-Generating Experiment': '핸드의 카드가 6장 이상일 시 핸드의 무작위 카드 1장 1턴간 비용 0으로 변경\n(턴당 1회)',
  'Forced Learning Apparatus': '카드 4장 사용 시 드로우 1 (턴 당 1회)',

  // === 전설 (Legendary) ===
  'Precision Aim': '피해 120%\n드로우 1\n핸드의 카드 1장 선택, 그 카드 뽑을 카드 맨 위로 이동',
  'Aimed Fire': '피해 400%\n처치 : 크레딧 20 획득',
  'Pulverize': '피해 150% × 2\n드로우 1',
  'Belligerence': '핸드에 공격 카드가 없을 시 드로우 2',
  'Confiscation': '드로우 1\n뽑을 카드 혹은 버린 카드에서 무작위 금기 카드 1장 핸드로 이동',
  'Prepare for Battle': '무작위 델랑 상점 카드 1장 생성\n1턴간 그 카드의 비용 0으로 변경',
  'Gear Bag': '드로우 2',
  'Reorganize': '드로우 3',
  'Forbidden Algorithm': '핸드에 무작위 금기 카드 1장 생성',

  // === 금기 (Forbidden) ===
  'Forbidden: Portrait of Fury': '피해 70% × 1\n핸드의 카드 4 장당 타격 1회 추가\n타격횟수 만큼 드로우 1',
  'Forbidden: Ecstasy of Violence': '피해 150% × 4\n능력으로 드로우 시 이 카드 비용 1 감소',
  'Forbidden: Gesture of Freedom': '핸드의 무작위 카드 1장 비용 1 감소',
  'Forbidden: Eternal Hunger': '감응 : 드로우 1, 행동 포인트 1 획득',
  'Forbidden: Disposable Ego': '드로우 1, 그 카드 비용만큼 드로우',
  'Forbidden: Engraved Malice': '드로우 1\n핸드의 무작위 카드 발동 2',
  'Forbidden: Guidance of Falling': '능력으로 드로우 시 치유 40%, 무작위 전투원 스트레스 1 감소',

  // === 시즌 (Season) — 루멘 ===
  'Amber Lumen': '',  // TODO: 인게임 확인
  'Azure Lumen': '',
  'Broken Ebony Lumen': '',
  'Crimson Lumen': '',
  'Ebony Lumen': '',
  'Fragments of Ebony Lumen': '',
  // === 시즌 (Season) — 포자 ===
  'Contaminated Spore': '포자증식 1\n보존 : 오염된 포자 1장 생성',
  'Mushroom Ammo': '피해 450%\n포자증식 효과 2배',
  'Spore Harvester': '소각 : 오염된 포자 2장 생성\n보존 : 오염된 포자 1장 생성',
  'Nature\'s Gift': '핸드의 카드 소멸 수만큼 치유\n20%\n조율 : 핸드읭 카드 수 만큼\n오염된 포자 1장 생성',
  'Forgotten Grave': '이 카드 비용 감소 시 1턴간\n자신의 치명확률 + 10%\n소각 : 오염된 포자 1장 생성',
  // === 시즌 (Season) — 저주 ===
  'Blissful Oblivion': '',
  'Fracturing Memories': '',
  // === 시즌 (Season) — 기타 ===
  'Charged Strike': '방어 기반 피해 100%, 행동\n포인트만큼 피해 + 100%\n소각 : 이 카드 발동',
  'Forest\'s Hunger': '방어 기반 피해 300%\n핸드의 소멸 카드 모두 소멸,\n그 수만큼 피해량 +25%',
  'Forgotten Sword': '모든 종류의 투기장 카드\n생성 시 이 카드 심판으로\n교체',
  'Heavy Blow': '피해 200%\n취약 효과 2배',
  'Judgement': '피해 1000%\n강인도 피해 10',
  'Nutrient Absorption': '핸드의 카드 1장 선택 소멸\n그 카드 비용만큼 핸드의\n무작위 카드 1장 1턴간 사용\n시까지 비용 1 감소',
  'One with All': '핸드와 뽑을 카드와 버린\n카드에서 1장 선택 발동\n1턴간 카드로 피해, 실드,\n치유 모두 발동 시 사용불가\n제거',
  'Pierce': '피해 200%\n취약 1\n약화 1\n고통 1',
  'Residual Herb': '실드 60%\n소각 : 오염된 포자 1장 생성',
  'Rocket Punch': '피해 400%\n보존 : 발동 확률 +25%,\n25% 확률로 이 카드 발동',
  'Shield Blast': '모든 적 방어 기반 피해\n150%',

  // === 미분류 ===
  'Counterattack Preperation': '에고 스킬 슬롯을 다른 에고 스킬들로 교체',  // prydwen 오타 (Preparation 중복)
  'HA-00': '무작위 적들에게 피해 100% x 4\n타격한 대상에게 취약 1 또는 약화 1',

  // === 시즌 몬스터 ===
  'Cyborg Automaton': '방어 기반 피해 600%\n소각 : 이 카드 발동',
  'Vine Lord': '자신의 소멸 카드 드로우 2',

  // === 몬스터 (Monster) ===
  'Shy Gardener': '피해 50% × 4\n표식 3',
  'Sorrowful Godfather': '피해 50% x 4\n고통 6',
  'Slaughter': '실드 200%\n획득한 실드만큼 모든 적 피해',
  'Beam Shooter': '피해 350%\n대상이 실드를 보유하면 피해량 +50%',
  'Winged Humanoid Beast': '무작위 적들에게 피해 50% × 5',
  'Wolves Bane': '모든 적 피해 120%\n약화 2\n손상 2',
  'Dark Grip': '피해 120% × 2\n처치 : 무작위 적들에게 약화 120% × 2',
  'Seraphim of Pain': '피해 250%\n핸드에 이 카드만 있다면 비용 2 감소',
  'Abyssal Bug': '사기 1 감소\n결의 3 감소',
  'Trapper': '실드 120%, 취약 1\n대상이 행동하지 않았다면 실드 획득량 +120%, 취약 1 추가',
  'Cultist Arbiter': '실드 140%\n다음 턴 시작 시 모든 적 행동 카운트 2 증가',
  'Rotten Ripper': '피해 160%\n행동 카운트 1 증가',
  'Chilling Godfather': '뽑을 카드 맨 아래의 카드 1장 발동\n핸드의 카드 1장 선택, 그 카드 뽑을 카드 맨 아래로 이동',
  'Hunger of the Void': '사기 2\n사기 2 감소',
  'Gloomy Godmother': '턴 종료 시 무작위 적들에게 피해 200%',
  'Automata Cavalry': '피해 150%\n취약 4',
  'Evil Spirit Salamander': '드로우 4',
  'Elemental Phoenix': '결의 2\n감소한 체력만큼 실드 획득',
  'Spirit Kefox': '뽑을 카드에서 1장 선택 드로우, 그 카드에 회수 부여',
  'Arbitum': '받는 피해량 -15% (턴당 1회)',
  'Shell Bug': '결정화 5',
  'Soldier Prime': '피해 300%\n격파 시 행동 포인트 2 획득',
  'Hunger of Loss': '드로우 1\n핸드의 카드가 없다면 드로우 4 추가',
  'Dominion': '턴 시작 시 사기 1',
  'Evil Spirit Dullahan': '타게팅 공격 카드 사용 시 대상에게 고통 1',
  'Seven Arms': '피해 120%\n대상의 행동 카운트 5 이상일 시 행동 포인트 2 획득',
};

// Rarity mapping (from namu wiki categorization)
const RARITY_MAP = {
  // Common
  'Overwhelm': 'Common', 'Quickdraw': 'Common', 'Hidden Bullet': 'Common',
  'Leap Attack': 'Common', 'Skull Bash': 'Common', 'Consecutive Attack': 'Common',
  'Destruction': 'Common', 'Spiked Shield': 'Common', 'Heavy Bash': 'Common',
  'Shock': 'Common', 'Devotion': 'Common', 'Rage': 'Common', 'Tackle': 'Common',
  'Attack!': 'Common', 'Rally': 'Common', 'Protective Shout': 'Common',
  'Counterattack Preparation': 'Common', 'Repent': 'Common',
  'Tactical Reformation': 'Common', 'Fortitude': 'Common', 'Negotiate': 'Common',
  'Acid Gas': 'Common', 'Wind of Relief': 'Common', 'Financial Therapy': 'Common',
  'Sadism': 'Common', 'Relentless Endurance': 'Common', 'First Aid Kit': 'Common',
  'Arcane Rush': 'Common', 'Instinct Ignition': 'Common',
  'Determination': 'Common', 'Glorious Resistance': 'Common',
  // Rare
  'Quick Shelling': 'Rare', 'Maneuvering Fire': 'Rare', 'Ambush': 'Rare',
  'Hand-to-Hand Combat': 'Rare', 'Sacred Strike': 'Rare',
  'Muscle-Enhanced Evolver': 'Rare', 'Atomic Decomposition': 'Rare',
  'Deadly Shot': 'Rare', 'Propagative Virus': 'Rare',
  'Wanderer of the Void': 'Rare', 'Energy Barrier': 'Rare', 'Recycling': 'Rare',
  'Aggressive Mutant': 'Rare', 'Shell-Forming Cell': 'Rare',
  'Strategic Starting Point': 'Rare', 'Knowledge of Darkness': 'Rare',
  'Somnolent Fruit': 'Rare', 'Camouflage': 'Rare',
  'Iron Wall': 'Rare', 'Tactical Action': 'Rare',
  'Self-Generating Experiment': 'Rare', 'Forced Learning Apparatus': 'Rare',
  // Legendary
  'Precision Aim': 'Legendary', 'Aimed Fire': 'Legendary', 'Pulverize': 'Legendary',
  'Belligerence': 'Legendary', 'Confiscation': 'Legendary',
  'Prepare for Battle': 'Legendary', 'Gear Bag': 'Legendary',
  'Reorganize': 'Legendary', 'Forbidden Algorithm': 'Legendary',
  // Forbidden
  'Forbidden: Portrait of Fury': 'Forbidden', 'Forbidden: Ecstasy of Violence': 'Forbidden',
  'Forbidden: Gesture of Freedom': 'Forbidden', 'Forbidden: Eternal Hunger': 'Forbidden',
  'Forbidden: Disposable Ego': 'Forbidden', 'Forbidden: Engraved Malice': 'Forbidden',
  'Forbidden: Guidance of Falling': 'Forbidden',
};

// Tag Korean mapping (from 나무위키)
const TAG_KO = {
  'Exhaust': '소멸',
  'Exhaust 2': '소멸 2',
  'Exhaust 3': '소멸 3',
  'Retain': '보존',
  'Initiation': '개전',
  'Haste': '신속',
  'Lead': '주도',
  'Celestial': '천상',
  'Finale': '종극',
  'Retrieve': '회수',
  'Retrieve 2': '회수 2',
  'Pulverize': '분쇄',
  'Combo': '연계',
  'Weakness Attack': '약점 공격',
  'Ephemeral': '제거',
  'Unusable': '사용불가',
  'Ignition': '점화',
  'Bullet': '탄환',
  'Forbidden': '금기',
};

// Class restriction Korean mapping (from 나무위키)
const CLASS_RESTRICTION_KO = {
  'Ranger, Hunter only': '레인저 직업 전용, 헌터 직업 전용',
  'Striker, Vanguard only': '스트라이커 직업 전용, 뱅가드 직업 전용',
  'Psionic, Controller only': '사이오닉 직업 전용, 컨트롤러 직업 전용',
};

// Build merged cards
const cards = prydwen.cards.map(c => {
  const nameEn = c.name;
  const nameKo = KO_NAMES[nameEn] || null;
  const effectKo = KO_EFFECTS[nameEn] || null;
  const rarity = RARITY_MAP[nameEn] || (c.category === 'Monster' ? 'Monster' : null);

  // Normalize card type (fix prydwen typos)
  let type = c.cardType.replace(/\s*\|\s*Season/, '').trim();
  if (type === 'Skilll') type = 'Skill'; // typo fix
  const isSeason = c.cardType.includes('Season');

  // Parse AP cost
  let apCost = parseInt(c.apCost);
  if (isNaN(apCost)) apCost = null; // special activation cards

  // Parse tags
  const tags = c.tags
    ? c.tags.match(/\[([^\]]+)\]/g)?.map(t => t.replace(/[[\]]/g, '')) || []
    : [];

  const classRestriction = c.classRestriction === 'No Class restrictions' ? null : c.classRestriction;
  const classRestrictionKo = classRestriction ? (CLASS_RESTRICTION_KO[classRestriction] || null) : null;

  return {
    nameEn,
    nameKo,
    apCost,
    type,
    rarity,
    category: c.category,
    isSeason,
    tags,
    tagsKo: tags.map(t => TAG_KO[t] || t),
    effect: c.effect,
    effectKo,
    effectKeywords: extractKeywords(c.effect, effectKo),
    classRestriction,
    classRestrictionKo,
  };
});

// Stats
const neutral = cards.filter(c => c.category === 'Neutral');
const monster = cards.filter(c => c.category === 'Monster');
const season = cards.filter(c => c.isSeason);
const withKo = cards.filter(c => c.nameKo);

function typeCount(arr) {
  const a = arr.filter(c => c.type === 'Attack').length;
  const s = arr.filter(c => c.type === 'Skill').length;
  const u = arr.filter(c => c.type === 'Upgrade').length;
  const o = arr.length - a - s - u;
  return { Attack: a, Skill: s, Upgrade: u, Other: o, total: arr.length };
}

const summary = {
  total: cards.length,
  neutralCount: neutral.length,
  monsterCount: monster.length,
  seasonCount: season.length,
  koreanNameCoverage: `${withKo.length}/${cards.length}`,
  typeDistribution: {
    all: typeCount(cards),
    neutral: typeCount(neutral),
    monster: typeCount(monster),
  },
  rarityDistribution: {},
};

for (const c of cards) {
  const r = c.rarity || 'Unknown';
  summary.rarityDistribution[r] = (summary.rarityDistribution[r] || 0) + 1;
}

const output = { summary, cards };
fs.writeFileSync('./src/data/neutral-cards.json', JSON.stringify(output, null, 2));

console.log(`neutral-cards.json: ${cards.length} cards`);
console.log(`  Neutral: ${neutral.length}, Monster: ${monster.length}, Season: ${season.length}`);
console.log(`  Korean names: ${withKo.length}/${cards.length}`);
console.log('\nType distribution (all):');
console.log(`  Attack: ${typeCount(cards).Attack}, Skill: ${typeCount(cards).Skill}, Upgrade: ${typeCount(cards).Upgrade}, Other: ${typeCount(cards).Other}`);
console.log('\nRarity:');
for (const [r, n] of Object.entries(summary.rarityDistribution)) {
  console.log(`  ${r}: ${n}`);
}
