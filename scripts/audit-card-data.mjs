import fs from 'fs';

const cards = JSON.parse(fs.readFileSync('./src/data/cards.json', 'utf8'));
const chars = JSON.parse(fs.readFileSync('./src/data/characters.json', 'utf8'));

// Build char lookup
const charById = new Map();
chars.forEach(c => charById.set(c.id, c));

console.log('=== 전수검사: 카드 데이터 누락 확인 ===\n');

let issues = 0;

// 1. Check base card mechanics missing from variations
console.log('── 1. 기본 카드 고유 메커니즘 누락 확인 ──');
const mechanicKeywords = ['생성', '소각', '칼날 벼리기', '물결', '주박술', '데시벨', '사냥 개시', '사냥·개시', '흑운태세', '장전', '발리스타', '영감', '구속'];

cards.filter(c => c.variations && c.variations.length > 0).forEach(card => {
  const baseDesc = (card.description || '').replace(/\n/g, ' ');

  mechanicKeywords.forEach(keyword => {
    if (baseDesc.includes(keyword)) {
      card.variations.forEach(v => {
        const vDesc = (v.description || '').replace(/\n/g, ' ');
        if (!vDesc.includes(keyword)) {
          const charId = card.id.split('-card-')[0];
          const char = charById.get(charId);
          console.log(`[${keyword} 누락] ${char?.nameKo || charId} - ${card.name} #${v.variationNumber} (${v.name || card.name})`);
          console.log(`  기본: ${baseDesc}`);
          console.log(`  변형: ${vDesc}`);
          issues++;
        }
      });
    }
  });
});

// 2. Check for suspiciously short variation descriptions (likely truncated)
console.log('\n── 2. 비정상적으로 짧은 바리에이션 (20자 미만) ──');
cards.filter(c => c.variations && c.variations.length > 0).forEach(card => {
  card.variations.forEach(v => {
    const desc = (v.description || '').replace(/\n/g, ' ');
    if (desc.length < 20 && desc.length > 0) {
      const charId = card.id.split('-card-')[0];
      const char = charById.get(charId);
      console.log(`[짧음] ${char?.nameKo || charId} - ${card.name} #${v.variationNumber}: "${desc}" (${desc.length}자)`);
      issues++;
    }
  });
});

// 3. Check for placeholder cards (generic names)
console.log('\n── 3. 플레이스홀더 카드 (실데이터 없음) ──');
cards.forEach(card => {
  if (card.name.includes(' Card ') || card.nameKo.includes(' 카드 ')) {
    const charId = card.id.split('-card-')[0];
    const char = charById.get(charId);
    console.log(`[플레이스홀더] ${char?.nameKo || charId} - ${card.name} (${card.category})`);
    issues++;
  }
});

// 4. Check for empty descriptions
console.log('\n── 4. 빈 description ──');
cards.forEach(card => {
  if (!card.description || card.description.trim() === '') {
    const charId = card.id.split('-card-')[0];
    const char = charById.get(charId);
    console.log(`[빈 desc] ${char?.nameKo || charId} - ${card.name}`);
    issues++;
  }
  if (card.variations) {
    card.variations.forEach(v => {
      if (!v.description || v.description.trim() === '') {
        const charId = card.id.split('-card-')[0];
        const char = charById.get(charId);
        console.log(`[빈 desc] ${char?.nameKo || charId} - ${card.name} #${v.variationNumber}`);
        issues++;
      }
    });
  }
});

// 5. Check base cards with unique text after % that variations might be missing
console.log('\n── 5. 기본 카드 후반부 텍스트 vs 바리에이션 비교 ──');
cards.filter(c => c.variations && c.variations.length > 0).forEach(card => {
  const baseDesc = (card.description || '').replace(/\n/g, ' ');
  // Find text after the last %
  const lastPctIdx = baseDesc.lastIndexOf('%');
  if (lastPctIdx === -1) return;
  const tailText = baseDesc.substring(lastPctIdx + 1).trim();
  if (tailText.length < 5) return; // too short, skip

  // Check if this tail mechanic appears in at least some variations
  const missing = card.variations.filter(v => {
    const vDesc = (v.description || '').replace(/\n/g, ' ');
    // Check if the key mechanic words from tail are present
    const keyWords = tailText.split(/\s+/).filter(w => w.length > 1);
    const found = keyWords.filter(w => vDesc.includes(w));
    return found.length < keyWords.length * 0.3; // less than 30% match
  });

  if (missing.length === card.variations.length) {
    const charId = card.id.split('-card-')[0];
    const char = charById.get(charId);
    console.log(`[전체 누락] ${char?.nameKo || charId} - ${card.name}`);
    console.log(`  기본 후반: "${tailText}"`);
    missing.forEach(v => {
      console.log(`  #${v.variationNumber}: "${(v.description || '').replace(/\n/g, ' ')}"`);
    });
    issues++;
  }
});

console.log(`\n=== 총 ${issues}건 발견 ===`);
