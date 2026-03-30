import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateEurekaSvgSymbol } from './generate-eureka-svg-symbol.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.join(__dirname, 'eureka-logo-horizontal.svg');
const logoDataUri = existsSync(logoPath)
  ? `data:image/svg+xml;base64,${readFileSync(logoPath).toString('base64')}`
  : null;

export const buildEurekaHeader = ({ showLogo = true } = {}) => {
  const logoImg = showLogo && logoDataUri
    ? `<img src="${logoDataUri}" alt="Eureka" class="euk-header-logo" />`
    : '';

  return `<div class="euk-header-band">
  ${generateEurekaSvgSymbol({
    color: '#eee',
    className: 'euk-header-symbol',
  }).trim()}
  ${logoImg}
</div>`;
};
