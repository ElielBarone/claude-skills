import { readFileSync, writeFileSync } from 'fs';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';
import { buildEurekaHeaderContinuationInnerHtml } from './generate-eureka-brand-header.mjs';
import { buildEurekaFooterInnerHtml } from './generate-eureka-brand-footer.mjs';
import {
  buildFirstPageContentStyles,
  buildContinuationContentStyles,
} from './generate-eureka-brand-content-styles.mjs';
import { headerHeightPx, footerHeightPx } from './eureka-document-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const inputMd = process.argv[2];
const outputPdf = process.argv[3];

if (!inputMd || !outputPdf) {
  throw new Error('Usage: node scripts/generate-eureka-pdf.mjs "<input.md>" "<output.pdf>"');
}

const assetsDir = path.join(projectRoot, 'assets');
const identityHtmlPath = path.join(assetsDir, 'eureka-document-pdf-structure.html');

const mdContent = readFileSync(inputMd, 'utf8');
const bodyHtml = marked.parse(mdContent);

const logoSvg = readFileSync(path.join(assetsDir, 'eureka-logo-horizontal.svg'), 'utf8');
const logoDataUri = `data:image/svg+xml,${encodeURIComponent(logoSvg)}`;

const identitySource = readFileSync(identityHtmlPath, 'utf8');

const continuationHeaderInnerHtml = buildEurekaHeaderContinuationInnerHtml();
const footerInnerHtml = buildEurekaFooterInnerHtml();

const buildFullHtml = (contentStyles) => {
  let html = identitySource.replace('<!-- Document content goes here -->', bodyHtml);
  html = html.replace('src="euk-logo-horizontal.png"', `src="${logoDataUri}"`);
  html = html.replace('<!-- continuation header inner html goes here -->', continuationHeaderInnerHtml);
  html = html.replace('<!-- footer inner html goes here -->', footerInnerHtml);
  html = html.replace('</head>', contentStyles + '\n</head>');
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
  await page.setContent(buildFullHtml(buildContinuationContentStyles()), {
    waitUntil: 'load',
  });
  const countBuffer = await page.pdf(basePdfOptions);
  const countDoc = await PDFDocument.load(countBuffer);
  const pageCount = countDoc.getPageCount();

  if (pageCount === 1) {
    await page.setContent(buildFullHtml(buildFirstPageContentStyles()), {
      waitUntil: 'load',
    });
    const singleBuffer = await page.pdf(basePdfOptions);
    writeFileSync(outputPdf, singleBuffer);
  } else {
    await page.setContent(buildFullHtml(buildFirstPageContentStyles()), {
      waitUntil: 'load',
    });
    const page1Buffer = await page.pdf({
      ...basePdfOptions,
      pageRanges: '1',
    });

    await page.setContent(buildFullHtml(buildContinuationContentStyles()), {
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
