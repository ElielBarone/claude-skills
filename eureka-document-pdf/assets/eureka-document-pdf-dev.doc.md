# Eureka Document PDF — Architecture

## How it works

Markdown → HTML → Puppeteer (Chromium) → PDF

The generator uses independent render passes with Puppeteer (`displayHeaderFooter: false`) and composes them with `pdf-lib`:

- **Content pass:** renders the document body markdown (flow only, with `@page` margins that clear header/footer bands).
- **Optional cover pass:** if the markdown contains one supported cover comment block, a separate one-page PDF is built with the vertical logo, top/bottom decorative symbols, and the markdown inside the comment delimiters.
- **Overlay pass:** renders fixed header/footer only (one one-page PDF with logo).

The final PDF is produced by optionally prepending the cover page, then copying each body content page and drawing the overlay with the horizontal logo on top of every body page.

## Key files

| File | Purpose |
|------|---------|
| `generate-eureka-pdf.mjs` | Entry point: `splitCoverAndBody`, content/cover/overlay passes, `composePdfWithOptionalCover` |
| `eureka-document-pdf.css` | Brand layout and typography; `edp-*` class rules and `@page` using CSS variables |
| `generate-eureka-brand-cover.mjs` | Full-bleed cover HTML (symbols + vertical logo + `.edp-cover-body` / `.edp-doc`) |
| `generate-eureka-brand-header.mjs` | Fixed header band (`.edp-header-band`, `.edp-header-symbol`, `.edp-header-logo`) |
| `generate-eureka-brand-footer.mjs` | Fixed footer band (`.edp-footer-band`, `.edp-footer-symbol`, `.edp-footer-contact`) |
| `generate-eureka-brand-content-styles.mjs` | Inlined Roboto `@font-face`, `:root` variables from config, and the base stylesheet |
| `eureka-document-config.mjs` | All sizing constants |
| `eureka-document-pdf-structure.html` | Base HTML shell: `__EDP_MODE__` on `<html>`, `.content.edp-content`, content slot |

## Class naming (`edp-*`)

All branded classes use the `edp-` prefix (eureka document pdf) to avoid clashes with authored markdown.

| Prefix | Role |
|--------|------|
| `edp-mode-content` / `edp-mode-cover` / `edp-mode-overlay` | Set on `<html>` per render pass; switches page margins, body chrome, and which layout rules apply. |
| `edp-header-*` | Overlay header band, horizontal logo, decorative symbol. |
| `edp-footer-*` | Overlay footer band, contact rows, decorative symbol. |
| `edp-cover-*` | Cover page root, vertical logo, symbol layers, inner column. |
| `edp-content` | Wrapper around the body slot (with legacy `content` class). |
| `edp-doc` | Markdown flow typography (headings, lists, tables, etc.). |

Presentation lives in `eureka-document-pdf.css`. JavaScript supplies embedded Roboto fonts (base64), `:root` variables (`--edp-header-height`, `--edp-footer-height`, `--edp-page-padding`, `--edp-page-margin-top`, `--edp-page-margin-bottom`) derived from `eureka-document-config.mjs`, and the correct `edp-mode-*` class on `<html>` for each pass.

## Cover block (markdown)

- Supported delimiters:
  - `<!-- cover start -->` ... `<!-- cover end -->`
  - `<!-- capa inicio-->` ... `<!-- capa fim-->`
- **Cover markdown** is everything inside one matched start/end delimiter pair.
- **Body markdown** is everything outside the matched cover block.
- If no full start/end pair is found, no cover is rendered and the whole markdown becomes body content.

## Sizing constants (`eureka-document-config.mjs`)

| Constant | Purpose |
|----------|---------|
| `headerHeightPx` | Height of the header band — reserved in page flow through `@page margin-top` (content mode) and CSS `var(--edp-header-height)` |
| `footerHeightPx` | Height of the footer band — reserved in page flow through `@page margin-bottom` and `var(--edp-footer-height)` |
| `defaultPagePaddingPx` | Uniform padding for content flow and logo/footer alignment (`--edp-page-padding`) |
| `a4PageWidthPx` | Full page width in px — used by geometric constants and decorative transforms |

## Layering strategy

Header and footer are regular DOM nodes inserted at the top of `<body>`, not Puppeteer templates. In overlay mode they are fixed to page extremities using classes in `eureka-document-pdf.css` (`.edp-header-band`, `.edp-footer-band`).

Content and overlay are isolated:

- **Content mode:** `@page` margins from `--edp-page-margin-top` / `--edp-page-margin-bottom` (set from config); `.edp-mode-content .edp-content` padding from `--edp-page-padding`; markdown under `.edp-doc`.
- **Cover mode:** full-bleed `@page` margins (variables set to `0`); cover layout under `.edp-cover-root`; markdown under `.edp-cover-body.edp-doc`.
- **Overlay mode:** full-bleed margins; transparent body; no `.edp-doc` content.

## Multi-page render strategy

1. Optionally render a **one-page cover PDF** when a supported cover comment block is present.
2. Render full **body content PDF** once.
3. Render one-page **overlay with logo**.
4. Compose with `pdf-lib`:
   - If cover exists, copy the cover page first (no overlay).
   - For each body content page index `j`, copy the page and draw overlay-with-logo.

## Conditional logo

The horizontal logo (`eureka-logo-horizontal.svg`) is loaded once at startup as a base64 data URI. `buildEurekaHeader({ showLogo: true })` includes the `<img class="edp-header-logo">` in the overlay header HTML for all body pages. The vertical logo (`eureka-logo-vertical.svg`) is used only on the cover page.

## Constraints

- Chrome must be available at `/usr/bin/google-chrome`
- All assets (logos, HTML shell, CSS) must be in the `assets/` directory
- Avoid `-webkit-text-fill-color: currentColor` in flow typography rules for this pipeline; it can produce selectable but invisible text in generated PDFs.
- Keep overlay root transparency bound to the `<html>` mode class (`html.edp-mode-overlay`) so overlay pages do not paint an opaque background over content pages.
