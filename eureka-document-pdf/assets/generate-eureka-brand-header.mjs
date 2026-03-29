import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultPagePaddingPx, headerHeightPx } from "./eureka-document-config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.join(__dirname, 'eureka-logo-horizontal.svg');
const logoDataUri = existsSync(logoPath)
  ? `data:image/svg+xml;base64,${readFileSync(logoPath).toString('base64')}`
  : null;

export const buildEurekaHeader = ({ isFirstPage = true, showLogo = true }) => {
  
  const logoImgStyles = `
  position:absolute;
  top:${defaultPagePaddingPx}px;
  right:${defaultPagePaddingPx}px;
  height:40px;
  display:block;
  z-index: -1;`;
  const logoImg = showLogo ? `<img src="${logoDataUri}" alt="Eureka" style="${logoImgStyles}" />` : '';

  const headerWrapperCommonStyles = `top:0;left:0;right:0;height:${headerHeightPx}px;z-index:1;overflow:hidden;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;`;
  const headerWrapperStyles = isFirstPage
    ? `position:absolute;${headerWrapperCommonStyles}`
    : `position:fixed;${headerWrapperCommonStyles}`;

  const topRightSvgStyles = `
  width: 800px;
  position:absolute; 
  right:-280px;
  top:-760px; 
  transform: rotate(45deg);
  z-index: -2;`;
  return `
<div style="${headerWrapperStyles}">
<svg style="${topRightSvgStyles}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EFEFEF" d="M7.99 0.06c-2.94,0.16 -4.69,0.38 -6.47,2.53 -1.6,1.95 -1.51,4.96 -1.51,7.48 0,1.97 -0.04,3.99 0.03,5.96 0.11,2.9 0.44,4.72 2.54,6.45 1.94,1.6 4.95,1.51 7.48,1.51 1.98,0 4,0.04 5.99,-0.03 2.94,-0.1 4.69,-0.46 6.43,-2.53 1.6,-1.92 1.51,-5 1.51,-7.48 0,-1.97 0.04,-3.99 -0.03,-5.96 -0.08,-2.04 -0.2,-3.35 -1.11,-4.88 -0.19,-0.32 -0.43,-0.59 -0.63,-0.84 -0.61,-0.74 -1.75,-1.44 -2.76,-1.76 -1.59,-0.51 -3.73,-0.49 -5.52,-0.49 -1.94,0 -4.04,-0.07 -5.95,0.04z"/>
        </svg>
  ${logoImg}
</div>`;
};
