/**
 * Parse special effects from card descriptions and classify into categories.
 *
 * Categories:
 *   A. resource  — 드로우, 버리기, 생성, 회수, 소멸
 *   B. debuff    — 취약, 약화, 사기, 주박/구속
 *   C. combat    — 반격, 격파/강인도, 추가 공격, 표식
 *   D. buff      — 피해량 증가, 비용 감소, 실드 증가
 *   E. character — 진혼의 탄환, 발리스타, 데시벨, 영감, 물결, 앵커, 칼날, 소각
 *
 * Output: src/data/special-effects.json
 */
import fs from 'fs';

const CARDS_PATH = './src/data/cards.json';
const OUTPUT_PATH = './src/data/special-effects.json';

const cards = JSON.parse(fs.readFileSync(CARDS_PATH, 'utf8'));

// ── Classification schema ────────────────────────────────

const SCHEMA = {
  resource: {
    draw:     ['드로우'],
    discard:  ['버리기', '버리고'],
    generate: ['생성'],
    retrieve: ['회수'],
    destroy:  ['소멸'],
  },
  debuff: {
    vulnerable: ['취약'],
    weaken:     ['약화'],
    steal:      ['사기'],
    bind:       ['주박', '구속'],
  },
  combat: {
    counter:     ['반격'],
    break:       ['격파', '강인도'],
    extraAttack: ['추가 공격', '추가공격'],
    targeting:   ['표식'],
  },
  buff: {
    damageUp: ['피해량 증가', '피해량 +', '피해량+'],
    costDown: ['비용 감소', '코스트 감소'],
    shieldUp: ['실드 증가', '실드+', '실드 +'],
  },
  character: {
    bullet:      ['진혼의 탄환'],
    ballista:    ['발리스타'],
    decibel:     ['데시벨'],
    inspiration: ['영감'],
    wave:        ['물결'],
    anchor:      ['앵커'],
    blade:       ['칼날'],
    incinerate:  ['소각'],
  },
};

// ── Helpers ──────────────────────────────────────────────

function classifyText(text) {
  if (!text) return [];
  const found = [];
  for (const [category, effects] of Object.entries(SCHEMA)) {
    for (const [effectKey, keywords] of Object.entries(effects)) {
      for (const kw of keywords) {
        if (text.includes(kw)) {
          found.push({ category, effect: effectKey, keyword: kw });
          break; // one match per effect key
        }
      }
    }
  }
  return found;
}

// ── Main ─────────────────────────────────────────────────

const results = [];

for (const card of cards) {
  const charId = card.id.replace(/-card-\d+$/, '');
  const baseEffects = classifyText(card.description);

  let variationEffects = null;
  if (card.variations && card.variations.length > 0) {
    variationEffects = card.variations.map(v => ({
      number: v.variationNumber,
      effects: classifyText(v.description),
      tags: v.tags || [],
    }));
  }

  // Include card if any description has special effects
  const hasBase = baseEffects.length > 0;
  const hasVar = variationEffects && variationEffects.some(ve => ve.effects.length > 0 || ve.tags.length > 0);
  if (!hasBase && !hasVar) continue;

  results.push({
    cardId: card.id,
    cardName: card.nameKo || card.name,
    characterId: charId,
    category: card.category,
    baseEffects,
    variationEffects,
  });
}

// ── Statistics ───────────────────────────────────────────

// Category + effect frequency (across all descriptions including variations)
const categoryCount = {};
const effectCount = {};
const keywordCount = {};

// Per-character effect profile
const charProfiles = {};

function tally(effects, charId) {
  for (const e of effects) {
    categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;
    const key = `${e.category}.${e.effect}`;
    effectCount[key] = (effectCount[key] || 0) + 1;
    keywordCount[e.keyword] = (keywordCount[e.keyword] || 0) + 1;
    if (!charProfiles[charId]) charProfiles[charId] = {};
    if (!charProfiles[charId][e.category]) charProfiles[charId][e.category] = new Set();
    charProfiles[charId][e.category].add(e.effect);
  }
}

// Count base card descriptions
for (const card of cards) {
  const charId = card.id.replace(/-card-\d+$/, '');
  tally(classifyText(card.description), charId);
  if (card.variations) {
    for (const v of card.variations) {
      tally(classifyText(v.description), charId);
    }
  }
}

// Tag frequency across all variations
const tagFreq = {};
for (const card of cards) {
  for (const t of (card.tags || [])) tagFreq[t] = (tagFreq[t] || 0) + 1;
  if (card.variations) {
    for (const v of card.variations) {
      for (const t of (v.tags || [])) tagFreq[t] = (tagFreq[t] || 0) + 1;
    }
  }
}

// Serialize character profiles (Set→Array)
const charProfilesSerialized = {};
for (const [charId, cats] of Object.entries(charProfiles)) {
  charProfilesSerialized[charId] = {};
  for (const [cat, effects] of Object.entries(cats)) {
    charProfilesSerialized[charId][cat] = [...effects].sort();
  }
}

// Sort maps by frequency
const sortByFreq = obj => Object.fromEntries(Object.entries(obj).sort((a, b) => b[1] - a[1]));

const summary = {
  totalCardsWithEffects: results.length,
  categoryBreakdown: sortByFreq(categoryCount),
  effectBreakdown: sortByFreq(effectCount),
  keywordFrequency: sortByFreq(keywordCount),
  tagFrequency: sortByFreq(tagFreq),
  characterProfiles: charProfilesSerialized,
};

const output = { summary, cards: results };
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

console.log(`special-effects.json: ${results.length} cards with special effects`);
console.log('\n=== Category breakdown ===');
for (const [cat, count] of Object.entries(sortByFreq(categoryCount))) {
  console.log(`  ${cat}: ${count}`);
}
console.log('\n=== Top keywords ===');
for (const [kw, count] of Object.entries(sortByFreq(keywordCount)).slice(0, 15)) {
  console.log(`  ${kw}: ${count}`);
}
console.log('\n=== Tag frequency ===');
for (const [tag, count] of Object.entries(sortByFreq(tagFreq))) {
  console.log(`  ${tag}: ${count}`);
}
