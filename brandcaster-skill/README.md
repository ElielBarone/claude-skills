# BrandCaster

A Claude Code skill that generates branded HTML presentation slides from text, images, or documents.

## How It Works

1. Provide any input — a topic, notes, a structured outline, uploaded images, or documents
2. Claude generates a slide outline for you to review and refine
3. Once approved, Claude reads your brand identity assets and generates one self-contained HTML file per slide
4. Slides are saved to `decks/<deck-name>/` and include an index page for browsing

## Requirements

- Claude Code with plugin support
- A `brand-identity/` folder in your project root (see structure below)

## Brand Identity Folder

```
brand-identity/
  config.json       ← colors, fonts, spacing, content rules
  fonts/            ← Montserrat-Bold.ttf, Montserrat-Regular.ttf (or your own)
  logos/            ← logo.svg, logo-horizontal.svg, logo-vertical.svg
  icons/            ← SVG icons used in slides
  examples/         ← PNG screenshots of desired slide layouts (the more, the better)
  css/              ← optional custom CSS
```

The `examples/` folder drives layout selection. Add or remove PNG screenshots of slide designs you like — Claude will use them as visual references when generating HTML.

## Usage

In any Claude Code session, describe what you want:

> "Create a presentation about why we're switching to a microservices architecture."

Or provide a structured outline:

> #1
> Why Microservices?
> - Scalability
> - Team autonomy
> - Independent deployments
>
> #2
> Current Pain Points
> Table: Problem | Impact | Priority

Claude will generate an outline, ask for your approval, then produce the slide files.

## Output

```
decks/<deck-name>/
  slide-01.html
  slide-02.html
  ...
  index.html    ← thumbnail browser
```

Open `index.html` in a browser to preview all slides. Each slide is a standalone 1920×1080 HTML file styled with your brand identity.

## Customizing Layouts

Add more PNG screenshots to `brand-identity/examples/` to expand the layout vocabulary. Claude dynamically reads this folder at generation time — no configuration needed.
