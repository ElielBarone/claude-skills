---
name: brandcaster
description: This skill should be used when the user asks to "create a presentation", "generate slides", "make a deck", "turn this into slides", "create a pitch deck", "make a slideshow", or provides notes, text, images, or documents and wants branded HTML slides. Trigger even when the user doesn't say "slides" explicitly — if they want to present something visually or share content as a deck, this skill applies.
version: 0.1.0
---

# BrandCaster

Generate branded HTML presentation slides from any input — text, structured outlines, images, or documents — using the brand identity defined in `brand-identity/`.

Each generated deck is a folder of self-contained HTML files, one per slide, styled entirely with the project's brand assets. No external CSS frameworks. No missing image URLs. Every slide works offline.

---

## Phase 1 — Intake

Accept any combination of input:

- **Plain text**: a paragraph or free-form notes describing what the presentation should cover
- **Structured outline**: slides prefixed with `#1`, `#2`, etc., each followed by content lines
- **Images**: reference images, logos, or visual examples the user uploads
- **Documents**: PDFs, markdowns, or other text documents to extract content from
- **Mixed**: any combination of the above

If the user provides only a topic or vague description, infer a logical slide sequence: typically intro → context → main content → conclusion/CTA.

---

## Phase 2 — Generate Outline

Before reading brand assets or generating HTML, produce a clear outline for the user to review.

For each slide, include:
- Slide number and title
- Content in the most appropriate format: a paragraph, a bullet list, a table, numbered steps, a pull quote, a stat callout, or a description of an illustration — whatever best fits the slide's purpose
- A layout hint (a short label describing the intended visual structure, e.g., "split: image left, bullets right" or "full-bleed: bold statement + illustration")

Follow the brand rules from `brand-identity/config.json`:

**Display the outline clearly before generating any HTML.** Use markdown headers for slide titles and nested content beneath each.

---

## Phase 3 — Review Loop

After displaying the outline, ask:

> "Does this outline look good? Feel free to add, remove, reorder, or rewrite any slide before I generate the HTML."

Do not proceed to Phase 4 until the user explicitly approves (e.g. "looks good", "go ahead", "yes", "generate it").

Incorporate any requested changes, redisplay the updated outline if significant edits were made, then wait for approval again.

---

## Phase 4 — Read Brand Assets

Once the outline is approved, read:

1. `brand-identity/config.json` — extract palette (primary, secondary, text colors), font names, spacing (slidePadding, elementGap), and content rules
2. **Bootstrap HTML layout templates** for all examples in `brand-identity/examples/`:
   - List all PNG files in `brand-identity/examples/`
   - For each PNG, check whether a file with the **same base name but `.html` extension** exists in the same folder
     - **If the HTML exists**: read it — this is the canonical layout template; do **not** modify it
     - **If no HTML exists**: view the PNG, then generate and save a layout template as `brand-identity/examples/<name>.html`
   - After this step every example must have a corresponding `.html` file; use those HTML files (not PNGs) as the layout vocabulary in Phase 5

   **Rules for generated HTML layout templates:**
   - Use the same 1920×1080 document shell and brand CSS variables defined in `references/html-generation.md`
   - Reproduce the layout structure of the PNG faithfully: column splits, background color zones, accent elements, header/title position, image/illustration zones, icon placements
   - Fill every content zone with clearly-marked placeholders — e.g. `[SLIDE TITLE]`, `[BODY TEXT — max 40 words]`, `[BULLET ITEM]`, `[ICON]`, `[ILLUSTRATION]`
   - Add `data-ai-edit` attributes on every editable zone (values: `title`, `body`, `image`, `icon`, `table`, `chart`, `logo` — see `references/html-generation.md`)
   - Add `aria-label` attributes on structural zones describing their semantic role and position, e.g. `aria-label="main slide title"`, `aria-label="three-column feature card grid"`, `aria-label="illustration zone — right panel 40% width"`
   - Add an `aria-description` on the slide root summarising the overall layout pattern, e.g. `aria-description="Split layout: text content left 60%, illustration panel right 40%, yellow accent background on right"`
   - Place a comment at the very top of the file: `<!-- Layout template generated from: <filename>.png — do not edit manually -->`
   - Do **not** include real brand content — structural placeholders only

3. All files in `brand-identity/icons/` — note the available SVG icon filenames for use in slides
4. All files in `brand-identity/logos/` — note the available logo variants

For layout selection guidance, read `references/layout-selection.md`.

---

## Phase 5 — Generate HTML Slides

Ask the user for a short deck name (a URL-friendly slug, e.g. `claude-vs-cursor`). Create the output folder:

```
decks/<deck-name>/
  slide-01.html
  slide-02.html
  ...
  index.html
```

For each slide:

1. **Select layout**: review the example HTML templates bootstrapped in Phase 4 and pick the one whose structure best matches the slide's content type and layout hint from the outline. Read `references/layout-selection.md` for selection guidance.

2. **Generate HTML**: produce a self-contained file following all rules in `references/html-generation.md`.

3. **Write the file**: save to `decks/<deck-name>/NN-title-slide.html` (zero-padded number).

After all slides, generate `decks/<deck-name>/index.html` — a thumbnail browser showing all slides as scaled previews with links.

---

## Phase 6 — Summary

Output a completion message listing all created files and how to open them:

```
Deck saved to decks/<deck-name>/

  slide-01.html — [Title]
  slide-02.html — [Title]
  ...
  index.html    — Thumbnail index

Open decks/<deck-name>/index.html in a browser to browse all slides.
Open any slide at 1920×1080 for full-size viewing.
```

---

## Additional Resources

- **`references/html-generation.md`** — full HTML template, brand enforcement rules, CSS variable setup, font paths, inline SVG icons, embedded illustrations, chart patterns, `data-ai-edit` attributes, and the index page pattern
- **`references/layout-selection.md`** — how to analyze example PNGs and map slide content types to visual layouts
