import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultPagePaddingPx, headerHeightPx } from "./eureka-document-config.mjs";
import { generateEurekaSvgSymbol } from './generate-eureka-svg-symbol.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.join(__dirname, 'eureka-logo-horizontal.svg');
const logoDataUri = existsSync(logoPath)
  ? `data:image/svg+xml;base64,${readFileSync(logoPath).toString('base64')}`
  : null;

export const buildEurekaHeader = ({ showLogo = true } = {}) => {
  const logoImg = showLogo
    ? `<img src="${logoDataUri}" alt="Eureka" style="position:absolute;top:${defaultPagePaddingPx}px;right:${defaultPagePaddingPx}px;height:40px;display:block;" />`
    : '';

  return `<div style="position:fixed;top:0;left:0;right:0;width:100%;height:${headerHeightPx}px;overflow:hidden;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
  ${generateEurekaSvgSymbol({
    color: '#eee',
    styles: 'width:800px;position:absolute;right:-280px;top:-760px;transform:rotate(45deg);',
  }).trim()}
  ${logoImg}
</div>`;
};
