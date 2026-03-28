# HTML Generation Reference

Rules and patterns for generating self-contained slide HTML files.

---

## Document Shell

Every slide is a single `.html` file. All CSS is embedded.

> **Before writing any slide HTML**, read `brand-identity/config.json` and derive all values from it:
> - CSS variable hex values → from `palette`
> - Font file names → from `typography`
> - `--slide-padding` → `spacing.slidePadding` (append `px`)
> - `--element-gap` → `spacing.elementGap` (append `px`)
> - Content limits → `rules.maxWordsPerSlide`, `rules.maxBullets`, `rules.maxColumns`
> - External libs → `cssLibs` and `chartLib` (see **External libraries** note below)
>
> Never hardcode these values — always reflect what is currently in `config.json`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920">
  <title>Slide NN — [Slide Title]</title>
  <style>
    /* === FONT LOADING — file stems come from config.json typography.title / typography.body === */
    @font-face {
      font-family: '[config: typography.title]';
      src: url('../../brand-identity/fonts/[config: typography.title].ttf') format('truetype');
      font-weight: 700;
    }
    @font-face {
      font-family: '[config: typography.body]';
      src: url('../../brand-identity/fonts/[config: typography.body].ttf') format('truetype');
      font-weight: 400;
    }

    /* === BRAND CSS VARIABLES — all values injected from config.json === */
    :root {
      --color-primary:      [config: palette.primary.main];
      --color-primary-dark: [config: palette.primary.dark];
      --color-secondary:      [config: palette.secondary.main];
      --color-secondary-dark: [config: palette.secondary.dark];
      --color-text:       [config: palette.text.color];
      --color-text-muted: [config: palette.text.disabled];
      --font-title: '[config: typography.title]', sans-serif;
      --font-body:  '[config: typography.body]', sans-serif;
      --slide-padding: [config: spacing.slidePadding]px;
      --element-gap:   [config: spacing.elementGap]px;
    }

    /* === RESET === */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { margin: 0; padding: 0; overflow: hidden; background: #f0f0f0; }

    /* === SLIDE ROOT === */
    .slide {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      position: relative;
      font-family: var(--font-body);
      color: var(--color-text);
    }
  </style>
</head>
<body>
  <div class="slide">
    <!-- slide content here -->
  </div>
</body>
</html>
```

### External libraries (`cssLibs` / `chartLib`)

`config.json` may declare `cssLibs` (e.g. `["tailwind"]`) and `chartLib` (e.g. `"echarts"`). When present:

- **If a local copy exists** at `brand-identity/libs/<name>.js` (or `.css`), load it with a relative `<script src="...">` / `<link>` — slides remain offline-capable.
- **If no local copy exists**, load from CDN and add a comment: `<!-- CDN dependency: echarts — requires internet connection -->`.
- If `cssLibs` is empty or absent, generate all CSS inline without any framework.

---

## Brand Enforcement Rules

### Dimensions
- Slide root is always `1920px × 1080px`. Never use `vh`, `vw`, or `%` for slide-level sizing.
- `overflow: hidden` on the slide root — content must never overflow.
- All inner content must fit within the 1080px height.

### Spacing
- Standard padding: `var(--slide-padding)` — value from `config.json` → `spacing.slidePadding`
- Gap between elements: `var(--element-gap)` — value from `config.json` → `spacing.elementGap`

### Colors
- Use CSS variables (`var(--color-primary)`, etc.) for all brand colors — never raw hex
- `--color-primary` (from `palette.primary.main`): accent, highlight backgrounds, decorative elements
- `--color-secondary` (from `palette.secondary.main`): secondary elements, borders
- `--color-text` (from `palette.text.color`): body text, headings

### Typography
- Headings: `font-family: var(--font-title); font-weight: 700; color: var(--color-text);`
- Body: `font-family: var(--font-body); font-weight: 400; color: var(--color-text-muted);`
- Title size: typically `64px–80px` for main slide titles
- Body size: `24px–32px`

### Content limits
Read limits from `config.json` → `rules`:
- Max `maxWordsPerSlide` words of body text per slide
- Max `maxBullets` bullet items
- Max `maxColumns` body columns

---

## `data-ai-edit` Attributes

Add `data-ai-edit` to every editable zone so future AI editing can target them:

| Attribute value | Element type |
|---|---|
| `title` | Main heading (`h1`, `h2`) |
| `body` | Body text containers (`p`, `div`, `ul`) |
| `image` | Image or illustration containers |
| `chart` | Chart containers |
| `icon` | Icon wrappers |
| `table` | Table elements |
| `logo` | Logo container |

---

## Icons

Read the SVG file content from `brand-identity/icons/<filename>.svg` and paste the raw SVG XML inline.

- Remove any hardcoded `width`/`height` attributes from the `<svg>` root
- Keep the `viewBox` attribute
- Control size with a wrapper div: `style="width: 48px; height: 48px;"`
- Control color by setting `fill` or `stroke` on the wrapper or the SVG via CSS

```html
<div class="icon-wrapper" data-ai-edit="icon" style="width:48px; height:48px; color: var(--color-primary);">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <!-- pasted SVG path content -->
  </svg>
</div>
```

---

## Illustrations and Images

Do NOT use `<img>` tags pointing to external URLs or missing files. Instead:

**Option A — Inline SVG illustration**: Generate a contextually relevant SVG illustration directly in the HTML. Match the brand's color palette. Keep it abstract and clean (geometric shapes, simple figures, icons, diagrams).

```html
<div class="illustration" data-ai-edit="image" style="width:100%; height:100%;">
  <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
    <!-- AI-generated illustration using brand colors -->
    <rect width="400" height="300" fill="#f8f8f8"/>
    <circle cx="200" cy="150" r="80" fill="#FFCC29" opacity="0.3"/>
    <!-- ... more shapes ... -->
  </svg>
</div>
```

**Option B — Base64-encoded image**: When a real photo or raster image is available (user-provided or tool-generated), encode it as base64 and embed it inline. This keeps the file fully self-contained and offline-capable.

```html
<div class="image-zone" data-ai-edit="image" style="width:100%; height:100%; overflow:hidden;">
  <img src="data:image/png;base64,[BASE64_DATA]"
       alt="[descriptive alt text]"
       style="width:100%; height:100%; object-fit:cover;" />
</div>
```

**Option C — CSS placeholder**: Last resort when no image source is available and an SVG illustration is not appropriate. Use a styled div that communicates the visual intent.

```html
<div class="image-placeholder" data-ai-edit="image"
     style="background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
            display:flex; align-items:center; justify-content:center;
            font-size:18px; color:white; font-style:italic;">
  [Illustration: person working at laptop]
</div>
```

**Selection priority:**
1. **Option A** — preferred for diagrams, abstract art, icons, and any visual that can be drawn with shapes; always offline, zero external dependency
2. **Option B** — use when a real photograph or raster image is available and can be encoded; keeps file self-contained
3. **Option C** — last resort only; never use when A or B is viable

---

## Charts

Check `config.json` → `chartLib` before generating charts:

- If `chartLib` is set (e.g. `"echarts"`), use that library — load it from a local copy if available (`brand-identity/libs/echarts.min.js`), otherwise from CDN with an internet-required comment.
- If `chartLib` is absent or `null`, render charts as pure SVG with no external dependency.

**Fallback — simple bar chart in pure SVG** (when no chartLib or no local copy available):

```html
<div class="chart-container" data-ai-edit="chart" style="width:100%; height:320px;">
  <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
    <!-- Use style= not fill= so CSS variables resolve correctly -->
    <rect x="40"  y="60"  width="80" height="200" style="fill:var(--color-primary);"/>
    <rect x="160" y="120" width="80" height="140" style="fill:var(--color-secondary);"/>
    <rect x="280" y="40"  width="80" height="220" style="fill:var(--color-primary); opacity:0.7;"/>
    <text x="80"  y="290" text-anchor="middle" font-size="14" style="fill:var(--color-text);">Option A</text>
    <text x="200" y="290" text-anchor="middle" font-size="14" style="fill:var(--color-text);">Option B</text>
    <text x="320" y="290" text-anchor="middle" font-size="14" style="fill:var(--color-text);">Option C</text>
  </svg>
</div>
```

---

## Common Layout Patterns

### Split layout (50/50)
```html
<div class="slide" style="display:flex;">
  <div class="panel-left" style="width:50%; height:1080px; padding:var(--slide-padding); display:flex; flex-direction:column; justify-content:center;">
    <!-- content -->
  </div>
  <div class="panel-right" style="width:50%; height:1080px; background:var(--color-primary); display:flex; align-items:center; justify-content:center;">
    <!-- image / illustration -->
  </div>
</div>
```

### Full-bleed accent background
```html
<div class="slide" style="background:var(--color-primary); padding:var(--slide-padding); display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
  <!-- centered content -->
</div>
```

### Card grid (2×2)
```html
<div class="slide" style="padding:var(--slide-padding); display:flex; flex-direction:column; gap:var(--element-gap);">
  <h1 data-ai-edit="title" style="font-size:56px; font-weight:700; color:var(--color-text);">Title</h1>
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--element-gap); flex:1;">
    <div class="card" style="background:white; border-radius:16px; padding:40px; display:flex; gap:24px; align-items:flex-start; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div data-ai-edit="icon" style="width:48px; height:48px; flex-shrink:0;"><!-- icon SVG --></div>
      <div>
        <h3 style="font-size:28px; font-weight:700; margin-bottom:12px;">Card Title</h3>
        <p data-ai-edit="body" style="font-size:22px; line-height:1.5; color:var(--color-text-muted);">Description text.</p>
      </div>
    </div>
    <!-- repeat cards -->
  </div>
</div>
```

### Table slide
```html
<table data-ai-edit="table" style="width:100%; border-collapse:collapse; font-size:24px;">
  <thead>
    <tr style="border-bottom:3px solid var(--color-text);">
      <th style="padding:16px; text-align:left; font-weight:700;">Column A</th>
      <th style="padding:16px; text-align:left; font-weight:700;">Column B</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e0e0e0;">
      <td style="padding:16px;">Value</td>
      <td style="padding:16px;">Value</td>
    </tr>
  </tbody>
</table>
```

---

## Index Page (`index.html`)

The index page shows all slides as thumbnail previews.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>[Deck Name] — Slides</title>
  <style>
    body { font-family: sans-serif; background: #1a1a1a; color: white; margin: 0; padding: 40px; }
    h1 { font-size: 32px; margin-bottom: 32px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, 192px); gap: 24px; }
    .thumb { width: 192px; }
    .thumb-frame { width: 192px; height: 108px; overflow: hidden; border-radius: 6px; border: 2px solid #333; }
    .thumb-frame iframe {
      width: 1920px; height: 1080px;
      transform: scale(0.1); transform-origin: top left;
      pointer-events: none; border: none;
    }
    .thumb a { display:block; margin-top:8px; font-size:13px; color:#FFCC29; text-decoration:none; }
    .thumb a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>[Deck Name]</h1>
  <div class="grid">
    <div class="thumb">
      <div class="thumb-frame">
        <iframe src="slide-01.html" scrolling="no"></iframe>
      </div>
      <a href="slide-01.html">01 — [Title]</a>
    </div>
    <!-- repeat for each slide -->
  </div>
</body>
</html>
```

Note: `transform: scale(0.1)` renders a 1920px iframe in a 192px container (1/10 scale). Adjust to `scale(0.1)` (192/1920) for correct thumbnail sizing.
