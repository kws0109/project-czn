import { readFileSync } from 'fs';

const cards = JSON.parse(readFileSync('src/data/cards.json', 'utf-8'));

// === 기본 통계 ===
const charSet = new Set(cards.map(c => c.id.split('-card-')[0]));
console.log(`=== 기본 통계 ===`);
console.log(`총 카드: ${cards.length}장`);
console.log(`캐릭터: ${charSet.size}명`);
console.log(`캐릭터 목록: ${[...charSet].sort().join(', ')}`);

// === 태그별 통계 ===
const tagStats = {};
cards.forEach(c => {
  const charId = c.id.split('-card-')[0];
  if (c.tags) {
    c.tags.forEach(t => {
      if (!tagStats[t]) tagStats[t] = { count: 0, characters: new Set(), cards: [] };
      tagStats[t].count++;
      tagStats[t].characters.add(charId);
      tagStats[t].cards.push({
        id: c.id,
        name: c.nameKo,
        apCost: c.apCost,
        type: c.type,
        category: c.category
      });
    });
  }
});

console.log(`\n=== 태그 분포 (카드 수 내림차순) ===\n`);
const sorted = Object.entries(tagStats).sort((a, b) => b[1].count - a[1].count);
sorted.forEach(([tag, s]) => {
  console.log(`## ${tag}: ${s.count}장 (${s.characters.size}캐릭터)`);
  console.log(`캐릭터: ${[...s.characters].join(', ')}`);
  console.log('카드:');
  s.cards.forEach(c => console.log(`  - ${c.name} (AP:${c.apCost}, ${c.type}, ${c.category})`));
  console.log('');
});

// === 카드 타입 분포 ===
const types = {};
cards.forEach(c => { types[c.type] = (types[c.type] || 0) + 1; });
console.log(`=== 카드 타입 분포 ===`);
Object.entries(types).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => console.log(`${t}: ${c}장`));

// === 카테고리 분포 ===
const cats = {};
cards.forEach(c => { cats[c.category] = (cats[c.category] || 0) + 1; });
console.log(`\n=== 카테고리 분포 ===`);
Object.entries(cats).forEach(([t, c]) => console.log(`${t}: ${c}장`));

// === AP 코스트 분포 ===
const aps = {};
cards.forEach(c => { aps[c.apCost] = (aps[c.apCost] || 0) + 1; });
console.log(`\n=== AP 코스트 분포 ===`);
Object.entries(aps).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([a, c]) => console.log(`AP ${a}: ${c}장`));

// === 효과 타입 분포 ===
const effs = {};
cards.forEach(c => {
  if (c.effects) c.effects.forEach(e => { effs[e.type] = (effs[e.type] || 0) + 1; });
});
console.log(`\n=== 효과 타입 분포 ===`);
Object.entries(effs).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => console.log(`${t}: ${c}장`));

// === 캐릭터 × 태그 매트릭스 ===
console.log(`\n=== 캐릭터 × 태그 매트릭스 ===\n`);
const allChars = [...charSet].sort();
const allTags = sorted.map(([t]) => t);
console.log('캐릭터,' + allTags.join(','));
allChars.forEach(char => {
  const row = allTags.map(tag => {
    const charCards = tagStats[tag]?.cards.filter(c => c.id.startsWith(char + '-')) || [];
    return charCards.length;
  });
  console.log(char + ',' + row.join(','));
});

// === 태그 공존 분석 ===
console.log(`\n=== 태그 공존 분석 (같은 카드에 2+ 태그) ===\n`);
const coOccurrence = {};
cards.forEach(c => {
  if (c.tags && c.tags.length >= 2) {
    for (let i = 0; i < c.tags.length; i++) {
      for (let j = i + 1; j < c.tags.length; j++) {
        const pair = [c.tags[i], c.tags[j]].sort().join(' + ');
        if (!coOccurrence[pair]) coOccurrence[pair] = { count: 0, cards: [] };
        coOccurrence[pair].count++;
        coOccurrence[pair].cards.push(c.nameKo);
      }
    }
  }
});
if (Object.keys(coOccurrence).length === 0) {
  console.log('태그가 2개 이상인 카드 없음');
} else {
  Object.entries(coOccurrence).sort((a, b) => b[1].count - a[1].count).forEach(([pair, d]) => {
    console.log(`${pair}: ${d.count}장 (${d.cards.join(', ')})`);
  });
}

// === 캐릭터별 태그 프로필 ===
console.log(`\n=== 캐릭터별 태그 프로필 ===\n`);
allChars.forEach(char => {
  const charCards = cards.filter(c => c.id.startsWith(char + '-'));
  const charTags = {};
  charCards.forEach(c => {
    if (c.tags) c.tags.forEach(t => { charTags[t] = (charTags[t] || 0) + 1; });
  });
  const tagList = Object.entries(charTags);
  if (tagList.length > 0) {
    console.log(`${char}: ${tagList.map(([t, n]) => `${t}(${n})`).join(', ')}`);
  }
});
