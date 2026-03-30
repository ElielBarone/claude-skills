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

const buildMarkdownFlowStyles = (scope) => `
  .${scope} h1 { font-size: 22px; font-weight: 700; color: #1a1a1a; margin: 0 0 20px; padding-bottom: 10px; border-bottom: 2px solid #f5a623; }
  .${scope} h2 { font-size: 17px; font-weight: 600; color: #1a1a1a; margin: 28px 0 10px; }
  .${scope} h3 { font-size: 14px; font-weight: 600; color: #333; margin: 20px 0 8px; }
  .${scope} h4 { font-size: 13px; font-weight: 600; color: #333; margin: 16px 0 8px; }
  .${scope} h5 { font-size: 12px; font-weight: 600; color: #555; margin: 14px 0 6px; }
  .${scope} h6 { font-size: 11px; font-weight: 600; color: #555; margin: 12px 0 6px; }
  .${scope} p  { font-size: 12px; color: #333; line-height: 1.7; margin: 0 0 12px; }
  .${scope} ul, .${scope} ol { font-size: 12px; color: #333; line-height: 1.7; margin: 0 0 12px; padding-left: 20px; text-align: left; }
  .${scope} li { margin-bottom: 4px; }
  .${scope} table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 0 0 16px; }
  .${scope} th { background: #f5a623; color: #1a1a1a; font-weight: 600; padding: 6px 10px; text-align: left; }
  .${scope} td { border: 1px solid #e5e5e5; padding: 6px 10px; color: #333; background: #fff; }
  .${scope} tr:nth-child(even) td { background: #fafafa; }
  .${scope} code { font-family: 'Courier New', monospace; background: #f4f4f4; padding: 1px 4px; border-radius: 3px; font-size: 11px; }
  .${scope} pre { background: #f4f4f4; padding: 12px; border-radius: 6px; overflow-x: auto; margin: 0 0 16px; text-align: left; }
  .${scope} pre code { background: none; padding: 0; }
  .${scope} blockquote { border-left: 3px solid #f5a623; margin: 0 0 16px; padding: 6px 14px; background: #fffbf2; color: #555; font-style: italic; font-size: 12px; text-align: left; }
  .${scope} strong { font-weight: 600; }
  .${scope} a { color: #f5a623; }
  .${scope} hr { border: none; border-top: 1px solid #e5e5e5; margin: 20px 0; }
  .${scope} h1, .${scope} h2, .${scope} h3, .${scope} h4, .${scope} h5, .${scope} h6, .${scope} p, .${scope} li, .${scope} td, .${scope} th, .${scope} code, .${scope} strong, .${scope} a {
    -webkit-text-fill-color: currentColor !important;
  }
`;

const buildContentMarkdownStyles = () => `
  .content { padding: ${defaultPagePaddingPx}px; }
  ${buildMarkdownFlowStyles('content')}
`;

const buildCoverMarkdownStyles = () => `
  .content { margin: 0; padding: 0; width: 100%; min-height: 100vh; box-sizing: border-box; }
  .cover-body { width: 100%; max-width: 520px; max-height: 42vh; overflow: auto; margin: 0 auto; text-align: center; }
  ${buildMarkdownFlowStyles('cover-body')}
`;

const buildBaseLayoutStyles = ({ mode }) => {
  const isOverlay = mode === 'overlay';
  const isCover = mode === 'cover';
  const pageMargin = isCover ? '0' : isOverlay ? '0' : `${headerHeightPx}px 0 ${footerHeightPx}px`;
  return `
  @page { size: A4; margin: ${pageMargin}; }
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
  const markdownStyles =
    mode === 'content' ? buildContentMarkdownStyles() : mode === 'cover' ? buildCoverMarkdownStyles() : '';
  return `
<style>
${buildRobotoFontFaces()}
${buildBaseLayoutStyles({ mode })}
  html {
    background-color: ${isOverlay ? 'transparent' : '#fff'};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
${markdownStyles}
</style>
`;
};
