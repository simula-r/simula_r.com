# Canvas Content Spec, v0

The brief for producing the first full version of the portfolio whiteboard. An agent reads it and generates `data/graph.json`, the assets, a tour script and a TODO list in one pass. After that, Jake does the final 20% by hand in `/edit`.

---

## 1. What the board has to do

A visitor lands on one flat whiteboard (no nested canvases). Within a few minutes they should be able to answer four questions:

| # | Question | Answer the board gives |
|---|----------|------------------------|
| 1 | **What level is this person?** | Silicon Valley level. A designer's designer and an engineer's engineer. Parsons plus real engineering, graphics from first principles, ComfyUI, and he built the whiteboard you're standing in. |
| 2 | **What drives him?** | Every medium that puts pixels on a screen: graphic design, 3D, game art, architecture, music, cartoons, games. |
| 3 | **How does he think?** | Opinionated. A short thesis on design engineering in the AI era, why he picks hard but real work, and what he thinks is BS. |
| 4 | **Who is he as a person?** | Lived in London and Dubai, worked his way across Europe with a startup, chose California and family, and someday wants a small old cabin near the mountains. |

The board is a project in its own right, and it should say so.

## 2. The core constraint: built for both the tour and free exploring

Every zone gets used in two ways:

- **Tour (about 5 minutes, 7 at most).** Jake narrates while a_r flies the camera. The tour moves past most detail quickly.
- **Explore (as long as they like).** Visitors wander on their own, before or after the tour, and dig into whatever the tour skipped.

That gives a three-level readability ladder. Every element is placed on purpose at one level.

| Level | Camera zoom | Who it's for | What must be readable |
|-------|-------------|--------------|------------------------|
| **L0 Map** | 0.12–0.2 | First look, tour transitions | Zone labels (big frame titles) and hero visuals. The board reads like a map of districts. |
| **L1 Zone** | 0.4–0.6 | **The tour lives here** | Zone headline, stickies, large images. **A zone's story has to work from its stickies alone.** |
| **L2 Detail** | ≥ 1.0 | Explorers | Body text, captions, resume lines, links, secondary images. Dense is fine here. |

Screen size = world size × zoom, and roughly 12px on screen is the minimum readable size. That sets the sizes:

- Sticky text is 36px world, which is readable at zoom 0.4 or more, so stickies are L1.
- 48–64px text is readable at 0.25 or more, so it works for L1 headlines.
- 14–20px text needs zoom 1.0 or more, so it is L2 only.
- A zone label needs about 160px world to read at 0.12. The text element tops out at 64, which is why `zone` gets its own label (§3).

**Rule:** if the tour needs it, it is L1. Anything else defaults to L2.

## 3. Element vocabulary

### What exists today (`app/elements/types.ts`)

All elements are **center-anchored** (`x`, `y` is the element's center in world px). Draw order is array order.

| Kind | Fields | Real footprint and limits |
|------|--------|---------------------------|
| `sticky` | `text` | Paper is about 248×243. Use a **280px pitch** to space them. Text is Reenie Beanie at 36px, bold, in a 200px column: **at most 6 words / about 40 characters**. `\n` is allowed. |
| `text` | `text` | Currently fixed at 16px with `white-space: nowrap`. **It never wraps**, so body copy must be hard-wrapped with `\n` (about 56 characters a line for mono at 16px). `[label](url)` makes a link that can be clicked in view mode. |
| `image` | `src`, `width`, `height` | Any size. Shown with an 8px shell outline and rounded corners. **`src: ""` renders a sized placeholder.** Use that for every asset that can't be sourced yet. |

### Prerequisites (ship as a separate PR before generating content)

| Pri | Change | Shape |
|-----|--------|-------|
| P0 | Text size and font | `text` gets `size?: number` (8–64, default 16), `font?: "mono" \| "hand"` (default mono) and `width?: number` (when set, `pre-wrap` at that width; when unset, the current nowrap). |
| P0 | `zone` kind | `{ type: "zone", x, y, width, height, label }`. A rounded dashed outline with a handwritten label at a fixed ~160px world size in the top-left corner. Always drawn first (bottom layer). Not selectable in view mode. |
| P0 | `video` kind | `{ type: "video", src, poster, width, height }`. Autoplays muted, loops and plays inline, with the same shell outline as images. Use it for GIF-style loops (mp4/webm, never .gif). |
| P0 | Stickers | `image` gets `variant?: "sticker"`, which drops the outline and rounding (for transparent SVG/PNG cutouts). |
| P1 | Sticky color | `color?: "yellow" \| "pink" \| "blue" \| "green"`. If it isn't supported, the generator leaves it out. |
| P1 | Fly-to links | `[Work](#zone.work)` in text animates the camera to that zone. This turns the Start Here list into real navigation. |

Note: the mono font in the code is **Berkeley Mono**, not JetBrains Mono. Pick one before generating.

## 4. Board layout

The world origin is the center of Start Here. Zones sit on a 3×3 grid (pitch **2800 × 2000**, zones up to **2400 × 1600**, which leaves a 400px gutter), plus one loose zone on the far west. The tour runs one **clockwise loop**.

```
          x=-5800        x=-2800          x=0            x=2800
y=-2000                 [1 Thesis]     [2 Timeline]    [3 Work]
y=0      [9 Life &]     [8 Shelf]      [0 START]       [4 Graphics]
         [ Places ]
y=2000                  [7 Music]      [6 This Canvas] [5 Games & Art]
```

| # | id prefix | Zone label | Center | Size | Feel |
|---|-----------|-----------|--------|------|------|
| 0 | `start` | Start here | 0, 0 | 2000×1200 | structured |
| 1 | `thesis` | Design engineering, 2026 | -2800, -2000 | 2400×1600 | structured |
| 2 | `timeline` | 1999 → 2026 | 0, -2000 | 2400×1600 | structured (a single horizontal line) |
| 3 | `work` | Work | 2800, -2000 | 2400×1600 | structured |
| 4 | `graphics` | Graphics, from first principles | 2800, 0 | 2400×1600 | semi-structured |
| 5 | `games` | Games & game art | 2800, 2000 | 2400×1600 | loose, image-heavy |
| 6 | `meta` | This canvas is a project | 0, 2000 | 2400×1600 | structured |
| 7 | `music` | Music | -2800, 2000 | 2400×1600 | loose |
| 8 | `shelf` | The shelf | -2800, 0 | 2400×1600 | grid of covers |
| 9 | `life` | Life & places | -5800, 0 | 2800×2400 | loose, scrapbook |

**Default camera:** `{ x: 0, y: 0, zoom: 0.35 }`. At 1280×720 that shows all of Start Here, with the edges of Shelf and Graphics just in view, so it reads as a whiteboard right away. Scatter 3–5 stickers in the gutters around Start for the same reason.

## 5. Zone template

Every zone uses the same skeleton, so people learn to scan it once:

1. **Frame and label** (`zone`): L0.
2. **Headline** (text, 48–64, hand or mono): one sentence that carries the zone's takeaway. L1.
3. **3–6 stickies**: the talking points. **The tour narration is basically these, read aloud.** L1.
4. **One hero visual** (image or video, 700–1100px on its long side). L0/L1.
5. **Detail cluster**: body text (16–20), captions (12–14), extra images, links. L2. Tuck it into a corner so it doesn't compete at L1.

In structured zones, everything snaps to a 40px grid and stickies sit in rows on the 280px pitch. In loose zones, positions are scattered but **nothing overlaps**.

## 6. Zone contents

`{{double braces}}` mark facts Jake has to supply. The agent must never invent a fact that would pass as true: numbers, dates, employers, school names and titles all go in braces. Opinion copy marked *draft* is filler written in Jake's voice for him to rewrite.

### 0 · Start here
- Headline (mono 64): `Hi, I'm Jake. Design engineer.`
- Sub (mono 24, L1): `A whiteboard I built from scratch. If you use Figma, you already know how to drive.`
- Stickies: `drag to pan\nscroll to zoom` · `▶ 5-min tour\ntop right` · `or just wander` · `that's me →\na_r`
- Map list (mono 28, L1), one line per zone with a direction arrow, e.g. `↖ thesis   ↑ timeline   ↗ work`… With P1, these become fly-to links.
- Hero slot (900×600, video preferred): a looping 3D render in Jake's style. Placeholder plus TODO.
- Small callout near the south edge (mono 20): `↓ this board is a project too`.

### 1 · Design engineering, 2026 (thesis)
- Headline: `AI made average free. Taste is the moat.` *(draft)*
- Stickies *(draft)*: `taste is the\nbottleneck now` · `the handoff\nis dead` · `design engineer =\ncloses the loop` · `product eng ate\nthe mock` · `ship the real\nthing`
- L2: a ~150-word essay (mono 16, hard-wrapped at 56) expanding the five stickies. *(draft)*

### 2 · 1999 → 2026 (timeline)
- One horizontal rule (a thin generated SVG image, 2200×8) across the zone at y = -2000, with tick marks.
- Milestones as stickies above and below the line on alternating sides, eight at most, each with a 32px mono year label:
  `1999` press start (immediately judged the Win98 UI) · `{{year}}` first paid gig: business cards · `{{year}}` video editing, internships · `{{year}}` Parsons · `{{year}}` {{eng school}}: SWE + UX · `{{year}}` early startups · `{{year}}` {{SV startup}} + London/Dubai/Europe · `{{year}}` ComfyUI, SF · `2026` → what's next
- The `2026` sticky points at `meta`/`start` with: `looking for: {{what's next}}`.
- L2: one caption under each milestone (mono 14, 2 lines at most).

### 3 · Work
- Headline: `ComfyUI: {{role}}, {{dates}}`
- Sub (mono 24): `{{one-line what ComfyUI is}} · ~75th most-starred repo on GitHub {{verify}}`
- Stickies: 4–5 big takeaways, e.g. `{{shipped X}}` · `{{owned Y end to end}}` · `{{impact metric}}` · `design + code,\nsame PR`
- Hero: a product screenshot slot (1000×625).
- L2 "Before Comfy" block (mono 16): {{SV startup}}, {{early startups}}, {{internships}}. One line each, role and one result. Then a `[Resume (PDF)](/resume.pdf)` link.

### 4 · Graphics, from first principles
- Headline: `Graphics snob first. Everything else second.`
- Hero: a **generated SVG diagram** of the pixel pipeline: `your code → framebuffer → blit → video controller → scanout → photons`. Clean boxes and arrows in the board's visual language.
- L2: a real C blit loop of about 15 lines (mono 14, a text element) next to the diagram.
- Stickies: `pixels are\nthe product` · `wrote the\nrenderer in C` · `reverse-engineered\nFigma's engine (C++)` · `optically\nobsessed`
- L2: 3–4 lines on the Figma engine pet project: {{what you learned}}.

### 5 · Games & game art
- Headline: `I make the part of games you look at.`
- **Compact Disc**: a web game, all 3D art. 2–3 screenshot slots plus a video slot and a `[play](https://{{url}})` link.
- **{{Winamp walker title}}**: a 3D Winamp-style walking simulator, all art. 2–3 screenshot slots.
- Stickies: `level art,\nlook & feel` · `3D, in a browser` · `{{engine/tools}}`

### 6 · This canvas is a project
- Headline: `You're inside the portfolio piece.`
- Stickies: `DOM infinite canvas,\nno libs` · `the tour is camera\nkeyframes on an\naudio clock` · `a_r = me` · `editor at /edit\ngo break it`
- Hero: a **generated SVG** of the drive pipeline: `mic + gestures → keyframes {t,x,y,zoom} → audio currentTime → sample(t) → camera`.
- L2: 5–6 craft details (mono 16): contain-fit playback, interrupt-to-explore with an eased handoff, frames that bypass React, and so on. Taken from `docs/` and the code, nothing invented.
- Link: `[try the editor](/edit)` (see open question 1).

### 7 · Music
- Headline: `{{what music is to you, one line}}`
- A loose grid of 6–9 cover slots (300×300). Under each, a linked text: `▶ [{{track}} — {{artist}}]({{url}})`.
- Stickies: 2–3 short reactions *(draft)*.

### 8 · The shelf
- Headline: `The stuff that wired my brain.`
- Four columns, each topped with a hand label at 48: **Books**, **Screen**, **Cartoons**, **Games**. Cover slots (220×330 for books, 300×170 for screen/games), with a one-line mono 14 caption under each.
  - Books: Flowers for Algernon · The Hitchhiker's Guide to the Galaxy · The Stand
  - Screen: The Matrix · The X-Files
  - Cartoons: SpongeBob SquarePants · The Simpsons
  - Games: Call of Duty 4 (and every CoD) · Guild Wars 2
- One sticky per column with a dry one-liner *(draft)*.

### 9 · Life & places (loose scrapbook)
- Headline: `Lived out of a suitcase. Chose California.`
- Place clusters, each with 2–3 photo slots and a hand label: **London** · **Dubai** · **Europe, with a startup** · **San Francisco** · **California / home**
- Stickies *(draft)*: `all in on\nthe vision` · `family > everything` · `someday: small old\ncabin, mountains` · `feng shui is UX\nfor rooms` · `architecture: the\ndesign I can't ship\n(yet)`
- **Why I build** sub-cluster: `hard + real >\neasy + fake` · `only join things with\nreal initiative` *(draft)*
- **BS / Not BS**: two short mono 20 columns, 4–5 lines each *(draft, Jake will rewrite)*.

## 7. Tour script

One drive chapter per stop. The chapter title is the zone label. Jake records live at 1280×720. The total budget is **300 seconds**, about **750 spoken words** at 150 wpm.

| Ch | Stop | Time | Words | Camera |
|----|------|------|-------|--------|
| 1 | Start here | 0:25 | 60 | Hold at 0.35, then push in on the map list |
| 2 | Thesis | 0:25 | 60 | Fly at L0 (0.15), land at L1 (0.5) |
| 3 | Timeline | 0:35 | 90 | Pan left to right along the line at 0.5 |
| 4 | Work | 0:50 | 125 | L1, then a short dip to 0.9 on the takeaways |
| 5 | Graphics | 0:30 | 75 | L1, then dip into the diagram |
| 6 | Games & art | 0:30 | 75 | L1, drifting across the screenshots |
| 7 | This canvas | 0:25 | 60 | L1 |
| 8 | Music | 0:20 | 50 | L1 |
| 9 | Shelf | 0:20 | 50 | L1, one pan |
| 10 | Life & places | 0:25 | 60 | L1, drifting |
| 11 | Outro | 0:15 | 40 | Pull out to the full board (≈0.1), end on Start: "now go explore" |

The script goes in `docs/tour-script.md`: per chapter, the narration (built from that zone's stickies), the camera beats, and one "come back later for…" line pointing at that zone's L2 detail.

## 8. Assets

- Files go in `public/canvas/<zone>/<slug>.<ext>` and JSON references `/canvas/<zone>/<slug>.<ext>`. Leave `public/uploads/` alone; it belongs to the editor.
- **Generated by the agent:** SVG diagrams (pixel pipeline, drive pipeline, timeline rule) and simple stickers (arrows, stars, "!", a_r doodles), all in the board's palette (`app/globals.css`).
- **From Jake:** photos, screenshots and renders. Use them if Jake points to a folder ({{ASSETS_INBOX}}). Otherwise use a sized `src: ""` placeholder.
- **Third-party art** (album, book, film and game covers, logos): **don't download it.** Use a placeholder in the correct size and list it in the TODO file.
- Every placeholder gets a mono 12 L2 caption that starts with `TODO:` and says what goes there, so `grep TODO` finds all of them.

## 9. Generation rules

- **ids** are semantic and stable: `<zone>.<thing>`, e.g. `work.takeaway.2`, `shelf.books.stand`. Never use random UUIDs. That way hand edits can be diffed and a later partial regen can merge by id.
- **Order** in `elements`: zones → images/videos → stickies → text.
- Every element sits **fully inside its zone's frame**, with a 60px inset from the frame edge.
- **No overlapping bounding boxes**, except captions directly under their own image.
- **Voice:** first person, short, confident, dry humor. Lowercase is fine on stickies. Never use: passionate, leverage, synergy, rockstar, ninja, "I'm a creative".
- **Density check per zone:** at most 6 stickies, 1 headline, 1 hero. Everything else is L2.

## 10. Deliverables

1. `data/graph.json`: `version: 1`, the default camera from §4, all elements.
2. `public/canvas/**`: generated SVGs and any supplied assets.
3. `docs/tour-script.md`: as in §7.
4. `data/canvas-todo.md`: every `{{fact}}`, every placeholder (id, size, what goes there, suggested source) and every *draft* block, grouped by zone.
5. **Verification:** `graph.json` typechecks against `Graph` (`npx tsc --noEmit`). A one-off Node check in the scratchpad confirms there are no overlaps, everything is inside its frame, ids are unique, and sticky text is within limits. No browser automation.

## 11. Open questions for Jake

1. `/edit` isn't gated in production (only its API routes are), so visitors can play with it and saves fail silently. Keep it that way as a sandbox, or give it a "read-only demo" banner?
2. Berkeley Mono or JetBrains Mono?
3. Years and names for the timeline, plus the ComfyUI role and dates.
4. A folder of photos, screenshots and renders the agent can pull from.
5. The music list and links.
