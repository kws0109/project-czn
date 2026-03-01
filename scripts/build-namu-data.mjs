/**
 * Build final cards.json and update characters.json from scraped namu wiki data.
 *
 * - 20 scraped characters get real card data + namu wiki card images
 * - 8 failed characters keep placeholder cards (no images)
 * - Card IDs: {charId}-card-{1-based index}
 * - Image mapping: 일반카드 → Starting cards, 고유카드 → Epiphany cards
 */
import fs from 'fs';

const SCRAPED_PATH = './scripts/all-scraped-data.json';
const CHARS_PATH = './src/data/characters.json';
const CARDS_PATH = './src/data/cards.json';

const scrapedData = JSON.parse(fs.readFileSync(SCRAPED_PATH, 'utf8'));
const characters = JSON.parse(fs.readFileSync(CHARS_PATH, 'utf8'));

// 8 failed characters that have no namu wiki data
const FAILED_CHARS = ['kayron', 'khalipe', 'narja', 'orlea', 'sereniel', 'tiphera', 'cassius', 'tressa'];

const allCards = [];

for (const char of characters) {
  const charId = char.id;
  const scraped = scrapedData[charId];

  if (!scraped) {
    // Failed character - keep 7 placeholder cards
    const cardIds = [];
    for (let i = 1; i <= 7; i++) {
      const cardId = `${charId}-card-${i}`;
      cardIds.push(cardId);
      allCards.push({
        id: cardId,
        name: `${char.name} Card ${i}`,
        nameKo: `${char.nameKo} 카드 ${i}`,
        category: i <= 2 ? 'Starting' : 'Epiphany',
        apCost: i <= 2 ? 1 : Math.floor(Math.random() * 2) + 1,
        type: i <= 2 ? (i === 1 ? 'Attack' : 'Skill') : 'Attack',
        effects: i === 1 ? [{ type: 'damage', value: 100, hits: 1 }] :
                 i === 2 ? [{ type: 'shield', value: 100 }] :
                 [{ type: 'damage', value: 100 + i * 20, hits: 1 }],
        tags: i <= 2 ? [] : [],
        description: i === 1 ? '피해 100%' : i === 2 ? '실드 100%' : `피해 ${100 + i * 20}%`,
      });
    }
    char.cardIds = cardIds;
    continue;
  }

  // Real scraped data
  let cards = scraped.cards;
  const cardImages = scraped.cardImages || [];

  // Filter out artifacts (lucas's "일반 카드 1" etc.)
  cards = cards.filter(c => {
    const name = c.name.trim();
    // Filter out cards named like image alt text patterns
    if (/^일반\s*카드\s*\d+$/.test(name)) return false;
    if (/^고유\s*카드\s*\d+$/.test(name)) return false;
    return true;
  });

  // Deduplicate card images by src
  const seenSrcs = new Set();
  const uniqueImages = [];
  for (const img of cardImages) {
    if (!seenSrcs.has(img.src)) {
      seenSrcs.add(img.src);
      uniqueImages.push(img);
    }
  }

  // Separate images into Starting (일반카드) and Epiphany (고유카드)
  const startingImages = uniqueImages.filter(img =>
    img.alt.includes('일반카드') || img.alt.includes('일반 카드')
  );
  const epiphanyImages = uniqueImages.filter(img =>
    img.alt.includes('고유카드') || img.alt.includes('고유 카드')
  );

  // Separate cards into Starting and Epiphany
  const startingCards = cards.filter(c => c.category === 'Starting');
  const epiphanyCards = cards.filter(c => c.category === 'Epiphany');

  const cardIds = [];

  // Build card entries
  let cardIndex = 1;

  for (let i = 0; i < startingCards.length; i++) {
    const c = startingCards[i];
    const cardId = `${charId}-card-${cardIndex}`;
    cardIds.push(cardId);

    const card = {
      id: cardId,
      name: c.name,
      nameKo: c.name,
      category: 'Starting',
      apCost: c.apCost,
      type: c.type,
      effects: c.effects.map(eff => {
        const e = { type: eff.type, value: eff.value };
        if (eff.hits && eff.hits > 1) e.hits = eff.hits;
        return e;
      }),
      tags: c.tags || [],
      description: cleanDescription(c.description),
    };

    // Assign image
    if (i < startingImages.length) {
      card.imageUrl = startingImages[i].src;
    }

    allCards.push(card);
    cardIndex++;
  }

  for (let i = 0; i < epiphanyCards.length; i++) {
    const c = epiphanyCards[i];
    const cardId = `${charId}-card-${cardIndex}`;
    cardIds.push(cardId);

    const card = {
      id: cardId,
      name: c.name,
      nameKo: c.name,
      category: 'Epiphany',
      apCost: c.apCost,
      type: c.type,
      effects: c.effects.map(eff => {
        const e = { type: eff.type, value: eff.value };
        if (eff.hits && eff.hits > 1) e.hits = eff.hits;
        return e;
      }),
      tags: c.tags || [],
      description: cleanDescription(c.description),
    };

    // Assign image
    if (i < epiphanyImages.length) {
      card.imageUrl = epiphanyImages[i].src;
    }

    allCards.push(card);
    cardIndex++;
  }

  char.cardIds = cardIds;
}

function cleanDescription(desc) {
  if (!desc) return '';
  // Remove wiki commentary markers
  let clean = desc
    .replace(/\[편집\]/g, '')
    .replace(/\[접기\]/g, '')
    .replace(/\[펼치기\]/g, '')
    .replace(/\[상세\]/g, '')
    .replace(/\[\d+\]/g, '')  // footnote references like [3], [7]
    .trim();

  // Cut at section headers (e.g., "5.2. 고유 카드", "5. 에고 스킬", "6. 잠재력")
  // Handle both single-level (5.) and multi-level (5.2.) section numbers
  const sectionPattern = /\s+\d+(\.\d+)*\.\s*(고유|기본|탄환|특수|에고|잠재력|기억|$)/;
  const sectionMatch = clean.match(sectionPattern);
  if (sectionMatch) {
    clean = clean.substring(0, sectionMatch.index).trim();
  }
  // Remove trailing standalone digits (section number artifacts like "실드 100% 5")
  clean = clean.replace(/\s+\d+\s*$/, '').trim();

  // Cut at wiki commentary and strategy advice patterns
  // Find the EARLIEST match across all patterns
  const commentaryPatterns = [
    // Character name references (commentary about specific chars)
    '잠재력을', '잠재력이', '잠재력으로',
    // Strategy/opinion words
    '여타', '캐릭터마다', '삭제 대상', '다른 딜러', '덱빌딩에서', '필수 삭제',
    '지우는 카드', '지우는게', '카오스에서', '공식 방송', '필수로 제거',
    '유용한', '상당히', '기본적으로', '참고로', '다만', '하지만', '때문에',
    '이 카드는', '해당 카드', '이 스킬은', '이 기술은',
    '일반적으로', '실질적으로', '사실상', '반드시',
    '아무런', '어지간한',
    // Strategy verbs/adjectives
    '권장되', '추천', '핵심카드', '주력기', '최주력',
    '강력한', '흉악한', '뻥튀기',
    // Commentary sentence starters
    '덕분에', '이전에는', '이로 인해',
    '본인의', '적은 코스트',
    // Flavor text markers
    '아하하', '온 힘을', '머리 위를',
    // Game system references outside card effect
    '복제까지', '돌파시', '휴식처', '딜로스',
    // Specific pattern: commentary starting with object descriptions
    '보라색 등급', '단순하면서', '미카의', '삭제하는',
    // Linking patterns to other sections
    '영감 효과까지',
    // Cut at "제일 먼저"
    '제일 먼저',
  ];

  // Find earliest commentary match
  let earliestCut = clean.length;
  for (const marker of commentaryPatterns) {
    const idx = clean.indexOf(marker);
    if (idx > 5 && idx < earliestCut) {
      earliestCut = idx;
    }
  }
  if (earliestCut < clean.length) {
    clean = clean.substring(0, earliestCut).trim();
  }

  // Cut at line that starts a new card description (e.g., "1 진혼의 탄환")
  const newCardPattern = /\s+\d+\s+[가-힣]/;
  const newCardMatch = clean.match(newCardPattern);
  if (newCardMatch && newCardMatch.index > 10) {
    clean = clean.substring(0, newCardMatch.index).trim();
  }

  // Remove trailing punctuation artifacts
  clean = clean.replace(/[,.\s]+$/, '').trim();

  // Hard truncation at 100 chars
  if (clean.length > 100) {
    clean = clean.substring(0, 100).trim();
    // Try to end at a word boundary
    const lastSpace = clean.lastIndexOf(' ');
    if (lastSpace > 60) clean = clean.substring(0, lastSpace);
  }

  return clean;
}

// Write outputs
fs.writeFileSync(CARDS_PATH, JSON.stringify(allCards, null, 2));
console.log(`cards.json: ${allCards.length} cards written`);

fs.writeFileSync(CHARS_PATH, JSON.stringify(characters, null, 2));
console.log(`characters.json: ${characters.length} characters updated`);

// Stats
const scraped = allCards.filter(c => c.imageUrl && c.imageUrl.includes('namu.wiki'));
const placeholder = allCards.filter(c => !c.imageUrl);
const withImages = allCards.filter(c => c.imageUrl);
console.log(`\nStats:`);
console.log(`  Total cards: ${allCards.length}`);
console.log(`  With namu images: ${scraped.length}`);
console.log(`  With any images: ${withImages.length}`);
console.log(`  Without images: ${placeholder.length}`);

// Per-character summary
for (const char of characters) {
  const charCards = allCards.filter(c => c.id.startsWith(char.id + '-'));
  const withImg = charCards.filter(c => c.imageUrl);
  const isFailed = FAILED_CHARS.includes(char.id);
  console.log(`  ${char.id}: ${charCards.length} cards, ${withImg.length} images${isFailed ? ' (placeholder)' : ''}`);
}
