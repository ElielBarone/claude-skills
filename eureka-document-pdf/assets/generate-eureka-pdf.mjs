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
  const lines = md.split(/\r?\n/);
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i += 1;
  if (i >= lines.length) {
    return { hasCover: false, coverMarkdown: '', bodyMarkdown: md };
  }
  const headerLine = lines[i].trim();
  if (!/^#\s*(cover|capa)\s*$/i.test(headerLine)) {
    return { hasCover: false, coverMarkdown: '', bodyMarkdown: md };
  }
  let j = i + 1;
  for (; j < lines.length; j += 1) {
    const line = lines[j];
    if (/^#\s+/.test(line)) break;
  }
  const coverMarkdown = lines.slice(i + 1, j).join('\n');
  const bodyMarkdown = lines.slice(j).join('\n');
  return { hasCover: true, coverMarkdown, bodyMarkdown };
}

const mdContent = readFileSync(inputMd, 'utf8');
const { hasCover, coverMarkdown, bodyMarkdown } = splitCoverAndBody(mdContent);
const bodyHtml = marked.parse(bodyMarkdown);
const coverBodyHtml = hasCover ? marked.parse(coverMarkdown.trim() || '') : '';

const identitySource = readFileSync(identityHtmlStructure, 'utf8');

const footerHtml = buildEurekaFooter();
const headerWithLogo = buildEurekaHeader({ showLogo: true });

const buildContentDocumentHtml = ({ contentStyles }) => {
  let html = identitySource.replace('<!-- document-content -->', bodyHtml);
  html = html.replace('</head>', contentStyles + '\n</head>');
  return html;
};

const buildCoverDocumentHtml = ({ contentStyles }) => {
  const coverInner = buildEurekaCover({ bodyHtml: coverBodyHtml });
  let html = identitySource.replace('<!-- document-content -->', coverInner);
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
  const overlayFirstBuffer = await renderPdf(page, overlayFirstPageHtml, { pageRanges: '1' });
  const overlayRestBuffer = await renderPdf(page, overlayRemainingPagesHtml, { pageRanges: '1' });

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
