import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultPagePaddingPx, footerHeightPx, headerHeightPx } from './eureka-document-config.mjs';
import { generateEurekaSvgSymbol } from './generate-eureka-svg-symbol.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.join(__dirname, 'eureka-logo-vertical.svg');
const logoDataUri = existsSync(logoPath)
  ? `data:image/svg+xml;base64,${readFileSync(logoPath).toString('base64')}`
  : null;

export const buildEurekaCover = ({ bodyHtml = '' } = {}) => {
  const logoImg = logoDataUri
    ? `<img src="${logoDataUri}" alt="Eureka" style="width:min(200px,42vw);height:auto;display:block;margin:0 auto 28px;" />`
    : '';

  return `<div style="position:relative;box-sizing:border-box;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
  ${generateEurekaSvgSymbol({
    color: '#eee',
    styles: 'width:800px;position:absolute;right:-200px;top:-500px;transform:rotate(45deg);pointer-events:none;',
  }).trim()}
  <div style="position:fixed;bottom:0;left:0;right:0;width:100%;background:transparent;pointer-events:none;">
    ${generateEurekaSvgSymbol({
      color: '#f5a623',
      styles: 'width:620px;position:absolute;bottom:-400px;left:-100px;transform:rotate(45deg);',
    }).trim()}
  </div>
  <div style="position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;box-sizing:border-box;padding:${headerHeightPx}px ${defaultPagePaddingPx}px ${footerHeightPx}px;text-align:center;">
    ${logoImg}
    <div class="cover-body">${bodyHtml}</div>
  </div>
</div>`;
};
