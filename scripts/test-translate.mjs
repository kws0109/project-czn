import fs from 'fs';

const glossary = JSON.parse(fs.readFileSync('./src/data/glossary.json', 'utf8'));

// Build EN→KO replacement map
const replacements = {};
for (const category of Object.values(glossary)) {
  for (const [en, val] of Object.entries(category)) {
    replacements[en] = val.ko;
  }
}

// Sort by length descending for longest-first matching
const sorted = Object.entries(replacements).sort((a, b) => b[0].length - a[0].length);

function translateEffect(text) {
  let result = text;
  for (const [en, ko] of sorted) {
    const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'gi'), ko);
  }
  return result;
}

// Test with sample cards
const prydwen = JSON.parse(fs.readFileSync('./scripts/neutral-cards-prydwen.json', 'utf8'));
const tests = [
  'Overwhelm', 'Aimed Fire', 'Abyssal Bug', 'Iron Wall',
  'Amber Lumen', 'Contaminated Spore', 'Shy Gardener',
  'Precision Aim', 'Forbidden: Portrait of Fury', 'Propagative Virus',
  'Heavy Blow', 'Pierce', 'Rocket Punch'
];

for (const name of tests) {
  const card = prydwen.cards.find(c => c.name === name);
  if (card) {
    console.log(`${name}:`);
    console.log(`  EN: ${card.effect}`);
    console.log(`  →  ${translateEffect(card.effect)}`);
    console.log();
  }
}
