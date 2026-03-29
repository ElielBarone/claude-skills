export const headerHeightPx = 300;
export const footerHeightPx = 160;
export const defaultPagePaddingPx = 60;
export const contentHorizontalPaddingPx = defaultPagePaddingPx;
export const contentTopPaddingPx = 16;
export const contentBottomPaddingPx = 16;



const cssPxPerMm = 96 / 25.4;

export const a4PageWidthPx = Math.round(210 * cssPxPerMm);
export const a4PageHeightPx = Math.round(297 * cssPxPerMm);
export const chromiumTemplateBodyMarginPx = 8;

export const tileHeightPx = a4PageHeightPx - headerHeightPx - footerHeightPx;

export const greyTileTransform = 'rotate(45 694 -300) translate(294 -700) scale(33.333)';
export const yellowTileTransform = `rotate(45 0 ${a4PageHeightPx + 400}) translate(-400 ${a4PageHeightPx}) scale(33.333)`;
export const footerBlobTransform = `translate(${a4PageWidthPx - 60} ${footerHeightPx - 60}) scale(5)`;
export const footerBlobLeftTransform = `translate(-60 ${footerHeightPx - 60}) scale(5)`;
