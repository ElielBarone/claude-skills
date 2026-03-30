import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultPagePaddingPx, headerHeightPx, footerHeightPx } from './eureka-document-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const robotoFontDir = path.join(__dirname, 'fonts');
const baseCssPath = path.join(__dirname, 'eureka-document-pdf.css');

const fontFiles = [
  { weight: 400, fileName: 'roboto-latin-400-normal.woff2' },
  { weight: 600, fileName: 'roboto-latin-600-normal.woff2' },
  { weight: 700, fileName: 'roboto-latin-700-normal.woff2' },
];

const buildRobotoFontFaces = () =>
  fontFiles
    .map(({ weight, fileName }) => {
      const fontBuffer = readFileSync(path.join(robotoFontDir, fileName));
      const fontDataUri = `data:font/woff2;base64,${fontBuffer.toString('base64')}`;
      return `@font-face {
  font-family: 'Roboto';
  src: url('${fontDataUri}') format('woff2');
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
}`;
    })
    .join('\n');

export const buildEmbeddedFontsStyle = () =>
  `<style>
${buildRobotoFontFaces()}
</style>`;

export const buildRootVariablesStyle = ({ mode = 'content' } = {}) => {
  const isOverlay = mode === 'overlay';
  const isCover = mode === 'cover';
  const marginTop = isCover || isOverlay ? '0' : `${headerHeightPx}px`;
  const marginBottom = isCover || isOverlay ? '0' : `${footerHeightPx}px`;
  return `<style>
:root {
  --edp-header-height: ${headerHeightPx}px;
  --edp-footer-height: ${footerHeightPx}px;
  --edp-page-padding: ${defaultPagePaddingPx}px;
  --edp-page-margin-top: ${marginTop};
  --edp-page-margin-bottom: ${marginBottom};
}
</style>`;
};

const readBaseBrandCss = () => readFileSync(baseCssPath, 'utf8');

export const buildBaseBrandStylesheet = () =>
  `<style>
${readBaseBrandCss()}
</style>`;

export const buildPageContentStyles = ({ mode = 'content' } = {}) =>
  `${buildEmbeddedFontsStyle()}
${buildRootVariablesStyle({ mode })}
${buildBaseBrandStylesheet()}`;
