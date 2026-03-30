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
    ? `<img src="${logoDataUri}" alt="Eureka" class="euk-cover-logo" />`
    : '';

  return `<div class="euk-cover-root">
  ${generateEurekaSvgSymbol({
    color: '#eee',
    className: 'euk-cover-symbol-top',
  }).trim()}
  <div class="euk-cover-footer-deco">
    ${generateEurekaSvgSymbol({
      color: '#f5a623',
      className: 'euk-cover-symbol-bottom',
    }).trim()}
  </div>
  <div class="euk-cover-inner">
    ${logoImg}
    <div class="euk-cover-body euk-doc">${bodyHtml}</div>
  </div>
</div>`;
};
