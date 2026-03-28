import { footerHeightPx, contentHorizontalPaddingPx } from './eureka-document-config.mjs';

const contactBottomInsetPx = 6;

const buildContactContent = () =>
  `<div style="position:absolute;inset:0;z-index:1;display:flex;justify-content:center;align-items:flex-end;gap:48px;font-size:9.5px;color:#555;font-family:'Segoe UI',Arial,sans-serif;padding:0 ${contentHorizontalPaddingPx}px ${contactBottomInsetPx}px;box-sizing:border-box;">
  <div style="display:flex;align-items:center;gap:7px;">
    <svg width="14" height="14" viewBox="0 0 24 24" style="flex-shrink:0;">
      <rect width="24" height="24" rx="4" fill="#f5a623"/>
      <path d="M7 9h2v8H7V9zm1-1.5a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2zM11 9h1.9v1.1h.03C13.27 9.45 14.18 9 15.3 9 17.5 9 18 10.4 18 12.3V17h-2v-4.3c0-.8-.02-1.8-1.1-1.8-1.1 0-1.27.86-1.27 1.75V17h-2V9z" fill="#fff"/>
    </svg>
    company/eurekasoftware
  </div>
  <div style="display:flex;align-items:center;gap:7px;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="#f5a623" stroke-width="1.8"/>
      <path d="M2 8l10 7 10-7" stroke="#f5a623" stroke-width="1.8"/>
    </svg>
    contato@eurekalabs.com.br
  </div>
  <div style="display:flex;align-items:center;gap:7px;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke="#f5a623" stroke-width="1.8"/>
    </svg>
    +55 44 9952-6000
  </div>
</div>`;

export const buildEurekaFooterInnerHtml = () => buildContactContent();
