---
name: eureka-document-pdf
description: Use when generating branded Eureka PDFs from markdown.
---

# Eureka Document PDF

Generate a branded Eureka PDF from a Markdown file with reliable multipage layout.

The run is complete only when all validation gates pass.

## Acceptance Gates

Treat any failed gate as a failed run.

1. Page 1: header shows the Eureka logo (`buildEurekaHeader(logoDataUri)`). Pages 2+: header shows the grey top symbol (`buildEurekaHeader()`), not the logo.
2. Footer (`buildEurekaFooter`) appears on every page.
3. Body content does not overlap header or footer.

## Header and Footer Template Placement

Chromium renders `headerTemplate`/`footerTemplate` in a separate mini-document with a default **`body { margin: 8px }`**. The canonical templates compensate using **`chromiumTemplateBodyMarginPx`** (8) from `eureka-document-config.mjs`: **`margin: -8px -8px 0 -8px`** on the outer shell and **`width: a4PageWidthPx + 16`**. Do not rely on `<style>html,body{margin:0}</style>` alone.

## Canonical Implementation References

- `assets/generate-eureka-pdf.mjs`
- `assets/generate-eureka-brand-header.mjs`
- `assets/generate-eureka-brand-footer.mjs`
- `assets/generate-eureka-brand-content-styles.mjs`


`buildPlaceholderHeaderTemplate` (in `generate-eureka-brand-header.mjs`) is used only for the internal page-count PDF pass; it is not part of the final merged output.

## Phase 1 — Resolve Inputs

Identify:

- `PROJECT_ROOT`: repository root
- `INPUT_MD`: absolute path to source markdown
- `OUTPUT_PDF`: absolute output path (`INPUT_MD` with `.pdf` if not specified)

Required files:

- `assets/euk-logo-horizontal.png`
- `assets/generate-eureka-pdf.mjs`

Stop and report any missing path before continuing.

## Phase 2 — Preflight

```bash
npm install --save-dev puppeteer-core marked pdf-lib
```

Confirm:

- Chrome at `/usr/bin/google-chrome` (override `executablePath` in `assets/generate-eureka-pdf.mjs` if different).
- `displayHeaderFooter: true` is set.
- PDF top/bottom margins use `headerHeightPx` / `footerHeightPx` from `eureka-document-config.mjs`.
- Launch args include `--no-sandbox` and `--disable-setuid-sandbox`.

## Phase 3 — Render

```bash
node assets/generate-eureka-pdf.mjs "<INPUT_MD>" "<OUTPUT_PDF>"
```

Expected: command exits successfully and `OUTPUT_PDF` is created. If generation fails, do not claim success.

### Missing header or footer

Diagnose:
- `displayHeaderFooter` disabled.
- Broken template generation.
- `pdf-lib` merge failure.

Fix:
- Ensure `displayHeaderFooter: true` in `assets/generate-eureka-pdf.mjs`.
- Rebuild templates via `buildEurekaHeader(logoDataUri)`, `buildEurekaHeader()`, `buildEurekaFooter` (and `buildPlaceholderHeaderTemplate` for the internal counting pass).
- Regenerate and re-run validation gates.
