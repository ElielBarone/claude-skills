import { headerHeightPx, footerHeightPx } from './eureka-document-config.mjs';

export const brandDecorationPath = 'M7.99 0.06c-2.94,0.16 -4.69,0.38 -6.47,2.53 -1.6,1.95 -1.51,4.96 -1.51,7.48 0,1.97 -0.04,3.99 0.03,5.96 0.11,2.9 0.44,4.72 2.54,6.45 1.94,1.6 4.95,1.51 7.48,1.51 1.98,0 4,0.04 5.99,-0.03 2.94,-0.1 4.69,-0.46 6.43,-2.53 1.6,-1.92 1.51,-5 1.51,-7.48 0,-1.97 0.04,-3.99 -0.03,-5.96 -0.08,-2.04 -0.2,-3.35 -1.11,-4.88 -0.19,-0.32 -0.43,-0.59 -0.63,-0.84 -0.61,-0.74 -1.75,-1.44 -2.76,-1.76 -1.59,-0.51 -3.73,-0.49 -5.52,-0.49 -1.94,0 -4.04,-0.07 -5.95,0.04z';

const cssPxPerMm = 96 / 25.4;

export const a4PageWidthPx = Math.round(210 * cssPxPerMm);
export const a4PageHeightPx = Math.round(297 * cssPxPerMm);
export const chromiumTemplateBodyMarginPx = 8;

export const tileHeightPx = a4PageHeightPx - headerHeightPx - footerHeightPx;

export const greyTileTransform = 'rotate(45 694 -300) translate(294 -700) scale(33.333)';
const yellowTileTransform = `rotate(45 0 ${tileHeightPx + 400}) translate(-400 ${tileHeightPx}) scale(33.333)`;
export const footerBlobTransform = `translate(${a4PageWidthPx - 60} ${footerHeightPx - 60}) scale(5)`;
export const footerBlobLeftTransform = `translate(-60 ${footerHeightPx - 60}) scale(5)`;

export const buildHeaderGreySvgUri = () =>
  `data:image/svg+xml,${encodeURIComponent(buildPageSvg('#EFEFEF', greyTileTransform, headerHeightPx))}`;

export const buildFooterYellowSvgUri = () =>
  `data:image/svg+xml,${encodeURIComponent(buildPageSvg('#f5a623', footerBlobLeftTransform, footerHeightPx))}`;

export const buildPageSvg = (fill, transform, height = tileHeightPx) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${a4PageWidthPx}" height="${height}"><g transform="${transform}"><path fill="${fill}" d="${brandDecorationPath}"/></g></svg>`;

export const buildGreyBackgroundUri = () =>
  `data:image/svg+xml,${encodeURIComponent(buildPageSvg('#EFEFEF', greyTileTransform))}`;

export const buildYellowBackgroundUri = () =>
  `data:image/svg+xml,${encodeURIComponent(buildPageSvg('#f5a623', yellowTileTransform))}`;
