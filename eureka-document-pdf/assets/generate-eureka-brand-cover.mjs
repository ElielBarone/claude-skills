import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateEurekaSvgSymbol } from './generate-eureka-svg-symbol.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.join(__dirname, 'eureka-logo-vertical.svg');
const logoDataUri = existsSync(logoPath)
  ? `data:image/svg+xml;base64,${readFileSync(logoPath).toString('base64')}`
  : null;

export const buildEurekaCover = ({ bodyHtml = '' } = {}) => {
  const logoImg = logoDataUri
    ? `<img src="${logoDataUri}" alt="Eureka" class="edp-cover-logo" />`
    : '';

  return `<div class="edp-cover-root">
  ${generateEurekaSvgSymbol({
    color: '#eee',
    className: 'edp-cover-symbol-top',
  }).trim()}
  <div class="edp-cover-footer-deco">
    ${generateEurekaSvgSymbol({
      color: '#f5a623',
      className: 'edp-cover-symbol-bottom',
    }).trim()}
  </div>
  <div class="edp-cover-inner">
    ${logoImg}
    <div class="edp-cover-body edp-doc">${bodyHtml}</div>
  </div>
</div>`;
};
