# Infinite Canvas — Build Reference

## How to use this doc

This is organized **per component / per thing to build**, not as a linear
narrative. Jump straight to the section for whatever you're working on —
each entry is meant to be self-contained enough to drive implementation or
ask follow-up questions against on its own: what it is, what file it lives
in, what it depends on, the decisions already made for it, and what (if
anything) is still open.

- **[Index](#index)** — every component/module, status, and file path at a glance.
- **[Architecture decisions](#architecture-decisions-read-once)** — cross-cutting calls every component below assumes. Read once.
- **[Data model](#data-model-reference)** — the `CanvasDocument`/`CanvasElement` types most components reference.
- Everything after that is one card per component, grouped by layer (Shell / World & Camera / Canvas elements / Editor / Persistence).
- **[Open questions](#open-questions)** — everything still undecided, in one place.
- **[Suggested build order](#suggested-build-order)** — one path through this if you want a sequence.

## Index

| Component / module | File | Status |
|---|---|---|
| [Navigation](#navigation) | `app/components/Navigation.tsx` | existing |
| [Instructions](#instructions) | `app/components/Instructions.tsx` | existing |
| [ARDude](#ardude) | `app/components/ARDude.tsx` | existing |
| [Toolbar](#toolbar) | *(new)* | not started |
| [Play control](#play-control) | *(new)* | not started |
| [Hidden editor entry point](#hidden-editor-entry-point) | *(new)* | not started |
| [Canvas (world container)](#canvas-world-container) | `app/components/Canvas.tsx` | stub — placeholder content only |
| [Camera controller](#camera-controller) | *(new, e.g. `app/lib/camera.ts`)* | not started |
| [StickyNote](#stickynote) | `app/components/StickyNote.tsx` | stub — empty file |
| [Sticker](#sticker) | *(new)* | not started |
| [ImageElement](#imageelement) | *(new)* | not started |
| [VideoElement](#videoelement) | *(new)* | not started |
| [ShapeElement (Rect / Circle / Line)](#shapeelement-rect--circle--line) | *(new)* | not started |
| [TextElement](#textelement) | *(new)* | not started |
| [Visibility hook](#visibility-hook) | *(new, e.g. `app/lib/useIsVisible.ts`)* | not started |
| [Editor overlay](#editor-overlay) | *(new)* | not started |
| [Sandbox mode](#sandbox-mode) | *(new)* | not started |
| [CanvasDocument persistence](#canvasdocument-persistence) | *(new, `content/canvas.json`)* | not started |

## Architecture decisions (read once)

Cross-cutting calls that every component card below assumes without
re-arguing. This is a small personal-site canvas (≤150 elements total,
10-50 visible, one author, visitors read-only + a sandboxed editor), and
every decision here optimizes for that scale over a general-purpose
whiteboard product's scale.

- **No tldraw — build custom.** tldraw's strengths (huge shape counts,
  multiplayer sync, arbitrary shape extensibility) don't apply here, and
  its shape/tool APIs would fight the one genuinely custom feature this
  needs: recorded camera playback. Custom is a camera store, a declarative
  render of an elements array, and a JSON data model — not much code.
- **All-DOM rendering, no `<canvas>`.** Shapes render as inline SVG, text/
  media as native DOM (`<video>`, `<img>`, text divs). One CSS `transform`
  on the world container is the entire "camera matrix" — no second render
  world to keep in sync, and it makes `IntersectionObserver` (next bullet)
  work for free. Canvas2D only earns its keep at thousands of nodes; this
  site has ≤150.
- **`IntersectionObserver`, not a quadtree**, for visibility/culling
  (pausing offscreen video, deferring media loads). A quadtree solves a
  scale problem this site doesn't have; IO gives the exact "is this in
  viewport" signal needed, for free, because rendering is real DOM with
  real layout positions.
- **Canvas state is the source of truth; the DOM is derived.** A
  `CanvasDocument` JSON object (see [Data model](#data-model-reference))
  drives a declarative React render. The app never mutates the DOM
  directly — this is what makes the save file, camera recording, and
  sandbox mode all work.
- **Persistence is static JSON committed to the repo. No backend.** The
  owner-authoring flow ends in an "Export JSON" download that gets
  committed manually; there is no server write path and nothing to
  auth-gate.
- **Shell vs. world is a sibling/z-index split, not a special layer
  system.** UI chrome (`Navigation`, `Instructions`, `ARDude`, and
  everything still to build — toolbar, editor entry point, "Play"
  control) are `absolute`-positioned siblings of the world container, each
  `z-10`, carrying no camera transform. The world container (`Canvas`) is
  `z-0`, full-bleed, and the *only* thing the camera transform ever
  applies to. This is already how `app/page.tsx` is composed today.

## Data model (reference)

The canonical shape every component below reads from or writes to.
`StickyNote`/`TextEl` text-field distinction matters: only `TextEl` can
ever contain a link (see [TextElement](#textelement)).

```ts
type ElementBase = {
  id: string;
  type: "sticky" | "sticker" | "video" | "image" | "rect" | "circle" | "line" | "text";
  x: number; y: number;         // world coordinates
  width: number; height: number;
  rotation?: number;
  z: number;
};

// StickyNote.text is plain text — no markdown, no links, no click
// behavior. Only TextEl.text holds markdown SOURCE (what you typed) with
// link support — see TextElement. Sticker and the Shape types carry no
// text at all. None of sticky/sticker/shape are ever clickable.
type StickyNote = ElementBase & { type: "sticky"; text: string; color?: string };
type Sticker    = ElementBase & { type: "sticker"; assetId: string }; // from fixed asset set, see Sticker
type VideoEl    = ElementBase & { type: "video"; src: string };       // e.g. "/videos/foo.mp4"
type ImageEl    = ElementBase & { type: "image"; src: string };       // e.g. "/images/foo.png"
type ShapeEl    = ElementBase & { type: "rect" | "circle" | "line"; stroke: string; fill?: string };
type TextEl     = ElementBase & { type: "text"; text: string; fontSize?: number };

type CanvasElement = StickyNote | Sticker | VideoEl | ImageEl | ShapeEl | TextEl;

type CameraKeyframe = { x: number; y: number; zoom: number; holdMs?: number };

type CanvasDocument = {
  elements: CanvasElement[];
  introTimeline?: CameraKeyframe[]; // the single canned playback, see Camera controller
};
```

`src`/`assetId` are **filenames the editor writes as plain text**, resolved
against `/public` at render time (`/images/<value>`, `/videos/<value>`) —
there's no upload pipeline. When you drag an Image or Video node onto the
canvas in the editor, it renders as an empty/placeholder box with a text
input for the filename; once you type a valid `/public` path, it resolves
and renders.

---

## Shell components

UI chrome. Plain `absolute`, `z-10` siblings of `Canvas`; never carry a
camera transform (see [Architecture decisions](#architecture-decisions-read-once)).

### Navigation

- **File:** `app/components/Navigation.tsx` · **Status:** existing
- **Purpose:** top-left branding bar (Simula_r avatar/name, chevron, sidebar button).
- **Depends on:** `Icons.tsx` (`ChevronDown`, `Sidebar`).
- **Notes:** already uses the `bg-shell`/`border-shell` utilities
  (`--shellPlasticBg`/`--shellPlasticBorder` tokens in `globals.css`) for
  its plastic-bar look. Any new shell chrome (Toolbar, Play control,
  hidden editor entry point) should reuse these same tokens rather than
  inventing new ones, for visual consistency.

### Instructions

- **File:** `app/components/Instructions.tsx` · **Status:** existing
- **Purpose:** bottom-center "Drag to pan" / "Scroll to zoom" hint.
- **Depends on:** `Icons.tsx` (`Hand`, `Zoom`).
- **Notes:** static hint text; no interaction of its own. Candidate to
  hide/fade once the user's first pan/zoom happens, but that's a UX
  polish decision, not required for correctness.

### ARDude

- **File:** `app/components/ARDude.tsx` · **Status:** existing, unchanged
- **Purpose:** bottom-right mascot, decorative.
- **Depends on:** nothing canvas-related.

### Toolbar

- **File:** *(new)* · **Status:** not started
- **Purpose:** editor-mode element palette — lists the 6 placeable types
  (Sticky note, Sticker, Video, Image, Shape, Text); drag-from-toolbar
  onto `Canvas` creates a new `CanvasElement` at the drop position.
- **Depends on:** [Editor overlay](#editor-overlay) (owns the in-progress
  `CanvasDocument` this writes into), [Data model](#data-model-reference),
  [Sticker](#sticker) (shows the fixed asset set directly, not a filename
  input, unlike Image/Video).
- **Decisions:**
  - Use pointer-events-based drag, not the HTML Drag and Drop API — keeps
    drag handling consistent with how the camera itself already handles
    pointer events, one system instead of two.
  - Only rendered/reachable in editor mode (owner authoring or visitor
    sandbox), never in the default read-only view.
- **Open questions:** none — visual design of the palette itself is a UI
  pass, not an architecture decision.

### Play control

- **File:** *(new)* · **Status:** not started
- **Purpose:** the single "Play intro" button on the read-only site;
  triggers camera playback of `CanvasDocument.introTimeline`.
- **Depends on:** [Camera controller](#camera-controller).
- **Decisions:** the *only* shell element with `pointer-events: auto` on
  the read-only canvas by default (see [Open questions](#open-questions)
  for the one remaining nuance on this).

### Hidden editor entry point

- **File:** *(new)* · **Status:** not started
- **Purpose:** the mechanism by which a production visitor reaches the
  editor (offering "duplicate this canvas" / "start a new canvas" —
  see [Sandbox mode](#sandbox-mode)), and by which the owner reaches
  authoring mode.
- **Depends on:** [Editor overlay](#editor-overlay), [Sandbox mode](#sandbox-mode).
- **Open questions:** the actual trigger (key combo / URL fragment /
  disguised click target) — see [Open questions](#open-questions). Purely
  a design choice; doesn't affect anything else in this doc.

---

## World & camera

### Canvas (world container)

- **File:** `app/components/Canvas.tsx` · **Status:** stub — currently
  renders only the placeholder "Start here" heading + `sticky-note.svg`.
- **Purpose:** the full-bleed, pannable/zoomable root. Owns the camera
  transform; every `CanvasElement` renders as a child inside it.
- **Depends on:** [Camera controller](#camera-controller) (for the
  transform), [Data model](#data-model-reference) (renders `elements[]`),
  [Visibility hook](#visibility-hook) (culls what actually mounts/plays).
- **Decisions:**
  - Already structurally correct for this role: `inset-0` (full-bleed),
    `z-0` (below shell's `z-10`), `cursor-grab` (anticipates drag-to-pan).
    The camera's CSS transform belongs on a wrapper *inside* `Canvas`;
    `Canvas` itself stays the untransformed full-bleed root that captures
    pointer/wheel input.
  - The current placeholder content ("Start here" + `sticky-note.svg`)
    already lives inside `Canvas`, i.e. on the world side of the
    shell/world split — no open question here. Natural path: replace it
    with a real `StickyNote` `CanvasElement` once
    [StickyNote](#stickynote) and the camera transform are wired up,
    rather than promoting it to shell.
  - Renders elements via the mapping: Sticky note → `<div>`, Sticker →
    `<img>`, Video → `<video>`, Image → `<img>`, Rect/Circle/Line →
    inline `<svg>`, Text → `<div>`/textarea in edit mode. Each element is
    absolutely positioned at its own `x, y` with its own
    `width, height, rotation` transform; only the world container's
    transform carries the camera.

### Camera controller

- **File:** *(new, e.g. `app/lib/camera.ts`)* · **Status:** not started
- **Purpose:** single source of truth for camera `{x, y, zoom}`, driven by
  either live user input or timeline playback through one shared
  "set target, animate to it" API — so playback reuses exactly the same
  rendering path as manual interaction.
- **Depends on:** [Canvas](#canvas-world-container) (applies the resulting
  transform), [Play control](#play-control) and the editor's "record
  camera" toggle (the two things that drive it besides raw input).
- **Decisions:**
  - **Live interaction:** pointer drag updates target `(x, y)` directly —
    snappy, no lag on the input itself. A small critically-damped
    spring/rAF tween smooths only *large programmatic* jumps (e.g.
    zoom-to-fit), not the drag itself. Scroll wheel adjusts target `zoom`
    around the pointer position, tweened the same way.
  - **Recording** (owner authoring mode only): rather than sampling every
    animation frame (noisy, large files), capture discrete waypoints —
    append a `CameraKeyframe` when pan/zoom comes to rest (idle timeout
    after the last input event), with an optional `holdMs`. Keeps the
    recorded file small and playback deterministic.
  - **Playback:** tween the camera store through `introTimeline`'s
    keyframes in order, same tween utility as live interaction, easing
    between waypoints. Because it drives the same camera state as manual
    control, a viewer grabbing the camera mid-playback degrades
    gracefully — playback just stops driving the target.
  - Single canned intro timeline (not multiple named ones) — confirmed.

---

## Canvas elements

Rendered inside [Canvas](#canvas-world-container). All share the base
positioning/transform mechanics described there; each card below covers
only what's specific to that element type.

### StickyNote

- **File:** `app/components/StickyNote.tsx` · **Status:** stub — empty file
- **Data:** `StickyNote` in [Data model](#data-model-reference).
- **Decisions:**
  - Plain text only — **no markdown, no links, no click behavior.**
    Render by splitting `text` on `\n` and joining with `<br>`; nothing
    else is parsed. `pointer-events: none` unconditionally.
  - No resize needed (not required by the brief for this type).

### Sticker

- **File:** *(new)* · **Status:** not started
- **Data:** `Sticker` in [Data model](#data-model-reference) — `assetId`,
  not a filename.
- **Decisions:**
  - No upload path. Comes from a small fixed set of assets in `/public`
    (the existing `sticky-note.svg` is an example). Add a new sticker by
    dropping a file into `/public/stickers/` and adding one entry to a
    small `STICKERS` registry (`id → path`) in code — a code change, not
    a data change, since the set is small and curated.
  - [Toolbar](#toolbar) shows this fixed set directly (icons to drag),
    unlike Image/Video which start blank with a filename input.
  - No click behavior, no text, `pointer-events: none`.

### ImageElement

- **File:** *(new)* · **Status:** not started
- **Data:** `ImageEl` in [Data model](#data-model-reference) — `src` is a
  plain-text `/public` path the editor writes, e.g. `/images/foo.png`.
- **Decisions:**
  - No upload pipeline: in the editor, dragging Image from
    [Toolbar](#toolbar) creates a blank/placeholder box with a text input
    for the filename; typing a valid `/public` path resolves and renders
    it as a real `<img>`.
  - Resizable via the shared bounding-box handle system — see
    [ShapeElement](#shapeelement-rect--circle--line) for the mechanics
    (image/video share that system, not just the 3 shape types).
  - Lazy-load via `loading="lazy"` + [Visibility hook](#visibility-hook).

### VideoElement

- **File:** *(new)* · **Status:** not started
- **Data:** `VideoEl` in [Data model](#data-model-reference) — same
  filename-text-input authoring flow as ImageElement.
- **Decisions:**
  - `preload="none"`; play/pause driven by
    [Visibility hook](#visibility-hook)'s `isIntersecting` signal — this
    is the concrete "pause video when offscreen" requirement from the
    brief.
  - Resizable via the same shared bounding-box handle system as
    Image/shapes.

### ShapeElement (Rect / Circle / Line)

- **File:** *(new)* · **Status:** not started
- **Data:** `ShapeEl` in [Data model](#data-model-reference) — one
  component (or one small component per subtype sharing a resize wrapper)
  covering `"rect" | "circle" | "line"`.
- **Decisions:**
  - **One generic bounding-box resize system**, shared with
    Image/VideoElement: selected element shows drag handles at the
    corners (and optionally edge midpoints) of `x, y, width, height`;
    dragging updates `width`/`height` (and `x`/`y` for top/left handles,
    anchoring the opposite corner). No per-shape-type resize logic — only
    how each shape *draws inside* that box differs.
  - **Rect/Circle draw via SVG percentage coordinates** so the box resize
    is the only thing that needs to happen:
    ```tsx
    // Rect
    <svg width={width} height={height}>
      <rect x="0" y="0" width="100%" height="100%" fill={fill} stroke={stroke} />
    </svg>

    // Circle → <ellipse>, not fixed-aspect, so corner-drag can stretch
    // it into an oval (expected resize UX); constrain to a true circle
    // only with a modifier key, as a later nice-to-have.
    <svg width={width} height={height}>
      <ellipse cx="50%" cy="50%" rx="50%" ry="50%" fill={fill} stroke={stroke} />
    </svg>
    ```
  - **Line stays on the same bounding-box system**, drawn corner-to-corner
    of its own box, as an intentional simplification:
    ```tsx
    <svg width={width} height={height}>
      <line x1="0" y1="0" x2={width} y2={height} stroke={stroke} />
    </svg>
    ```
    Cost: a line can only ever run corner-to-corner of a rectangle, not
    an arbitrary angle from an arbitrary start point. If that constraint
    ever actually bothers you, the upgrade is giving Line its own two
    independent draggable endpoint handles (`x1,y1`/`x2,y2`) instead of
    the shared bounding-box handles — not needed to start.
  - **Resize-drag gotcha:** handles live in the same world-transformed
    space as elements, so a handle's on-screen pixel drag delta must be
    divided by the camera's current `zoom` before being applied to
    `width`/`height`/`x`/`y`. Skipping this makes resize feel right at
    zoom 1 and wrong (too fast/slow) at any other zoom — easy to
    introduce, easy to miss until tested while zoomed in.
  - No text, no click behavior, `pointer-events: none` on the read-only canvas.

### TextElement

- **File:** `app/components/Text.tsx` (component) + `lib/parseTextMarkup.tsx`
  (parser) · **Status:** in progress — editor-side render only; no
  edit-mode toggle, no server-side/read-only split yet (see below).
- **Data:** `TextEl` in [Data model](#data-model-reference) — `text` is
  raw markup *source*, never rendered HTML, never lossy round-tripped.
- **Decisions:**
  - **The only element type on the canvas that can contain a link.**
    Sticky/Sticker/Shape never do (see their cards above) — a
    meaningfully smaller safety surface than "any text-bearing element
    can have a link." Any future text-bearing element type should default
    to plain text, not markup, unless there's a specific reason to opt it
    in.
  - **No resize** — line breaks are controlled manually with `Return`,
    not auto-wrap-driven, so this is a pure edit/display toggle with no
    handle logic.
  - **Edit mode:** on selection, swap display for a plain `<textarea>`
    (not `contenteditable` — a textarea gives the raw string directly via
    `.value`, with no risk of the browser inserting stray `<div>`/`<br>`
    markup into what's supposed to be plain source). **Not yet built** —
    today `TextCanvasElement` only renders; nothing places it into an
    editable state.
  - **On blur:** swap back to display mode, rendering current `text`
    through the parser below. No network call, no explicit "submit" —
    just a local `isEditing: false` flip. **Not yet built**, same reason.
  - **Rendering: a hand-rolled parser, not a markdown library.** The
    actual syntax surface is tiny — `[label](url)` links plus `\n` → hard
    line break, nothing else — so a real markdown pipeline
    (`react-markdown`/`remark`/`unified`) is more dependency than the
    feature needs, and it's a client-only dependency: editing is
    inherently interactive/client-side, so if the same pipeline rendered
    the read-only page too, every visitor would download a markdown
    parser just to view static text. `parseTextMarkup(source: string):
    ReactNode[]` is a small, dependency-free, pure function — no
    `dangerouslySetInnerHTML`, no DOM API — so it runs identically
    wherever it's called from. It only ever emits `<br>` and `<a>` (text
    otherwise passes through as plain strings), so the "only links are
    clickable, nothing else sneaks in" safety property is structural, not
    an allowlist to maintain.
  - **Server-side / read-only split is deferred.** The long-term plan is
    for the read-only page to call `parseTextMarkup` in a Server
    Component at build/request time (so parsing never ships to read-only
    visitors) and for the editor to call the same function client-side
    for live preview — see [Open questions](#open-questions). For now
    everything (including the current single-page app) runs client-side;
    revisit this once [Editor overlay](#editor-overlay) and the read-only
    view actually diverge.
  - `pointer-events: auto` is scoped to the rendered `<a>` specifically
    (set directly on the anchor `parseTextMarkup` emits), not the whole
    element box, which stays `pointer-events: none`.

---

## Supporting utilities

### Visibility hook

- **File:** *(new, e.g. `app/lib/useIsVisible.ts`)* · **Status:** not started
- **Purpose:** wraps `IntersectionObserver` against the canvas viewport
  (generous `rootMargin`, e.g. `50%`, so elements start loading slightly
  before they're visible) and exposes `isIntersecting` per element.
- **Depends on:** used by [VideoElement](#videoelement) (play/pause),
  [ImageElement](#imageelement)/[VideoElement](#videoelement) (lazy media
  load), and generally by [Canvas](#canvas-world-container) for the
  overall "stream media in by proximity" loading strategy.
- **Decisions:** fetch the full elements manifest (positions/types/
  metadata — small JSON, not media) up front; defer `<img>`/`<video>`
  `src` loading to this hook so nearby-but-offscreen elements preload and
  far-away ones don't pop in late. If profiling ever shows IO isn't
  enough at some future larger scale, a quadtree can be added later
  purely as an optimization behind the same `isVisible(elementId)`
  interface — nothing else would need to change.

---

## Editor

### Editor overlay

- **File:** *(new)* · **Status:** not started
- **Purpose:** the toolbar-driven authoring mode itself — selection,
  drag-to-place from [Toolbar](#toolbar), resize handles (see
  [ShapeElement](#shapeelement-rect--circle--line)), text editing (see
  [TextElement](#textelement)), and the "record camera" toggle (see
  [Camera controller](#camera-controller)).
- **Depends on:** [Data model](#data-model-reference), [Toolbar](#toolbar),
  [Hidden editor entry point](#hidden-editor-entry-point).
- **Decisions:**
  - Ships in production, reachable only via the hidden entry point — not
    a dev-only tool.
  - Operates on an in-memory `CanvasDocument`; never mutates the DOM
    directly (same principle as [Canvas](#canvas-world-container)).
  - **Owner authoring mode:** load the real `CanvasDocument`, edit it, and
    use an "Export JSON" action (`Blob` + `<a download>`) to download the
    current document. You manually save that into the repo (e.g.
    `content/canvas.json`, see
    [CanvasDocument persistence](#canvasdocument-persistence)) and
    commit/deploy. No server write path exists.
  - Both owner mode and [sandbox mode](#sandbox-mode) reuse this same
    component and the same `CanvasDocument` shape — the editor itself
    never needs to know whether it's "really" editing production content,
    only what happens to the document afterward (export vs. discard).

### Sandbox mode

- **File:** *(new, likely a flag/wrapper around* [Editor overlay](#editor-overlay)*)* · **Status:** not started
- **Purpose:** lets any production visitor try the editor without ever
  touching real data, via [Hidden editor entry point](#hidden-editor-entry-point)'s
  "duplicate this canvas" (deep-clone the live `CanvasDocument`) or "start
  a new canvas" (empty document) options.
- **Decisions:**
  - All edits live only in memory, optionally mirrored to
    **`sessionStorage`** — not `localStorage`. Not a storage-cap issue
    (payload is small JSON metadata, no embedded media, nowhere near the
    5-10MB quota either way); it's about *scope*: `localStorage` is one
    global bucket shared across tabs and persists indefinitely, so a
    sandbox doc would collide with a second sandbox tab and linger
    forever with no owner. `sessionStorage` is per-tab and clears when
    the tab closes — exactly the "survive a reload, not a browser
    restart" lifetime a throwaway sandbox wants.
  - Closing the tab discards it by design; there is nothing to reconcile
    with the real site, ever.

---

## Persistence

### CanvasDocument persistence

- **File:** *(new, `content/canvas.json`)* · **Status:** not started
- **Purpose:** the single static JSON file the read-only site loads
  `CanvasDocument` from at build/runtime.
- **Depends on:** written by hand via [Editor overlay](#editor-overlay)'s
  Export action, read by [Canvas](#canvas-world-container).
- **Decisions:** no backend, no API route, no database. Content changes
  require exporting from the editor, committing the file, and
  redeploying. This is what makes the whole editor safe to ship to
  production without any auth on a write path — there isn't one.

---

## Open questions

Everything genuinely still undecided, collected in one place.

- **Hidden entry point mechanism** (see [Hidden editor entry point](#hidden-editor-entry-point)):
  key combo, URL fragment, or a disguised click target — a visual/UX
  design choice, doesn't affect any architecture above.
- **TextElement server-side parsing split** (see [TextElement](#textelement)):
  once the read-only view and the editor actually diverge, move
  `parseTextMarkup` calls for the read-only page into a Server Component
  so parsing never ships to read-only visitors; the editor keeps calling
  the same function client-side. Not needed while everything is one
  client-side page.
- **Element interactivity nuance on [Play control](#play-control):**
  confirmed that `Sticky note`/`Sticker`/`Shape` are `pointer-events: none`
  unconditionally, `Text` is `pointer-events: auto` scoped to its rendered
  `<a>` only, and `Video`/`Image` keep native controls — worth a final
  pass once built to confirm nothing else on the read-only canvas
  accidentally ends up clickable.

## Suggested build order

Not required, but a reasonable path if you want one, front-loading the
pieces everything else depends on:

1. **[Data model](#data-model-reference)** types, as actual `.ts` — nothing else can be built against it otherwise.
2. **[Camera controller](#camera-controller)** — pure logic, testable without any rendering.
3. **[Canvas](#canvas-world-container)** wired to the camera controller (transform on a wrapper div, drag/wheel → camera target) with zero real elements yet — validates pan/zoom feel end-to-end.
4. One element type fully end-to-end — **[StickyNote](#stickynote)** is the simplest (plain text, no resize, no markdown) — to validate the render-from-`CanvasDocument` pipeline and replace today's placeholder.
5. Remaining element types: **[ImageElement](#imageelement)**, **[VideoElement](#videoelement)**, **[ShapeElement](#shapeelement-rect--circle--line)**, **[TextElement](#textelement)**.
6. **[Visibility hook](#visibility-hook)** — retrofit onto Video/Image once there's more than one or two elements to actually cull.
7. **[Editor overlay](#editor-overlay)** + **[Toolbar](#toolbar)** (owner authoring mode first) → **[CanvasDocument persistence](#canvasdocument-persistence)** export flow.
8. Camera **recording**, on top of the already-built controller.
9. **[Sandbox mode](#sandbox-mode)** + **[Hidden editor entry point](#hidden-editor-entry-point)** last — it's a wrapper around everything already built by this point.
