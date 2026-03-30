# Eureka Document PDF — Architecture

## How it works

Markdown → HTML → Puppeteer (Chromium) → PDF

The generator uses two independent render passes with Puppeteer (`displayHeaderFooter: false`) and composes them with `pdf-lib`:

- Content pass: renders markdown flow only.
- Overlay pass: renders fixed header/footer only.

The final PDF is produced by drawing the overlay page on top of each content page. Page 1 receives the overlay with logo, pages 2+ receive the overlay without logo.

## Key files

| File | Purpose |
|------|---------|
| `generate-eureka-pdf.mjs` | Entry point: renders content and overlay passes, composes final output |
| `generate-eureka-brand-header.mjs` | Builds the fixed header HTML block (logo + grey tile) |
| `generate-eureka-brand-footer.mjs` | Builds the fixed footer HTML block (contact info + orange blob) |
| `generate-eureka-brand-content-styles.mjs` | CSS for layout and markdown content |
| `eureka-document-config.mjs` | All sizing constants |
| `eureka-document-pdf-structure.html` | Base HTML shell with content slot |

## Sizing constants (`eureka-document-config.mjs`)

| Constant | Purpose |
|----------|---------|
| `headerHeightPx` | Height of the header band — reserved in page flow through `@page margin-top` |
| `footerHeightPx` | Height of the footer band — reserved in page flow through `@page margin-bottom` |
| `defaultPagePaddingPx` | Uniform padding applied to content and used for logo/footer alignment |
| `a4PageWidthPx` | Full page width in px — used by geometric constants and decorative transforms |

## Layering strategy

Header and footer are regular DOM nodes inserted at the top of `<body>`, not Puppeteer templates. In overlay mode they are fixed to page extremities using inline CSS:

- Header: `position: fixed; top: 0; left: 0; right: 0; height: headerHeightPx`
- Footer: `position: fixed; bottom: 0; left: 0; right: 0; height: footerHeightPx`

Content and overlay are isolated:

- Content mode CSS reserves safe flow area:
  - `@page { margin: headerHeightPx 0 footerHeightPx }`
  - `.content { padding: defaultPagePaddingPx }`
- Overlay mode CSS uses full bleed:
  - `@page { margin: 0 }`
  - No markdown flow styles are applied

## Multi-page render strategy

1. Render full **content PDF** once.
2. Render one-page **overlay with logo**.
3. Render one-page **overlay without logo**.
4. Compose page-by-page with `pdf-lib`:
   - Copy content page.
   - Draw overlay-with-logo on page index `0`.
   - Draw overlay-without-logo on page indices `>= 1`.

## Conditional logo

The logo (`eureka-logo-horizontal.svg`) is loaded once at startup as a base64 data URI. `buildEurekaHeader({ showLogo: true/false })` controls whether the `<img>` is included in the overlay header HTML.

## Constraints

- Chrome must be available at `/usr/bin/google-chrome`
- All assets (logo, HTML shell) must be in the `assets/` directory
