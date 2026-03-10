/**
 * Build variation-changes.json — structured diff between base Epiphany cards and their #1~#5 variations.
 *
 * Tracks: AP cost, card type, damage/shield/heal deltas, tag changes, new special keywords.
 * Output: src/data/variation-changes.json
 */
import fs from 'fs';

const CARDS_PATH = './src/data/cards.json';
const OUTPUT_PATH = './src/data/variation-changes.json';

const cards = JSON.parse(fs.readFileSync(CARDS_PATH, 'utf8'));

// ── Helpers ──────────────────────────────────────────────

/** Sum total damage% (multi-hit multiplied) from effects array */
function getTotalValue(effects, type) {
  if (!effects || effects.length === 0) return 0;
  return effects.reduce((sum, e) => {
    if (e.type === type) return sum + e.value * (e.hits || 1);
    return sum;
  }, 0);
}

/** Get the primary effect type (damage > shield > healing) */
function getPrimaryEffectType(effects) {
  if (!effects || effects.length === 0) return 'none';
  for (const t of ['damage', 'shield', 'healing']) {
    if (effects.some(e => e.type === t)) return t;
  }
  return 'none';
}

/** Extract special mechanic keywords present in varDesc but absent in baseDesc */
function findNewKeywords(varDesc, baseDesc) {
  const keywords = [
    '드로우', '생성', '회수', '소멸',
    '취약', '약화', '사기', '주박', '구속',
    '반격', '격파', '강인도', '추가 공격', '추가공격',
    '표식', '주도', '분쇄', '점화', '천상', '종극',
    '탄환', '발리스타', '데시벨', '영감', '물결', '앵커', '칼날', '소각',
    '개전', '증발', '실드', '치유',
  ];
  return keywords.filter(kw => varDesc.includes(kw) && !baseDesc.includes(kw));
}

// ── Main ─────────────────────────────────────────────────

const results = [];

for (const card of cards) {
  if (!card.variations || card.variations.length === 0) continue;

  const charId = card.id.replace(/-card-\d+$/, '');
  const basePrimary = getPrimaryEffectType(card.effects);
  const baseDmg = getTotalValue(card.effects, 'damage');
  const baseShield = getTotalValue(card.effects, 'shield');
  const baseHeal = getTotalValue(card.effects, 'healing');

  const entry = {
    cardId: card.id,
    cardName: card.nameKo || card.name,
    characterId: charId,
    base: {
      apCost: card.apCost,
      type: card.type,
      primaryEffect: basePrimary,
      damage: baseDmg,
      shield: baseShield,
      healing: baseHeal,
      tags: card.tags || [],
    },
    variations: card.variations.map(v => {
      const varPrimary = getPrimaryEffectType(v.effects);
      const varDmg = getTotalValue(v.effects, 'damage');
      const varShield = getTotalValue(v.effects, 'shield');
      const varHeal = getTotalValue(v.effects, 'healing');

      // Determine effect change category
      let effectChange;
      if (basePrimary !== varPrimary) {
        effectChange = 'typeSwitch'; // e.g. damage→shield
      } else if (basePrimary === 'none' && varPrimary === 'none') {
        effectChange = 'utility'; // no numeric effect on either
      } else {
        // Same primary type — compare values
        const baseVal = basePrimary === 'damage' ? baseDmg : basePrimary === 'shield' ? baseShield : baseHeal;
        const varVal = varPrimary === 'damage' ? varDmg : varPrimary === 'shield' ? varShield : varHeal;
        if (varVal > baseVal) effectChange = 'increased';
        else if (varVal < baseVal) effectChange = 'decreased';
        else effectChange = 'same';
      }

      const baseTags = new Set(card.tags || []);
      const varTags = new Set(v.tags || []);

      return {
        number: v.variationNumber,
        apCost: v.apCost,
        type: v.type,
        description: v.description,
        changes: {
          apCost: v.apCost !== card.apCost ? { from: card.apCost, to: v.apCost } : null,
          type: v.type !== card.type ? { from: card.type, to: v.type } : null,
          effectChange,
          damage: varDmg !== baseDmg ? { from: baseDmg, to: varDmg } : null,
          shield: varShield !== baseShield ? { from: baseShield, to: varShield } : null,
          healing: varHeal !== baseHeal ? { from: baseHeal, to: varHeal } : null,
          tagsAdded: [...varTags].filter(t => !baseTags.has(t)),
          tagsRemoved: [...baseTags].filter(t => !varTags.has(t)),
          newKeywords: findNewKeywords(v.description, card.description || ''),
        },
      };
    }),
  };

  results.push(entry);
}

// ── Summary statistics ───────────────────────────────────

const summary = {
  totalCards: results.length,
  totalVariations: results.reduce((s, r) => s + r.variations.length, 0),
  apChanges: { increased: 0, decreased: 0, same: 0 },
  typeChanges: { total: 0, breakdown: {} },
  effectChanges: { increased: 0, decreased: 0, same: 0, typeSwitch: 0, utility: 0 },
  tagActivity: { totalAdded: 0, totalRemoved: 0, uniqueTagsAdded: new Set() },
  topNewKeywords: {},
};

for (const r of results) {
  for (const v of r.variations) {
    const c = v.changes;

    // AP
    if (!c.apCost) summary.apChanges.same++;
    else if (c.apCost.to > c.apCost.from) summary.apChanges.increased++;
    else summary.apChanges.decreased++;

    // Type
    if (c.type) {
      summary.typeChanges.total++;
      const key = `${c.type.from}→${c.type.to}`;
      summary.typeChanges.breakdown[key] = (summary.typeChanges.breakdown[key] || 0) + 1;
    }

    // Effects
    summary.effectChanges[c.effectChange]++;

    // Tags
    summary.tagActivity.totalAdded += c.tagsAdded.length;
    summary.tagActivity.totalRemoved += c.tagsRemoved.length;
    for (const t of c.tagsAdded) summary.tagActivity.uniqueTagsAdded.add(t);

    // Keywords
    for (const kw of c.newKeywords) {
      summary.topNewKeywords[kw] = (summary.topNewKeywords[kw] || 0) + 1;
    }
  }
}

// Convert Set to array for JSON serialization
summary.tagActivity.uniqueTagsAdded = [...summary.tagActivity.uniqueTagsAdded].sort();

// Sort keywords by frequency
summary.topNewKeywords = Object.fromEntries(
  Object.entries(summary.topNewKeywords).sort((a, b) => b[1] - a[1])
);

const output = { summary, cards: results };
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

console.log(`variation-changes.json: ${results.length} cards, ${summary.totalVariations} variations`);
console.log('\n=== Summary ===');
console.log(`AP changes — increased: ${summary.apChanges.increased}, decreased: ${summary.apChanges.decreased}, same: ${summary.apChanges.same}`);
console.log(`Type changes — total: ${summary.typeChanges.total}`, summary.typeChanges.breakdown);
console.log(`Effect changes — increased: ${summary.effectChanges.increased}, decreased: ${summary.effectChanges.decreased}, same: ${summary.effectChanges.same}, typeSwitch: ${summary.effectChanges.typeSwitch}, utility: ${summary.effectChanges.utility}`);
console.log(`Tags — added: ${summary.tagActivity.totalAdded}, removed: ${summary.tagActivity.totalRemoved}`);
console.log('Top new keywords:', summary.topNewKeywords);
