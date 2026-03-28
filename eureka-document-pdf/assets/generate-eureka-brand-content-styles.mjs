import { contentHorizontalPaddingPx, contentTopPaddingPx, contentBottomPaddingPx, headerHeightPx, footerHeightPx } from './eureka-document-config.mjs';
import {
  a4PageWidthPx,
  a4PageHeightPx,
  buildGreyBackgroundUri,
  buildYellowBackgroundUri,
  buildHeaderGreySvgUri,
  buildFooterYellowSvgUri,
} from './generate-eureka-brand-shapes.mjs';

const buildSharedMarkdownStyles = () => `
  .content h1 { font-size: 22px; font-weight: 700; color: #1a1a1a; margin: 0 0 20px; padding-bottom: 10px; border-bottom: 2px solid #f5a623; }
  .content h2 { font-size: 17px; font-weight: 600; color: #1a1a1a; margin: 28px 0 10px; }
  .content h3 { font-size: 14px; font-weight: 600; color: #333; margin: 20px 0 8px; }
  .content p  { font-size: 12px; color: #333; line-height: 1.7; margin: 0 0 12px; }
  .content ul, .content ol { font-size: 12px; color: #333; line-height: 1.7; margin: 0 0 12px; padding-left: 20px; }
  .content li { margin-bottom: 4px; }
  .content table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 0 0 16px; }
  .content th { background: #f5a623; color: #fff; font-weight: 600; padding: 6px 10px; text-align: left; }
  .content td { border: 1px solid #e5e5e5; padding: 6px 10px; color: #333; }
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

const buildBaseLayoutStyles = () => {
  const headerGreyUri = buildHeaderGreySvgUri();
  const footerYellowUri = buildFooterYellowSvgUri();
  return `
  @page { size: A4; margin: 0; }
  html {
    color-scheme: light;
    margin: 0;
    padding: 0;
    overflow: visible;
  }
  body {
    margin: 0;
    padding: ${headerHeightPx}px 0 ${footerHeightPx}px;
    overflow: visible;
    color: #1a1a1a !important;
    -webkit-text-fill-color: #1a1a1a !important;
    background-color: #fff !important;
  }
  .page {
    min-height: auto;
    display: block;
    position: relative;
    overflow: visible;
    color: #1a1a1a;
  }
  .page-brand-layer { display: none !important; }
  .logo {
    position: fixed; top: 0; left: 0; right: 0;
    height: ${headerHeightPx}px; z-index: 1;
    overflow: hidden; background: #fff;
    background-image: url('${headerGreyUri}');
    background-repeat: no-repeat;
    background-position: right top;
    background-size: ${a4PageWidthPx}px ${headerHeightPx}px;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
    box-sizing: border-box;
  }
  .logo img {
    position: absolute;
    top: 16px; right: ${contentHorizontalPaddingPx}px;
    height: 40px; display: block;
  }
  .logo-continuation {
    position: fixed; top: 0; left: 0; right: 0;
    height: ${headerHeightPx}px; z-index: 1;
    overflow: hidden; background: #fff;
    background-image: url('${headerGreyUri}');
    background-repeat: no-repeat;
    background-position: right top;
    background-size: ${a4PageWidthPx}px ${headerHeightPx}px;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
    box-sizing: border-box;
    display: none;
  }
  .footer {
    position: fixed; bottom: 0; left: 0; right: 0;
    height: ${footerHeightPx}px; z-index: 1;
    overflow: hidden; background: #fff;
    background-image: url('${footerYellowUri}');
    background-repeat: no-repeat;
    background-position: left bottom;
    background-size: ${a4PageWidthPx}px ${footerHeightPx}px;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
    box-sizing: border-box;
  }
  .content {
    position: relative;
    z-index: 10;
    color: #333 !important;
    -webkit-text-fill-color: #333 !important;
    padding: ${contentTopPaddingPx}px ${contentHorizontalPaddingPx}px ${contentBottomPaddingPx}px;
  }
  @media print {
    html { color-scheme: light !important; }
    body {
      color: #1a1a1a !important;
      -webkit-text-fill-color: #1a1a1a !important;
      background: #fff !important;
    }
  }
`;
};

export const buildFirstPageContentStyles = () => {
  const greyBackgroundUri = buildGreyBackgroundUri();
  const yellowUri = buildYellowBackgroundUri();
  return `
<style>
${buildBaseLayoutStyles()}
  html {
    background-color: #fff;
    background-image: url('${greyBackgroundUri}'), url('${yellowUri}');
    background-attachment: scroll, scroll;
    background-repeat: repeat-y, repeat-y;
    background-position: 0 0, 0 0;
    background-size: ${a4PageWidthPx}px ${a4PageHeightPx}px, ${a4PageWidthPx}px ${a4PageHeightPx}px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
${buildSharedMarkdownStyles()}
</style>
`;
};

export const buildContinuationContentStyles = () => {
  const greyBackgroundUri = buildGreyBackgroundUri();
  const yellowUri = buildYellowBackgroundUri();
  return `
<style>
${buildBaseLayoutStyles()}
  .logo { display: none !important; }
  .logo-continuation { display: block !important; }
  html {
    background-color: #fff;
    background-image: url('${greyBackgroundUri}'), url('${yellowUri}');
    background-attachment: scroll, scroll;
    background-repeat: repeat-y, repeat-y;
    background-position: 0 0, 0 0;
    background-size: ${a4PageWidthPx}px ${a4PageHeightPx}px, ${a4PageWidthPx}px ${a4PageHeightPx}px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
${buildSharedMarkdownStyles()}
</style>
`;
};

export const buildBrandContentStyles = buildContinuationContentStyles;
