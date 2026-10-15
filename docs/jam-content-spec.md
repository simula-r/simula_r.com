# Jam Content Spec

How the "Why hire Jake?" board is composed. It replaces `canvas-content-spec.md` (commit `0e52a54`). `data/graph.json` is the source of truth, and this doc covers the rules behind it so edits stay consistent. For the narration, see `docs/jam-script.md`.

## Goal

The board is a whiteboard design exercise that Jake runs on himself: a jam session titled **"Why hire Jake?"** It argues, explicitly and in order, that he's a great **design engineer**. The structure is part of the argument. A brief, research, principles, evidence and a decision is how a good product person thinks.

In copy, the words are **session, jam, exercise, board**. Never call it FigJam or Figma, and don't name Figma anywhere on the board.

It has to work two ways:

- **Tour:** about 3 minutes, about 450 spoken words, panning left to right.
- **Pan on your own:** a visitor who skips the tour and pans left to right still gets the argument in order, and the side zones reward zooming in.

## The spine

One row, read left to right. Every frame shares the same header: a kicker at y −780, a title at −740, a dek at −590 and a rule at −450. Content starts around y −400. The spine arrows sit at y −200, in the gaps, with a `NEXT · 0N — NAME` label.

| # | Frame | x range | Purpose | Contents |
|---|-------|---------|---------|----------|
| 01 | The brief | −1150 → 1150 | Workshop header. The default camera and the lobby backdrop, so it has to stand on its own. | Session meta, title, problem statement, session details (goal, facilitator, participants, format, output), agenda track, explorer note, controls, a_r sticky |
| 02 | Exhibit A | 2650 → 4650 | Meta-evidence, early because visitors can leave at any time. The board is an engine he built. | A1 canvas, A2 recorder, A3 cursor, a terminal with implementation details, a museum placard, and the "zoom in on this sticky" sticky |
| 03 | Context | 6050 → 8450 | Research: who he is. | Three affinity clusters (design, engineering, range) and two insight stickies |
| 04 | Principles | 9850 → 12050 | The exercise's design principles. | Pull quote, five theses, BS / not BS |
| 05 | Evidence | 13450 → 16650 | Claim cards, strongest first. | 01 ComfyUI (featured), 02 renderer from scratch, 03 games (Compact Disc, Winamp walker, references) |
| 06 | Decision | 18050 → 20050 | The ask. **The tour ends here.** | Option A / Option B checkboxes, contact block, what I'm looking for |

Gaps between frames are about 1,400 world px. Default camera: `{ x: 0, y: 123, zoom: 0.5 }`, which centers the brief at world (0, −246).

## Side zones (off-agenda)

These sit above or below the spine, aren't in the tour, and are labeled `OFF-AGENDA — …`. The brief's explorer note and the `↑` / `↓` pointers in frames 03 and 04 lead to them.

| Zone | Where | Contents |
|------|-------|----------|
| Full timeline | above Context, y ≈ −2750 → −1950 | 1999 → now, nine milestones on the timeline accent |
| Places | below Context, y ≈ 1800 → 3400 | London → Dubai → Europe → San Francisco route, home, spaces (architecture), Max |
| What shaped my taste | below Principles, y ≈ 1800 → 3400 | Shelves: books, screen, cartoons, games, on repeat (with listen links) |

## Copy

- **Big claims on the spine, detail on zoom.** Titles (sans 64) and claims (sans 32) should be readable at wide zoom. Bodies (sans 16) and mono detail are for people who zoom in.
- Jake's voice: direct, confident, a little funny. A claim is always followed by proof.
- **Unknown facts** go in `{{double braces}}`. Never invent years, roles, numbers or URLs. Open items are listed in `data/canvas-todo.md`.

## Type

| Font | Role | Use |
|------|------|-----|
| sans | Titles (64), problem statement (32), claims and card titles (32), deks and fields (24), body (16) | Default for anything people should read |
| mono | Kickers (`01 — THE BRIEF`, 14), labels (`CLAIM 01`, `A1 — THE CANVAS`, 12), metadata, lists, code, links | Techy texture. Fine to use a lot. |
| handwritten | Margin notes (`meta, I know`, `(argue with me)`, `— jake`) | Warmth, sparingly: about one per frame |

## Stickies

A sticky is a reaction placed beside what it reacts to. Use **at most two per frame**, keep each to about six words, and break lines with `\n`. The context frame reads as jam research through its dashed cluster outlines, not through piles of stickies: the stickies there are the two *insights*.

## Accents

The style is an engineer's notebook. Accents are SVG images with `variant: "bare"` in `public/canvas/accents/`: 2px `#8f8f8f` strokes with a single orange `#F8640F` accent, used for structure and never for decoration. Images render at their natural aspect ratio, so an accent SVG must be authored at exactly the size it's placed at (hence `jam-rule-<width>.svg`).

| File | Use |
|------|-----|
| `jam-rule-<w>.svg` | Frame header rule, with an orange lead-in |
| `jam-arrow.svg` | Spine arrow between frames |
| `brief-agenda.svg` | Agenda track. The orange dot marks "you are here" |
| `context-cluster.svg` | Dashed affinity-cluster outline |
| `hook-placard.svg` | Museum placard, with an orange dot |
| `decision-box.svg` / `decision-box-checked.svg` | Option checkboxes |
| `projects-terminal.svg`, `thinking-bar.svg`, `thinking-bs-divider.svg`, `work-timeline.svg`, `inspiration-shelf*.svg`, `life-route.svg` | Reused from the previous board |

## Conventions

- **ids** are semantic and stable, in the form `<frame>.<thing>`, e.g. `brief.title`, `evidence.comfy.claim`, `timeline.m3.label`, `taste.books.neuromancer`.
- **Draw order:** accents, then images, then stickies, then text.
- **Positions** are element centers (CanvasItem translates by −50%). To left-align text, set `x = left + width / 2`.
- **Images** live in `public/canvas/<section>/` and are referenced as `/canvas/...`. `public/uploads/` belongs to the editor.
- **No placeholder images.** If an asset doesn't exist yet, leave it off and list it in `data/canvas-todo.md`.
- **Text never wraps**, so break lines with `\n` (about 50 characters for sans 16).
