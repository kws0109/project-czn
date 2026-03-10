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
const VARIATION_PATH = './scripts/variation-data.json';
const CHARS_PATH = './src/data/characters.json';
const CARDS_PATH = './src/data/cards.json';

const scrapedData = JSON.parse(fs.readFileSync(SCRAPED_PATH, 'utf8'));

// Load variation data (graceful fallback if not found)
let variationData = {};
try {
  variationData = JSON.parse(fs.readFileSync(VARIATION_PATH, 'utf8'));
  console.log(`Loaded variation data for ${Object.keys(variationData).length} characters`);
} catch {
  console.log('No variation-data.json found, skipping variations');
}
const characters = JSON.parse(fs.readFileSync(CHARS_PATH, 'utf8'));

/**
 * Parse damage/healing/shield effects from a variation description.
 * "피해 140%" → [{ type: 'damage', value: 140, hits: 1 }]
 * "피해 75% x 3" → [{ type: 'damage', value: 75, hits: 3 }]
 * "치유 150%" → [{ type: 'healing', value: 150 }]
 * "실드 200%" → [{ type: 'shield', value: 200 }]
 * "방어 기반 피해 400%" → [{ type: 'damage', value: 400, hits: 1 }]
 */
function parseVariationEffects(description) {
  const effects = [];

  // Match damage patterns: "피해 N%" or "방어 기반 피해 N%"
  const dmgMatch = description.match(/피해\s*(\d+)%/);
  if (dmgMatch) {
    const eff = { type: 'damage', value: parseInt(dmgMatch[1]), hits: 1 };
    // Check for multi-hit: "x 3" or "x3"
    const hitsMatch = description.match(/피해\s*\d+%\s*x\s*(\d+)/);
    if (hitsMatch) eff.hits = parseInt(hitsMatch[1]);
    effects.push(eff);
  }

  // Match healing: "치유 N%"
  const healMatch = description.match(/치유\s*(\d+)%/);
  if (healMatch) {
    effects.push({ type: 'healing', value: parseInt(healMatch[1]) });
  }

  // Match shield: "실드 N%"
  const shieldMatch = description.match(/실드\s*(\d+)%/);
  if (shieldMatch) {
    effects.push({ type: 'shield', value: parseInt(shieldMatch[1]) });
  }

  return effects;
}

/**
 * Parse tags from variation description.
 * "[개전]", "[소멸]", "[유일/개전/소멸/증발]" etc.
 */
function parseVariationTags(description) {
  const tagMatch = description.match(/^\[([^\]]+)\]/);
  if (!tagMatch) return [];
  return tagMatch[1].split('/').map(t => t.trim());
}

/** Strip [태그/태그/...] prefix from description */
function stripTagPrefix(description) {
  return description.replace(/^\[.*?\]/, '').trim();
}

/**
 * Group character variations by base card name.
 * Handles cases like "파쇄(철갑)" → base "파쇄".
 */
function groupVariationsByCard(variations) {
  const groups = [];
  let currentGroup = [];

  for (const v of variations) {
    if (v.variationNumber === 1 && currentGroup.length > 0) {
      groups.push(currentGroup);
      currentGroup = [];
    }
    currentGroup.push(v);
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  return groups;
}

/**
 * Find which variation group matches a given Epiphany card name.
 * Tries exact match first, then startsWith for cases like "파쇄" → "파쇄(철갑)".
 */
function findMatchingVariationGroup(cardName, variationGroups) {
  for (const group of variationGroups) {
    const varName = group[0].cardName;
    // Exact match
    if (varName === cardName) return group;
    // Strip parenthetical suffix: "파쇄(철갑)" → "파쇄"
    const baseName = varName.replace(/\(.+\)$/, '');
    if (baseName === cardName) return group;
    // Card name starts with variation base
    if (varName.startsWith(cardName)) return group;
  }
  return null;
}

// 8 failed characters that have no namu wiki data
const FAILED_CHARS = ['kayron', 'khalipe', 'narja', 'orlea', 'sereniel', 'tiphera', 'cassius', 'tressa'];

const allCards = [];

for (const char of characters) {
  const charId = char.id;
  const scraped = scrapedData[charId];

  if (!scraped) {
    // Character without scraped card data - build from variation data if available
    const charVariations = variationData[charId] || [];
    const varGroups = groupVariationsByCard(charVariations);
    const cardIds = [];
    let cardIndex = 1;

    // 2 Starting placeholder cards (no variation data available for Starting cards)
    for (let i = 0; i < 2; i++) {
      const cardId = `${charId}-card-${cardIndex}`;
      cardIds.push(cardId);
      allCards.push({
        id: cardId,
        name: `${char.name} Card ${cardIndex}`,
        nameKo: `${char.nameKo} 카드 ${cardIndex}`,
        category: 'Starting',
        apCost: 1,
        type: i === 0 ? 'Attack' : 'Skill',
        effects: i === 0 ? [{ type: 'damage', value: 100, hits: 1 }] : [{ type: 'shield', value: 100 }],
        tags: [],
        description: i === 0 ? '피해 100%' : '실드 100%',
      });
      cardIndex++;
    }

    if (varGroups.length > 0) {
      // Use variation data to build Epiphany cards with real Korean names
      for (const group of varGroups) {
        const cardId = `${charId}-card-${cardIndex}`;
        cardIds.push(cardId);

        // Use first variation (#1) as the base card data
        const base = group[0];
        // Use base card name without parenthetical suffix
        const baseName = base.cardName.replace(/\(.+\)$/, '');
        const card = {
          id: cardId,
          name: baseName,
          nameKo: baseName,
          category: 'Epiphany',
          apCost: parseInt(base.apCost) || 1,
          type: base.type || 'Attack',
          effects: parseVariationEffects(base.description),
          tags: parseVariationTags(base.description),
          description: stripTagPrefix(base.description),
          variations: group.map(v => ({
            variationNumber: v.variationNumber,
            name: v.cardName !== baseName ? v.cardName : undefined,
            apCost: parseInt(v.apCost) || 1,
            type: v.type || 'Attack',
            effects: parseVariationEffects(v.description),
            description: stripTagPrefix(v.description),
            tags: parseVariationTags(v.description),
          })),
        };
        allCards.push(card);
        cardIndex++;
      }

      // Fill remaining Epiphany slots to reach 7 total cards
      while (cardIndex <= 7) {
        const cardId = `${charId}-card-${cardIndex}`;
        cardIds.push(cardId);
        allCards.push({
          id: cardId,
          name: `${char.name} Card ${cardIndex}`,
          nameKo: `${char.nameKo} 카드 ${cardIndex}`,
          category: 'Epiphany',
          apCost: 1,
          type: 'Attack',
          effects: [{ type: 'damage', value: 100 + cardIndex * 20, hits: 1 }],
          tags: [],
          description: `피해 ${100 + cardIndex * 20}%`,
        });
        cardIndex++;
      }
    } else {
      // No variation data at all - pure placeholders
      for (let i = 0; i < 5; i++) {
        const cardId = `${charId}-card-${cardIndex}`;
        cardIds.push(cardId);
        allCards.push({
          id: cardId,
          name: `${char.name} Card ${cardIndex}`,
          nameKo: `${char.nameKo} 카드 ${cardIndex}`,
          category: 'Epiphany',
          apCost: 1,
          type: 'Attack',
          effects: [{ type: 'damage', value: 100 + cardIndex * 20, hits: 1 }],
          tags: [],
          description: `피해 ${100 + cardIndex * 20}%`,
        });
        cardIndex++;
      }
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

  // Group variation data for this character
  const charVariations = variationData[charId] || [];
  const variationGroups = groupVariationsByCard(charVariations);

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

    // Attach variations if available
    const matchedGroup = findMatchingVariationGroup(c.name, variationGroups);
    if (matchedGroup && matchedGroup.length > 0) {
      card.variations = matchedGroup.map(v => ({
        variationNumber: v.variationNumber,
        name: v.cardName !== c.name ? v.cardName : undefined,
        apCost: v.apCost,
        type: v.type,
        effects: parseVariationEffects(v.description),
        description: stripTagPrefix(v.description),
        tags: parseVariationTags(v.description),
      }));
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

// Variation stats
const cardsWithVariations = allCards.filter(c => c.variations && c.variations.length > 0);
const totalVariations = cardsWithVariations.reduce((sum, c) => sum + c.variations.length, 0);
console.log(`  Cards with variations: ${cardsWithVariations.length}`);
console.log(`  Total variations: ${totalVariations}`);

// Per-character summary
for (const char of characters) {
  const charCards = allCards.filter(c => c.id.startsWith(char.id + '-'));
  const withImg = charCards.filter(c => c.imageUrl);
  const withVar = charCards.filter(c => c.variations && c.variations.length > 0);
  const isFailed = FAILED_CHARS.includes(char.id);
  console.log(`  ${char.id}: ${charCards.length} cards, ${withImg.length} images, ${withVar.length} with variations${isFailed ? ' (placeholder)' : ''}`);
}
