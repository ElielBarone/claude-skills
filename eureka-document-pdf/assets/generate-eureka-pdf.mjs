import { readFileSync, writeFileSync, existsSync } from 'fs';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';

import { buildEurekaFooter } from './generate-eureka-brand-footer.mjs';
import { buildEurekaHeader } from './generate-eureka-brand-header.mjs';
import { buildPageContentStyles } from './generate-eureka-brand-content-styles.mjs';
import { headerHeightPx, footerHeightPx } from './eureka-document-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const inputMd = process.argv[2];
const outputPdf = process.argv[3];

if (!inputMd || !outputPdf) {
  throw new Error('Usage: node scripts/generate-eureka-pdf.mjs "<input.md>" "<output.pdf>"');
}

const assetsDir = path.join(projectRoot, 'assets');
const identityHtmlStructure = path.join(assetsDir, 'eureka-document-pdf-structure.html');

const mdContent = readFileSync(inputMd, 'utf8');
const bodyHtml = marked.parse(mdContent);

const identitySource = readFileSync(identityHtmlStructure, 'utf8');

const logoPath = path.join(assetsDir, 'euk-logo-horizontal.png');
const logoDataUri = existsSync(logoPath)
  ? `data:image/png;base64,${readFileSync(logoPath).toString('base64')}`
  : null;

const footerInnerHtml = buildEurekaFooter();

const buildHeader = (fistPage = true) => {
  const logoUrl = fistPage ? logoDataUri : null;
  return buildEurekaHeader(logoUrl, fistPage);
}

const buildFullHtml = (contentStyles, headerHtml, fixedHeader = false) => {
  let html = identitySource.replace('<!-- document-content -->', bodyHtml);
  html = html.replace('<!-- header-content -->', headerHtml);
  html = html.replace('<!-- footer-content -->', footerInnerHtml);
  html = html.replace('</head>', contentStyles + buildHeader(fixedHeader) + '\n</head>');
  return html;
};

const margin = {
  top: `${headerHeightPx}px`,
  bottom: `${footerHeightPx}px`,
  left: '0',
  right: '0',
};

const basePdfOptions = {
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: false,
  margin,
};

async function mergePdfBuffers(firstBuffer, restBuffer) {
  const merged = await PDFDocument.create();
  const firstDoc = await PDFDocument.load(firstBuffer);
  const restDoc = await PDFDocument.load(restBuffer);
  const [firstPage] = await merged.copyPages(firstDoc, [0]);
  merged.addPage(firstPage);
  const restCount = restDoc.getPageCount();
  const restIndices = Array.from({ length: restCount }, (_, i) => i);
  const restPages = await merged.copyPages(restDoc, restIndices);
  restPages.forEach((p) => merged.addPage(p));
  return Buffer.from(await merged.save());
}

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: true,
});

const page = await browser.newPage();

try {
  await page.setContent(buildFullHtml(buildPageContentStyles(), '', true), {
    waitUntil: 'load',
  });
  const countBuffer = await page.pdf(basePdfOptions);
  const countDoc = await PDFDocument.load(countBuffer);
  const pageCount = countDoc.getPageCount();

  if (pageCount === 1) {
    await page.setContent(buildFullHtml(buildPageContentStyles(), '', true), {
      waitUntil: 'load',
    });
    const singleBuffer = await page.pdf(basePdfOptions);
    writeFileSync(outputPdf, singleBuffer);
  } else {
    await page.setContent(buildFullHtml(buildPageContentStyles(), '', true), {
      waitUntil: 'load',
    });
    const page1Buffer = await page.pdf({
      ...basePdfOptions,
      pageRanges: '1',
    });

    await page.setContent(buildFullHtml(buildPageContentStyles(), '', false), {
      waitUntil: 'load',
    });
    const restBuffer = await page.pdf({
      ...basePdfOptions,
      pageRanges: '2-',
    });

    const mergedBuffer = await mergePdfBuffers(page1Buffer, restBuffer);
    writeFileSync(outputPdf, mergedBuffer);
  }
} finally {
  await browser.close();
}

console.log(`Done -> ${outputPdf}`);
