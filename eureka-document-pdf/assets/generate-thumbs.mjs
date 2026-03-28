import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROTOTYPES = path.resolve(__dirname, '..', 'prototypes');
const VIEWPORT = { width: 1280, height: 900, deviceScaleFactor: 1 };
const WAIT_MS = 1200;

async function main() {
  const dirs = fs.readdirSync(PROTOTYPES)
    .filter(d => {
      const full = path.join(PROTOTYPES, d);
      return fs.statSync(full).isDirectory()
        && d !== '.old'
        && fs.existsSync(path.join(full, 'code.html'));
    })
    .sort();

  console.log(`📸 Generating thumbnails for ${dirs.length} prototypes…\n`);

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  let ok = 0, fail = 0;
  for (const [i, dir] of dirs.entries()) {
    const htmlPath = path.join(PROTOTYPES, dir, 'code.html');
    const outPath  = path.join(PROTOTYPES, dir, 'screen.png');
    process.stdout.write(`  [${i + 1}/${dirs.length}] ${dir} … `);
    try {
      await page.goto('file://' + htmlPath, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, WAIT_MS));
      await page.screenshot({ path: outPath, fullPage: false, type: 'png' });
      console.log('✓');
      ok++;
    } catch (err) {
      console.log(`✗ (${err.message})`);
      fail++;
    }
  }

  await browser.close();
  console.log(`\n✅ Done — ${ok} updated, ${fail} failed`);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
