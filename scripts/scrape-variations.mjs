/**
 * Scrape 번뜩임 (Epiphany variation) data from namuwiki via Playwright MCP.
 * This script is run manually after Playwright scraping - it processes
 * raw variation data and outputs scripts/variation-data.json.
 *
 * The raw data comes from Playwright MCP browser_run_code calls that
 * extract 번뜩임 #1~#5 from each character's namuwiki page.
 *
 * Usage: node scripts/scrape-variations.mjs
 * Input:  scripts/variation-batch1.json, scripts/variation-batch2.json
 * Output: scripts/variation-data.json
 */
import fs from 'fs';

const BATCH1_PATH = './scripts/variation-batch1.json';
const BATCH2_PATH = './scripts/variation-batch2.json';
const OUTPUT_PATH = './scripts/variation-data.json';

const batch1 = JSON.parse(fs.readFileSync(BATCH1_PATH, 'utf8'));
const batch2 = JSON.parse(fs.readFileSync(BATCH2_PATH, 'utf8'));

const merged = { ...batch1, ...batch2 };

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(merged, null, 2));

const totalVariations = Object.values(merged).reduce(
  (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0
);

console.log(`Merged ${Object.keys(merged).length} characters, ${totalVariations} total variations`);
console.log('Output:', OUTPUT_PATH);
