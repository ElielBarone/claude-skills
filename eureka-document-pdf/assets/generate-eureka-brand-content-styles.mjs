import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultPagePaddingPx, headerHeightPx, footerHeightPx } from './eureka-document-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const robotoFontDir = path.join(__dirname, 'fonts');

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

const buildSharedMarkdownStyles = () => `
  .content { padding: ${defaultPagePaddingPx}px; }
  .content h1 { font-size: 22px; font-weight: 700; color: #1a1a1a; margin: 0 0 20px; padding-bottom: 10px; border-bottom: 2px solid #f5a623; }
  .content h2 { font-size: 17px; font-weight: 600; color: #1a1a1a; margin: 28px 0 10px; }
  .content h3 { font-size: 14px; font-weight: 600; color: #333; margin: 20px 0 8px; }
  .content p  { font-size: 12px; color: #333; line-height: 1.7; margin: 0 0 12px; }
  .content ul, .content ol { font-size: 12px; color: #333; line-height: 1.7; margin: 0 0 12px; padding-left: 20px; }
  .content li { margin-bottom: 4px; }
  .content table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 0 0 16px; }
  .content th { background: #f5a623; color: #1a1a1a; font-weight: 600; padding: 6px 10px; text-align: left; }
  .content td { border: 1px solid #e5e5e5; padding: 6px 10px; color: #333; background: #fff; }
  .content tr:nth-child(even) td { background: #fafafa; }
  .content code { font-family: 'Courier New', monospace; background: #f4f4f4; padding: 1px 4px; border-radius: 3px; font-size: 11px; }
  .content pre { background: #f4f4f4; padding: 12px; border-radius: 6px; overflow-x: auto; margin: 0 0 16px; }
  .content pre code { background: none; padding: 0; }
  .content blockquote { border-left: 3px solid #f5a623; margin: 0 0 16px; padding: 6px 14px; background: #fffbf2; color: #555; font-style: italic; font-size: 12px; }
  .content strong { font-weight: 600; }
  .content a { color: #f5a623; }
  .content hr { border: none; border-top: 1px solid #e5e5e5; margin: 20px 0; }
  .content h1, .content h2, .content h3, .content p, .content li, .content td, .content th, .content code, .content strong, .content a {
    -webkit-text-fill-color: currentColor !important;
  }
`;

const buildBaseLayoutStyles = ({ mode }) => {
  const isOverlay = mode === 'overlay';
  return `
  @page { size: A4; margin: ${isOverlay ? '0' : `${headerHeightPx}px 0 ${footerHeightPx}px`}; }
  html {
    color-scheme: light;
    margin: 0;
    padding: 0;
    overflow: visible;
    font-family: 'Roboto', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  body {
    margin: 0;
    padding: 0;
    overflow: visible;
    font-family: 'Roboto', system-ui, -apple-system, 'Segoe UI', sans-serif;
    ${isOverlay
      ? 'background: transparent !important;'
      : `color: #1a1a1a !important;
    -webkit-text-fill-color: #1a1a1a !important;
    background-color: #fff !important;`}
  }
  @media print {
    html { color-scheme: light !important; }
    body {
      ${isOverlay
        ? 'background: transparent !important;'
        : `color: #1a1a1a !important;
      -webkit-text-fill-color: #1a1a1a !important;
      background: #fff !important;`}
    }
  }
`;
};

export const buildPageContentStyles = ({ mode = 'content' } = {}) => {
  const isOverlay = mode === 'overlay';
  return `
<style>
${buildRobotoFontFaces()}
${buildBaseLayoutStyles({ mode })}
  html {
    background-color: ${isOverlay ? 'transparent' : '#fff'};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
${mode === 'content' ? buildSharedMarkdownStyles() : ''}
</style>
`;
};
