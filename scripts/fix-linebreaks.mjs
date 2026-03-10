import fs from 'fs';

const cards = JSON.parse(fs.readFileSync('./src/data/cards.json', 'utf8'));

function addLineBreaks(desc) {
  if (!desc) return desc;
  // After %, add newline if followed by space or comma+space + new effect
  // Exclude: '% x' (multi-hit), '% 증가', '% 감소' (modifiers continuing same effect)
  return desc
    .replace(/%,\s+/g, '%\n')
    .replace(/% (?!x\s*\d|증가|감소|이상)/g, '%\n');
}

let changed = 0;
cards.forEach(c => {
  const orig = c.description;
  c.description = addLineBreaks(c.description);
  if (c.description !== orig) changed++;
  if (c.variations) {
    c.variations.forEach(v => {
      const origV = v.description;
      v.description = addLineBreaks(v.description);
      if (v.description !== origV) changed++;
    });
  }
});

fs.writeFileSync('./src/data/cards.json', JSON.stringify(cards, null, 2));
console.log('Changed:', changed, 'descriptions');

// Show examples
console.log('---');
const samples = ['노련한 일격', '파쇄', '칠흑의 송시', '즉결 심판'];
samples.forEach(name => {
  const c = cards.find(x => x.name === name);
  if (c) {
    console.log(name + ':', JSON.stringify(c.description));
    if (c.variations && c.variations[0]) {
      console.log('  #1:', JSON.stringify(c.variations[0].description));
    }
  }
});
