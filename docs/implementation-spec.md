# Jam Session: Implementation Spec

Branch: `jam-session`. Restore point: `5d381f9` on `master`.

## Product

The site is a live whiteboard session. Jake's cursor, **a_r**, presents **"Why hire Jake?"** as a design exercise, narrated in his own voice on a canvas engine he built. Visitors join the session, follow a_r by default, can take control at any time, and can hand control back to a_r.

Never call it FigJam or Figma in UI copy. The words are **session** and **jam**.

### Flow

```
lobby ──Join──▶ following ──hold / Space──▶ in control ──click a_r / Resume / Space──▶ following
  │                │                                                                      │
  └─"look around"─▶ in control (tour never started)          following ──audio ends──▶ ended ──Replay──▶ following
```

| Phase | What the visitor sees |
|---|---|
| **lobby** | Board rendered and live but blurred. a_r's cursor drifts idly. Centered invite card. |
| **following** | Camera and cursor driven by the recording. Brand border. Bottom bar: `Following a_r · Hold anywhere to take control · 0:42 / 3:00 · 🔊`. |
| **in control** | Border and bar gone. a_r's cursor stays where it stopped and its cursor chat types *"You can click me to resume"*. The top-right shell shows **▶ Resume tour**. |
| **ended** | Camera rests on the contact area. a_r cursor chat: *"Thanks, {name}. Say hi."* The top-right shell shows **↻ Replay**. Visitor has control. |

## Scope

### 1. Lobby and invite card

New `app/components/JoinCard.tsx`, rendered by `app/page.tsx` while phase is lobby.

- Full-viewport overlay above the canvas with `backdrop-blur` and a light dim. The canvas and FakeCursor render underneath as normal.
- The card uses the existing shell look (`bg-shell`, `border-shell-border`, `font-mono` for meta, rounded like other shell surfaces):
  - `a_r invited you to a jam`
  - Title: `Why hire Jake?`
  - Meta: `{duration} · sound on`. `duration` is derived from `player.total` (round to the nearest minute, or show `m:ss` under 1 minute).
  - Input: `What should I call you?` Optional, autofocused, Enter submits. An empty name resolves to `Guest`.
  - Primary button: `Join` (`bg-brand`). Disabled and labeled `Loading…` until the manifest has loaded.
  - Secondary text link: `just let me look around`. It dismisses the card into **in control** without starting the tour.
- `Join` must call `player.play()` synchronously inside the click handler so the browser allows audio.
- Idle cursor while in the lobby: a_r's cursor makes a slow, small drift loop around `RESTING_POINTER` (a rAF or CSS keyframe offset; amplitude about 40 world px, period about 6s). It only has to look alive.
- Visitor name is React state in `page.tsx`. No persistence.

### 2. Player status model

`app/drive/useDrivePlayer.ts`:

- Statuses become `"idle" | "playing" | "interrupted" | "ended"`. Remove `"paused"`: in this UI the only way out of playing is the visitor taking control, which is `interrupted`.
- Natural end of the last chapter goes to `"ended"`, not `"idle"`. The camera stays on the final frame and is committed.
- Resume (`play()` from `interrupted`) rewinds `REWIND_SECONDS = 2`, clamped to the start of the current chapter, then uses the existing handoff. Raise `HANDOFF_SECONDS` to `0.6`.
- `replay()`: seek to chapter 0, t=0, then `play()`.
- Add `muted` state and `toggleMute()`, applied to every chapter audio element. Muting does not pause; audio stays the clock.
- Remove API that nothing uses anymore (`pause`, `toggle`, `playChapter`, `stop` if unused once `TourPaused` is gone). Keep `seek` and `settle` if `replay` or the progress bar uses them.
- Keep the frame/subscribe architecture exactly as it is. Frame writes bypass React and React state commits only at settle points.

### 3. Hold to take control

Today any drag or wheel during playback interrupts immediately (`useCanvasInteraction`). Replace that, **only while status is `playing`**, with a deliberate hold:

- New `app/components/useHoldToControl.ts` (or extend `useCanvasInteraction` if that's cleaner; follow its AbortController + capture-listener pattern).
- Pointer down on the canvas (any button, mouse or touch) starts a hold of `HOLD_MS = 800`. Releasing or cancelling before it completes cancels the hold. Moving the pointer does **not** cancel it: a drag while following just doesn't pan (camera updates are already dropped while playing).
- When the hold completes, call `player.interrupt()`. If the pointer is still down and moving, the existing delta-based Canvas pan should continue naturally from the committed camera. Confirm this works.
- New `app/components/HoldRing.tsx`: a ring at the pointer position that fills over `HOLD_MS` (SVG `stroke-dashoffset`, brand color, about 36px). It disappears on cancel or completion.
- Wheel or pinch while playing does nothing to the tour. It pulses the bottom bar's hint text for attention.
- Suppress the context menu during the hold so a right button or long-press works.
- **Space** on `window`: `playing` → `interrupt()`, `interrupted` → `play()`. Ignore when focus is in an input or textarea, and ignore in the lobby.
- Outside `playing`, canvas interaction behaves exactly as it does today.

### 4. Following chrome

Rework `app/components/ActiveBorder.tsx`:

- Keep the brand border and the bottom tab with its corner pieces.
- Bar contents: `Following a_r` · hint `Hold anywhere to take control` (muted text, pulse target from §3) · progress · `elapsed / total` · mute button.
- Progress is a single display-only bar (one segment per chapter is fine if multiple chapters exist, but no click or scrub). Remove the play/pause button, chapter label, and scrubbing.
- Visible only while status is `playing`.

### 5. Cursor chat and click-to-resume

Extend `app/components/FakeCursor.tsx`:

- Optional `chat?: string` prop renders a Figma-style speech bubble attached to the name label (brand background, white text, `font-mono text-xs`, max-width ~240px, wraps). Text types in at about 30ms per character when `chat` changes.
- Optional `onClick` prop. When set, the cursor arrow + label + bubble become `pointer-events-auto`, `cursor-pointer`, with a subtle hover (slight scale or ring). When not set, the cursor stays `pointer-events-none` as today.
- `page.tsx` passes:
  - `interrupted`: `chat="You can click me to resume"`, `onClick={player.play}`
  - `ended`: `chat="Thanks, {name}. Say hi."` with no click
  - otherwise no chat or click
- Clicking the cursor must not start a canvas gesture (stop propagation on pointerdown).

### 6. Shell cleanup

- `SpotlightTour.tsx`: remove the chapter dropdown, the SplitButton chevron, the Info button, and the "Anonymous" avatar. The presence row becomes the a_r avatar plus a visitor avatar showing their initial (gradient like the current anonymous one, `title={name}`). The action button becomes:
  - lobby: hidden
  - following: hidden (the bottom bar is the chrome)
  - in control: `▶ Resume tour` → `player.play()`
  - ended: `↻ Replay` → `player.replay()`
  - in control without ever having started (from "look around"): `▶ Start tour` → `player.play()`
  The a_r avatar keeps its brand ring while following.
  Rename the component if `SpotlightTour` no longer fits (e.g. `SessionBar`).
- `Navigation.tsx`: label becomes the board title, `Why hire Jake?`, like a document title in a design tool. Keep the ARBall and the dropdown affordance (it's the future projects menu; no menu content now).
- Delete `TourPaused.tsx`, `Instructions.tsx` and the commented-out `Instructions` line in `page.tsx`. Delete `SplitButton` from `MenuButton.tsx` if it's unused.
- Leave `ARDude.tsx`, the editor (`/edit`), the recorder, and `events: never[]` alone.

### 7. Phase derivation in `page.tsx`

`page.tsx` owns `joined: boolean` and `name: string`. Phase comes from those plus `player.status`:

| joined | status | phase |
|---|---|---|
| false | any | lobby |
| true | playing | following |
| true | interrupted / idle | in control |
| true | ended | ended |

The existing `following` flag (border, a_r avatar ring) keeps its meaning: status is `playing`.

## Out of scope

- Events track or live element adds. **Decided against:** the board is always the full `graph.json`.
- Sign-the-board, projects dropdown, in-memory editor sandbox, captions, analytics, mobile-specific layout.
- Board content. A separate task rewrites `data/graph.json`; nothing in this spec depends on specific element ids.

## Constraints

- Read `AGENTS.md`. This is Next 16; check `node_modules/next/dist/docs/` before touching anything framework-level.
- **No code comments, ever** (`CLAUDE.md`).
- **No Claude-in-Chrome tools and no ad-hoc Playwright/Puppeteer/driver scripts** (`CLAUDE.md`). Verify with `npm run lint` and `npm run build` only. Jake verifies in the browser.
- Match existing idioms: named exports at the bottom of the file, `cn()` from `@/lib/utils`, Tailwind tokens from `globals.css` (`bg-shell`, `border-shell-border`, `bg-brand`, `text-foreground-muted`, `hover:bg-shell-hover`), `useEffectEvent` for listener callbacks, AbortController for listener cleanup, direct DOM writes for per-frame updates.
- Don't touch `data/graph.json`, `data/canvas-todo.md`, or `public/drive/*`.

## Done when

- `npm run lint` and `npm run build` pass.
- Walking through the flow table above by hand has every transition and every listed UI state reachable, with no leftover chapter menu, info button, TourPaused toast or Instructions.
- A quick click or an accidental drag during the tour does not stop it. A ~0.8s hold does, and the ring shows progress.
