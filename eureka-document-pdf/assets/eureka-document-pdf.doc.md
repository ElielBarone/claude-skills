# Eureka Document PDF — Architecture

## How it works

Markdown → HTML → Puppeteer (Chromium) → PDF

The generator uses independent render passes with Puppeteer (`displayHeaderFooter: false`) and composes them with `pdf-lib`:

- **Content pass:** renders the document body markdown (flow only, with `@page` margins that clear header/footer bands).
- **Optional cover pass:** if the markdown begins with `# Cover` or `# Capa` (case-insensitive), a separate one-page PDF is built with the vertical logo, top/bottom decorative symbols, and the markdown between that heading and the next level-1 `#` heading.
- **Overlay pass:** renders fixed header/footer only (two one-page PDFs: with logo, without logo).

The final PDF is produced by optionally prepending the cover page, then copying each body content page and drawing the appropriate overlay on top. The **first body page** receives the overlay with the horizontal logo; further body pages receive the overlay without the logo.

## Key files

| File | Purpose |
|------|---------|
| `generate-eureka-pdf.mjs` | Entry point: `splitCoverAndBody`, content/cover/overlay passes, `composePdfWithOptionalCover` |
| `generate-eureka-brand-cover.mjs` | Full-bleed cover HTML (symbols + vertical logo + `.cover-body`) |
| `generate-eureka-brand-header.mjs` | Builds the fixed header HTML block (logo + grey tile) |
| `generate-eureka-brand-footer.mjs` | Builds the fixed footer HTML block (contact info + orange blob) |
| `generate-eureka-brand-content-styles.mjs` | CSS for `content`, `overlay`, and `cover` modes |
| `eureka-document-config.mjs` | All sizing constants |
| `eureka-document-pdf-structure.html` | Base HTML shell with content slot |

## Cover block (markdown)

- The **first non-empty line** must be `# Cover` or `# Capa` (case-insensitive) to enable a cover.
- **Cover markdown** is everything after that line until the next line that matches a level-1 ATX heading (`# ` at column 0). Headings with `##` or deeper do not end the block.
- **Body markdown** is the rest of the file from that next `#` line onward. The marker line itself is not rendered on the cover; only the inner markdown is passed through `marked` into `.cover-body`.

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
- Cover mode CSS uses full bleed:
  - `@page { margin: 0 }`
  - Markdown flow styles scoped to `.cover-body`
- Overlay mode CSS uses full bleed:
  - `@page { margin: 0 }`
  - No markdown flow styles are applied

## Multi-page render strategy

1. Optionally render a **one-page cover PDF** when `# Cover` / `# Capa` is present.
2. Render full **body content PDF** once.
3. Render one-page **overlay with logo**.
4. Render one-page **overlay without logo**.
5. Compose with `pdf-lib`:
   - If cover exists, copy the cover page first (no overlay).
   - For each body content page index `j`, copy the page and draw overlay-with-logo on `j === 0`, overlay-without-logo on `j >= 1`.

## Conditional logo

The horizontal logo (`eureka-logo-horizontal.svg`) is loaded once at startup as a base64 data URI. `buildEurekaHeader({ showLogo: true/false })` controls whether the `<img>` is included in the overlay header HTML. The vertical logo (`eureka-logo-vertical.svg`) is used only on the cover page.

## Constraints

- Chrome must be available at `/usr/bin/google-chrome`
- All assets (logos, HTML shell) must be in the `assets/` directory
