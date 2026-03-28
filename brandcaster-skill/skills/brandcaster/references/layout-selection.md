# Layout Selection Reference

How to scan the `brand-identity/examples/` folder, visually understand the available layouts, and select the best match for each slide.

---

## Step 1: Scan Available Examples

List all `.html` files in `brand-identity/examples/`. Each filename hints at the layout's purpose. The folder is the source of truth — layouts are dynamic and may change as the user adds or removes examples.

> **Note:** By the time layout selection runs (Phase 5), every example already has a corresponding HTML template file — bootstrapped in Phase 4. Work exclusively from the HTML files. PNGs are the visual source of truth used only during bootstrapping, not during slide generation.

---

## Step 2: Read Each HTML Template

Read each `.html` file in `brand-identity/examples/`. The templates are pre-structured with placeholders, `data-ai-edit` attributes, and `aria-label`/`aria-description` annotations that describe the layout. For every template, identify:

- **`aria-description` on `.slide`**: the overall layout summary (e.g. "Split layout: text left 60%, illustration panel right 40%")
- **Background zone**: read from the slide root's `background` or `background-color` style
- **Column / grid structure**: derive from flex/grid CSS on the layout containers
- **Editable zones**: all elements with `data-ai-edit` attributes — note their type, position, and `aria-label`
- **Special elements**: tables, card grids, quote blocks, pipeline nodes — identified by `aria-label` values on structural wrappers
- **Accent patterns**: decorative divs with accent colors, diagonal clips, border treatments

Build a mental map: "this template = these zones in this arrangement."

---

## Step 3: Match Slide Content to Layout

For each slide in the approved outline, read its content type and layout hint, then select the example whose visual structure best accommodates that content.

### Content-type heuristics

| Content in outline | Look for in examples |
|---|---|
| Title / cover slide | Large bold title, tagline, logo prominent, minimal body text |
| Introductory topic with hero image | Split: text/bullets on one side, full-bleed image or illustration on the other |
| Bullet list (up to `maxBullets` items — from `config.json`) | Vertical list zone with clear label area above each item |
| Comparison or pricing | Table or two-column structure; often with a highlighted column |
| Pull quote or bold statement | Large decorative quote marks, centered text, generous whitespace |
| Process / steps / workflow | Horizontal or vertical nodes connected by arrows or lines |
| 3–4 equal-weight concepts with icons | Card grid (2×2 or 3-column), each card with icon + label + short text |
| Speaker bio / team member | Photo zone (circular or rectangular) with name, role, description alongside |
| Contact / closing / thank you | Simple, often full-bleed accent color, contact details centered |
| Data / chart | Large empty zone appropriate for a chart, minimal surrounding text |
| Topic map / ecosystem | Central node with radiating connections |

### When no single example is a perfect match

- Choose the example that matches the most important structural zone (e.g., if the slide is mostly a table, prioritize a table-structured layout even if secondary zones differ)
- Combine ideas from two examples: take the column split from one, the card treatment from another
- Simplify: a complex example can be rendered with fewer cards/nodes if the content is simpler

---

## Step 4: Adapt the Structure

The selected example is a visual reference, not a pixel-perfect template. Adapt freely:

- Change text content to match the slide outline
- Swap background colors (e.g., use yellow-background version for emphasis slides, white for informational)
- Add or remove cards/bullets to match the actual number of items
- Scale icon sizes, adjust font sizes to fit within the `maxWordsPerSlide` limit (from `config.json` → `rules`)
- Keep the core structural arrangement (column splits, grid layout, decorative accents) consistent with the example

---

## Step 5: Note the Layout Choice

When generating the HTML for each slide, note which example was used as reference (e.g., `<!-- layout based on: capa-topico.html -->`). This makes it easy for the user to understand why each layout was chosen and request changes.
