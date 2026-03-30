import { readFileSync, writeFileSync } from 'fs';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';

import { buildEurekaCover } from './generate-eureka-brand-cover.mjs';
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

export function splitCoverAndBody(md) {
  const markerPairs = [
    {
      start: /<!--\s*cover\s+start\s*-->/i,
      end: /<!--\s*cover\s+end\s*-->/i,
    },
    {
      start: /<!--\s*capa\s+inicio\s*-->/i,
      end: /<!--\s*capa\s+fim\s*-->/i,
    },
  ];

  let selectedPair = null;
  let selectedStartMatch = null;

  for (const pair of markerPairs) {
    const startMatch = pair.start.exec(md);
    if (!startMatch) continue;

    if (!selectedStartMatch || startMatch.index < selectedStartMatch.index) {
      selectedPair = pair;
      selectedStartMatch = startMatch;
    }
  }

  if (!selectedPair || !selectedStartMatch) {
    return { hasCover: false, coverMarkdown: '', bodyMarkdown: md };
  }

  const searchStartIndex = selectedStartMatch.index + selectedStartMatch[0].length;
  const remainingContent = md.slice(searchStartIndex);
  const endMatch = selectedPair.end.exec(remainingContent);

  if (!endMatch) {
    return { hasCover: false, coverMarkdown: '', bodyMarkdown: md };
  }

  const coverMarkdown = remainingContent.slice(0, endMatch.index);
  const bodyMarkdown =
    md.slice(0, selectedStartMatch.index) +
    remainingContent.slice(endMatch.index + endMatch[0].length);

  return { hasCover: true, coverMarkdown, bodyMarkdown };
}

const mdContent = readFileSync(inputMd, 'utf8');
const { hasCover, coverMarkdown, bodyMarkdown } = splitCoverAndBody(mdContent);
const bodyHtml = marked.parse(bodyMarkdown);
const coverBodyHtml = hasCover ? marked.parse(coverMarkdown.trim() || '') : '';

const identitySource = readFileSync(identityHtmlStructure, 'utf8');

const footerHtml = buildEurekaFooter();
const headerWithLogo = buildEurekaHeader({ showLogo: true });

const applyModeAndStyles = (html, modeClass, contentStyles) => {
  let out = html.replace('__EUK_MODE__', modeClass);
  out = out.replace('</head>', `${contentStyles}\n</head>`);
  return out;
};

const buildContentDocumentHtml = ({ contentStyles }) => {
  const inner = `<div class="euk-doc">${bodyHtml}</div>`;
  let html = identitySource.replace('<!-- document-content -->', inner);
  return applyModeAndStyles(html, 'euk-mode-content', contentStyles);
};

const buildCoverDocumentHtml = ({ contentStyles }) => {
  const coverInner = buildEurekaCover({ bodyHtml: coverBodyHtml });
  let html = identitySource.replace('<!-- document-content -->', coverInner);
  return applyModeAndStyles(html, 'euk-mode-cover', contentStyles);
};

const buildOverlayDocumentHtml = ({ contentStyles, headerHtml, footerHtml: footerBlock }) => {
  let html = identitySource.replace('<!-- document-content -->', '');
  html = applyModeAndStyles(html, 'euk-mode-overlay', contentStyles);
  html = html.replace('<body>', `<body>\n${headerHtml}\n${footerBlock}`);
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

async function composePdfWithOptionalCover({
  coverBuffer,
  contentBuffer,
  overlayFirstBuffer,
  overlayRestBuffer,
}) {
  const composed = await PDFDocument.create();
  const contentDoc = await PDFDocument.load(contentBuffer);
  const overlayFirstDoc = await PDFDocument.load(overlayFirstBuffer);
  const overlayRestDoc = overlayRestBuffer ? await PDFDocument.load(overlayRestBuffer) : null;
  const contentPageCount = contentDoc.getPageCount();

  if (coverBuffer) {
    const coverDoc = await PDFDocument.load(coverBuffer);
    const [coverPage] = await composed.copyPages(coverDoc, [0]);
    composed.addPage(coverPage);
  }

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
const coverDocumentHtml = hasCover
  ? buildCoverDocumentHtml({
      contentStyles: buildPageContentStyles({ mode: 'cover' }),
    })
  : null;
const overlayFirstPageHtml = buildOverlayDocumentHtml({
  contentStyles: buildPageContentStyles({ mode: 'overlay' }),
  headerHtml: headerWithLogo,
  footerHtml,
});
const overlayRemainingPagesHtml = buildOverlayDocumentHtml({
  contentStyles: buildPageContentStyles({ mode: 'overlay' }),
  headerHtml: headerWithLogo,
  footerHtml,
});

try {
  const contentBuffer = await renderPdf(page, contentDocumentHtml);
  const coverBuffer =
    hasCover && coverDocumentHtml ? await renderPdf(page, coverDocumentHtml, { pageRanges: '1' }) : null;
  const overlayFirstBuffer = await renderPdf(page, overlayFirstPageHtml, {
    pageRanges: '1',
    omitBackground: true,
  });
  const overlayRestBuffer = await renderPdf(page, overlayRemainingPagesHtml, {
    pageRanges: '1',
    omitBackground: true,
  });

  const finalBuffer = await composePdfWithOptionalCover({
    coverBuffer,
    contentBuffer,
    overlayFirstBuffer,
    overlayRestBuffer,
  });
  writeFileSync(outputPdf, finalBuffer);
} finally {
  await browser.close();
}

console.log(`Done -> ${outputPdf}`);
