---
name: eureka-document-pdf
description: Use when generating branded Eureka PDFs from markdown.
---

# Eureka Document PDF

Generate a branded Eureka PDF from a Markdown file with reliable multipage layout.

The run is complete only when all validation gates pass.

## Acceptance Gates

Treat any failed gate as a failed run.

1. **Cover (optional):** If the source markdown includes one supported cover comment block, the first PDF page is the cover (vertical logo, decorative symbols, inner markdown in `.edp-cover-body`). The cover page does not use the header/footer overlay.
2. **Body pages header:** Every page of the **body** content (the page after an optional cover, or PDF page 1 when there is no cover) uses the overlay with the horizontal Eureka logo.
3. **Footer:** `buildEurekaFooter` appears on every **body** page via the overlay. The cover page shows decorative symbols only, not the full footer strip.
4. **Layout:** Body text does not overlap the header or footer bands reserved by `headerHeightPx` / `footerHeightPx`.
5. **Page breaks:** Section headings must not sit alone at the bottom of a page while the following body content starts on the next page. The stylesheet applies print rules on `.euk-doc h1`–`h6` (`break-after: avoid-page`, legacy `page-break-after: avoid`) so headings stay with the content that follows.

## Input immutability (mandatory)

- `INPUT_MD` is read-only for this skill run.
- Never edit, rewrite, or overwrite the source markdown file.
- Rendering must only read `INPUT_MD` and write a separate `OUTPUT_PDF`.

## Page breaks and section cohesion

- Prefer normal markdown headings; CSS handles orphan headings for PDF.
- If the source already contains raw HTML blocks (for example `.euk-keep-together`), preserve them exactly as-is.

## Cover block syntax

- Supported delimiters:
  - `<!-- cover start -->` ... `<!-- cover end -->`
  - `<!-- capa inicio-->` ... `<!-- capa fim-->`
- Cover content: markdown inside one matched start/end delimiter pair.
- Document body: markdown outside the matched cover delimiter block.
- If there is no valid full start/end pair, the document is rendered without cover.

## Canonical implementation references

- `assets/generate-eureka-pdf.mjs` (`splitCoverAndBody`, `composePdfWithOptionalCover`)
- `assets/generate-eureka-brand-cover.mjs`
- `assets/generate-eureka-brand-header.mjs`
- `assets/generate-eureka-brand-footer.mjs`
- `assets/generate-eureka-brand-content-styles.mjs`
- `assets/eureka-document-pdf.css` (`edp-*` classes; modes `edp-mode-content` / `edp-mode-cover` / `edp-mode-overlay`)
- `assets/eureka-document-pdf-structure.html` (`__EDP_MODE__` placeholder on `<html>`)

## Phase 1 — Resolve inputs

Identify:

- `PROJECT_ROOT`: repository root
- `INPUT_MD`: absolute path to source markdown
- `OUTPUT_PDF`: absolute output path (`INPUT_MD` with `.pdf` if not specified)

Rules:

- `OUTPUT_PDF` must not be the same path as `INPUT_MD`.
- `OUTPUT_PDF` must use the `.pdf` extension.

Required:

- `assets/eureka-logo-horizontal.svg`, `assets/eureka-logo-vertical.svg`
- `assets/eureka-document-pdf.css`, `assets/eureka-document-pdf-structure.html`
- `assets/generate-eureka-pdf.mjs`

Stop and report any missing path before continuing.

## Phase 2 — Preflight

```bash
npm install --save-dev puppeteer-core marked pdf-lib
```

Confirm:

- Chrome at `/usr/bin/google-chrome` (or set `EUREKA_CHROME_PATH` to use a different binary path).
- `displayHeaderFooter` is **false**; header and footer are part of the overlay HTML, not Chromium templates.
- Body content uses `@page` margins from `headerHeightPx` / `footerHeightPx` in `eureka-document-config.mjs`.
- Launch args include `--no-sandbox` and `--disable-setuid-sandbox`.

## Phase 3 — Render

```bash
node assets/generate-eureka-pdf.mjs "<INPUT_MD>" "<OUTPUT_PDF>"
```

Expected: command exits successfully and `OUTPUT_PDF` is created. If generation fails, do not claim success.

Verify source integrity before claiming success:

```bash
sha256sum "<INPUT_MD>"
node assets/generate-eureka-pdf.mjs "<INPUT_MD>" "<OUTPUT_PDF>"
sha256sum "<INPUT_MD>"
```

The two checksums for `INPUT_MD` must match.

### Missing header or footer on body pages

Diagnose:

- Broken overlay HTML generation.
- `pdf-lib` merge failure.

Fix:

- Rebuild overlays via `buildEurekaHeader({ showLogo: true })` and `buildEurekaFooter`.
- Regenerate and re-run validation gates.
