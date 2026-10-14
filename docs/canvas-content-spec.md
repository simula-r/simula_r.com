# Canvas Content Spec

How the portfolio whiteboard is composed. `data/graph.json` is the source of truth. This doc covers the rules behind it, so edits and new content stay consistent.

## Goal

One flat board that answers four questions fast:

1. **What level is this person?** Designer's designer, engineer's engineer.
2. **What drives him?** Every medium that puts pixels on a screen.
3. **How does he think?** Opinionated about design engineering in the AI era.
4. **Who is he?** London, Dubai, Europe, home to California.

It has to work two ways: as a roughly 5-minute narrated tour that moves past detail quickly, and as free exploration where every section reads well once you zoom in.

## Composition

- **Sections are small webpages.** Each one has a freeform layout of its own, with some structure but nothing rigid. There are no frames around anything.
- **Generous space between sections:** about 1,300–1,600 world px, so each one reads as its own place.
- **Start is the warm center.** No graphic. The warmth comes from layout: a centered letter, a signature, an index of the sections, and section names with arrows pointing outward near the edges.

| # | Section | Where | Contents |
|---|---------|-------|----------|
| — | Start | center | Greeting, letter, index, controls, a_r sticky |
| 01 | Work | top | Timeline 1999 → now, ComfyUI feature |
| 02 | Projects | right | Graphics, games, this site (three columns) |
| 03 | Thinking | left | Pull quote, five theses, why I build, BS / not BS |
| 04 | Inspiration | bottom left | Covers on shelf lines: books, screen, cartoons, games, music |
| 05 | Life | bottom right | Travel route with photos, home, spaces |

Default camera: `{ x: 0, y: 0, zoom: 0.45 }`.

## Type

| Font | Role | Use |
|------|------|-----|
| sans | Titles (64), section intros (24), body (16), subheads (32) | Easiest to read. Default for anything people should read. |
| mono | Kickers (`01 — WORK`, 14), metadata, captions (12), lists, code, links | Techy texture. Fine to use a lot. |
| handwritten | Margin notes, the signature | Warmth, used sparingly. About one per section at most. |

## Stickies

A sticky is an afterthought, a reaction, an idea or a short list: something that focuses the eye next to the content it comments on. Stickies are hard to read and take up space, so use **at most two per section** and always place them beside what they react to. Paper is about 248×243 and fits about 6 words; break lines with `\n`.

## Accents

Our style is an **engineer's notebook**: more polished than Excalidraw, looser than Figma. Accents are SVG images with `variant: "bare"` (no photo outline), stored in `public/canvas/accents/`:

- 2px strokes in `#8f8f8f` (readable in both light and dark), with a single orange accent `#F8640F`
- Used for structure, never decoration: timeline line, shelf lines, travel route, quote bar, dividers, terminal box

## Conventions

- **ids** are semantic and stable: `<section>.<thing>`, e.g. `work.m3.label`, `inspiration.books.algernon`.
- **Draw order:** accents → images → stickies → text.
- **Images** live in `public/canvas/<section>/` and are referenced as `/canvas/...`. `public/uploads/` belongs to the editor.
- **No placeholder images.** If an asset doesn't exist yet, leave it off the board and list it in `data/canvas-todo.md`.
- **Unknown facts** go in `{{double braces}}`. Never invent years, roles or numbers.
- **Text never wraps**, so break lines with `\n` (about 50 characters for sans 16).

## Tour budget

About 300 seconds, around 750 spoken words. One chapter per stop: Start 0:30 · Work 1:00 · Projects 1:00 · Thinking 0:45 · Inspiration 0:40 · Life 0:45 · Outro 0:20. Narrate from the titles and stickies, and let explorers come back for the mono detail.
