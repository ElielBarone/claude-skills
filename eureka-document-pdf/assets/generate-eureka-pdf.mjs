import { readFileSync, writeFileSync } from 'fs';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';

import { buildEurekaFooter } from './generate-eureka-brand-footer.mjs';
import { buildEurekaHeader } from './generate-eureka-brand-header.mjs';
import { buildPageContentStyles } from './generate-eureka-brand-content-styles.mjs';

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

const footerHtml = buildEurekaFooter();
const headerWithLogo = buildEurekaHeader({ showLogo: true });
const headerWithoutLogo = buildEurekaHeader({ showLogo: false });

const buildContentDocumentHtml = ({ contentStyles }) => {
  let html = identitySource.replace('<!-- document-content -->', bodyHtml);
  html = html.replace('</head>', contentStyles + '\n</head>');
  return html;
};

const buildOverlayDocumentHtml = ({ contentStyles, headerHtml, footerHtml }) => {
  let html = identitySource.replace('<!-- document-content -->', '');
  html = html.replace('</head>', contentStyles + '\n</head>');
  html = html.replace('<body>', `<body>\n${headerHtml}\n${footerHtml}`);
  return html;
};

const basePdfOptions = {
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: false,
  margin: { top: '0', bottom: '0', left: '0', right: '0' },
};

async function renderPdf(page, html, options = {}) {
  await page.setContent(html, { waitUntil: 'load' });
  return page.pdf({ ...basePdfOptions, ...options });
}

async function composeContentAndOverlay({
  contentBuffer,
  overlayFirstBuffer,
  overlayRestBuffer,
}) {
  const composed = await PDFDocument.create();
  const contentDoc = await PDFDocument.load(contentBuffer);
  const overlayFirstDoc = await PDFDocument.load(overlayFirstBuffer);
  const overlayRestDoc = overlayRestBuffer ? await PDFDocument.load(overlayRestBuffer) : null;
  const contentPageCount = contentDoc.getPageCount();

  for (let pageIndex = 0; pageIndex < contentPageCount; pageIndex += 1) {
    const [contentPage] = await composed.copyPages(contentDoc, [pageIndex]);
    composed.addPage(contentPage);

    let overlaySourcePage = null;
    if (pageIndex === 0) {
      [overlaySourcePage] = overlayFirstDoc.getPages();
    } else if (overlayRestDoc) {
      [overlaySourcePage] = overlayRestDoc.getPages();
    }

    if (overlaySourcePage) {
      const overlayEmbeddedPage = await composed.embedPage(overlaySourcePage);
      contentPage.drawPage(overlayEmbeddedPage, {
        x: 0,
        y: 0,
        width: contentPage.getWidth(),
        height: contentPage.getHeight(),
      });
    }
  }

  return Buffer.from(await composed.save());
}

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: true,
});

const page = await browser.newPage();
const contentDocumentHtml = buildContentDocumentHtml({
  contentStyles: buildPageContentStyles({ mode: 'content' }),
});
const overlayFirstPageHtml = buildOverlayDocumentHtml({
  contentStyles: buildPageContentStyles({ mode: 'overlay' }),
  headerHtml: headerWithLogo,
  footerHtml,
});
const overlayRemainingPagesHtml = buildOverlayDocumentHtml({
  contentStyles: buildPageContentStyles({ mode: 'overlay' }),
  headerHtml: headerWithoutLogo,
  footerHtml,
});

try {
  const contentBuffer = await renderPdf(page, contentDocumentHtml);
  const overlayFirstBuffer = await renderPdf(page, overlayFirstPageHtml, { pageRanges: '1' });
  const overlayRestBuffer = await renderPdf(page, overlayRemainingPagesHtml, { pageRanges: '1' });

  const finalBuffer = await composeContentAndOverlay({
    contentBuffer,
    overlayFirstBuffer,
    overlayRestBuffer,
  });
  writeFileSync(outputPdf, finalBuffer);
} finally {
  await browser.close();
}

console.log(`Done -> ${outputPdf}`);
