import fs from 'fs';

const raw = fs.readFileSync('C:/Users/ryan1/.claude/projects/C--Users-ryan1-Documents-project-czn/3f5f1e7d-5600-4de3-9937-7a0df9a232cc/tool-results/mcp-plugin_playwright_playwright-browser_run_code-1772801802567.txt', 'utf8');
const parsed = JSON.parse(raw);

// Format: ### Result\n"{\"renoa\":...}" - the whole JSON is string-escaped after "### Result\n"
let resultText = null;
for (const p of parsed) {
  if (p.text && p.text.includes('renoa')) {
    const text = p.text;
    // Find the first " after ### Result\n
    const start = text.indexOf('"{');
    if (start !== -1) {
      // Find matching end quote - escaped JSON ends with }"
      const endMarker = '}"';
      const end = text.lastIndexOf(endMarker);
      if (end !== -1) {
        const jsonStr = text.substring(start, end + endMarker.length);
        resultText = JSON.parse(jsonStr);
      }
    }
    break;
  }
}

if (!resultText) {
  // Try extracting from ### Result section
  for (const p of parsed) {
    if (p.text && p.text.includes('"renoa"')) {
      const match = p.text.match(/\{[\s\S]*\}/);
      if (match) {
        resultText = match[0];
        break;
      }
    }
  }
}

if (!resultText) {
  console.log('No result text found');
  console.log('Parsed types:', parsed.map(p => p.type));
  console.log('First 200 chars:', parsed[0]?.text?.substring(0, 200));
  process.exit(1);
}

const data = JSON.parse(resultText);
fs.writeFileSync('./src/data/card-images.json', JSON.stringify(data, null, 2));

const ids = Object.keys(data);
console.log(ids.length, 'characters');
ids.forEach(id => {
  const d = data[id];
  console.log(`  ${id}: ${d.cards?.length || 0} cards${d.ego ? ' +ego' : ''}${d.error ? ' ERROR: ' + d.error : ''}`);
});
