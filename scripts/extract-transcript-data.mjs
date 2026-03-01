/**
 * Extract scraped card data from the previous session transcript.
 * Reads the JSONL transcript and extracts card data + image URLs.
 */
import fs from 'fs';

const TRANSCRIPT_PATH = 'C:/Users/ryan1/.claude/projects/C--Users-ryan1-Documents-project-czn/501d5e6b-fb6a-41de-a5fc-89f52a37f254.jsonl';
const OUTPUT_PATH = 'C:/Users/ryan1/Documents/project_czn/scripts/all-scraped-data.json';

const lines = fs.readFileSync(TRANSCRIPT_PATH, 'utf8').split('\n');

function getResultText(lineIdx) {
  const obj = JSON.parse(lines[lineIdx]);
  const block = obj.message.content[0];
  let text = block.content[0].text;
  // Remove '### Result\n'
  if (text.startsWith('### Result\n')) {
    text = text.substring('### Result\n'.length);
  }
  // The text might be a JSON-encoded string (starts with ")
  // Or it might have extra stuff after
  if (text.startsWith('"')) {
    // Find the end of the escaped JSON string
    // Use a state machine to find the matching closing quote
    let i = 1;
    let result = '';
    while (i < text.length) {
      if (text[i] === '\\') {
        // Escape sequence
        i++;
        if (text[i] === '"') result += '"';
        else if (text[i] === '\\') result += '\\';
        else if (text[i] === 'n') result += '\n';
        else if (text[i] === 't') result += '\t';
        else if (text[i] === 'r') result += '\r';
        else result += text[i];
        i++;
      } else if (text[i] === '"') {
        // End of string
        break;
      } else {
        result += text[i];
        i++;
      }
    }
    return result;
  }
  return text;
}

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    // Try to find JSON object
    const fb = text.indexOf('{');
    const lb = text.lastIndexOf('}');
    if (fb >= 0 && lb > fb) {
      try {
        return JSON.parse(text.substring(fb, lb + 1));
      } catch (e2) {}
    }
    return null;
  }
}

// Key result lines from the transcript:
// Line 1069: Renoa test extraction
// Line 1076: Batch 1 (nine, mika, chizuru, haru, hugo, luke, magna)
// Line 1088: Batch 2 (mei-lin, veronica, yuki, amir, beryl, lucas, maribell)
// Line 1096: Batch 3 (nia, owen, rei, selena, rin)

const batchLines = [1069, 1076, 1088, 1096];
const allData = {};

for (const lineIdx of batchLines) {
  console.log(`Processing line ${lineIdx}...`);
  const text = getResultText(lineIdx);
  const parsed = safeParseJson(text);

  if (!parsed) {
    console.log(`  FAILED to parse line ${lineIdx}`);
    console.log(`  First 200 chars: ${text.substring(0, 200)}`);
    continue;
  }

  // Check if it's a direct character data (Renoa test) or batch format
  if (parsed.cards && parsed.cardImages) {
    // Direct format (Renoa test)
    allData.renoa = parsed;
    console.log(`  renoa: ${parsed.cards.length} cards, ${parsed.cardImages.length} images`);
  } else {
    // Batch format: { charId: { cards: N, cardImages: N, data: { cards: [...], cardImages: [...] } } }
    // Or: { charId: { cards: N, cardImages: N, stats: bool, data: { ... } } }
    for (const [charId, charData] of Object.entries(parsed)) {
      if (charId === 'summary') {
        // Some batches have a summary key
        for (const [cid, summary] of Object.entries(charData)) {
          console.log(`  ${cid}: ${summary.cards} cards, ${summary.imgs} images (summary)`);
        }
        continue;
      }

      if (charData.data && charData.data.cards) {
        allData[charId] = charData.data;
        console.log(`  ${charId}: ${charData.data.cards.length} cards, ${charData.data.cardImages?.length || 0} images`);
      } else if (charData.cards && Array.isArray(charData.cards)) {
        allData[charId] = charData;
        console.log(`  ${charId}: ${charData.cards.length} cards, ${charData.cardImages?.length || 0} images`);
      } else {
        console.log(`  ${charId}: unknown format - keys: ${Object.keys(charData)}`);
      }
    }
  }
}

console.log(`\nTotal characters extracted: ${Object.keys(allData).length}`);
console.log('Characters:', Object.keys(allData).join(', '));

// Save
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allData, null, 2));
console.log(`\nSaved to ${OUTPUT_PATH}`);
