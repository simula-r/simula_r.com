# Jam Script: "Why hire Jake?"

Draft narration for the recorded tour. About 3 minutes, about 450 spoken words, one block per frame, ending on the contact area of frame 06. Read it out loud once before recording and change anything that doesn't sound like you.

Camera notes use world coordinates from `data/graph.json`. "Wide" means the whole frame is in view (about zoom 0.45–0.5 on a 1440 px screen). "Mid" means one card or cluster fills the screen (about zoom 0.8–1.0).

Pacing rule: the camera starts moving on the last sentence of each block, so the move to the next frame happens under your voice and you never wait in silence.

---

## 01 — The brief · 0:00–0:25

**Camera:** Start on the default view, wide on the brief and centered near (0, −250). Drift the cursor over the title, then down the session details, and rest it on the a_r sticky. On "agenda", sweep down the agenda track. On the last line, pan right along the spine arrow.

> Hey, I'm Jake. Welcome to the jam.
> The brief is simple: you need a design engineer, and I'm going to make the case that it's me.
> That's a_r, my cursor. I'll be driving. Hold anywhere if you want the wheel.
> Six frames, about three minutes. Let's go.

*(~55 words)*

---

## 02 — Exhibit A · 0:25–0:55

**Camera:** Wide on the frame around (3650, −250). Point at the title, then circle A1, A2 and A3 on the left. Zoom to mid on the terminal box around (4200, −140) for "pure function of time". End on the "yes, you can zoom in on this sticky" sticky, then pan right.

> First, the evidence you're standing in.
> This isn't a slide deck and it isn't a video. It's a canvas engine I built: real DOM, so every word is real text, and one JSON file is the whole CMS.
> This tour is data, not video. I drove the camera while I talked, and it replays as keyframes on the audio clock, at any screen size.
> And yes, you can zoom in on that sticky.

*(~75 words)*

---

## 03 — Context · 0:55–1:25

**Camera:** Wide on the three clusters around (7250, −200). Point at each cluster label in turn: design, engineering, range. Land on the "both halves" sticky on "both halves". Optional: a quick tilt up toward "↑ FULL TIMELINE" without going there.

> Some research on the candidate.
> I trained as a designer: Parsons, business cards, internships in design, video and print.
> Then I went and learned the other half properly: engineering, startups where I did the logo and the prod deploy, then ComfyUI in San Francisco.
> Both halves. Since 1999, from London to Dubai to Europe, and home to California.

*(~65 words)*

---

## 04 — Principles · 1:25–1:55

**Camera:** Wide on the frame around (10950, −200), then mid on the pull quote around (10160, −310). Run the cursor down the five numbered principles. Flick over to BS / not BS on "argue". Pan right.

> Every good jam sets principles before solutions. Here are mine.
> AI made average free, so taste is the moat.
> The handoff is dead: mocks thrown over a wall lose half their intent.
> Design engineers close the loop. We feel it, find what's wrong, and fix it in the real material.
> And ship the real thing. Nobody uses a mockup.
> Loosely held. Argue with me.

*(~70 words)*

---

## 05 — Evidence · 1:55–2:40

**Camera:** Wide on the whole frame around (15050, −100). Then mid on claim 01, the ComfyUI card, around (14050, −50). Then mid on claim 02, the teapot, around (15130, −70), with the cursor on the code. Then mid on claim 03 around (16200, 0). Hold briefly on the Winamp reference. Pan right.

> Claims, with receipts. Strongest first.
> Claim one: I design and ship real product, at scale. That's ComfyUI, {{one line on what you owned}}. Design and code in the same PR.
> Claim two: I know where every pixel comes from. I write renderers from scratch in C, pushing bytes into the framebuffer myself.
> Claim three: I make the part of games you look at. Compact Disc is a web game where every model, level and light is mine. And this one is a 3D walking sim that lives inside a Winamp skin. All art, no apologies.

*(~105 words)*

---

## 06 — Decision · 2:40–3:00

**Camera:** Wide on the options row around (18800, −310). Point at option A, then tick option B. Then settle on the contact block around (18440, 100), at mid zoom, and stop there. The tour ends on this frame.

> Every jam ends with a decision, so I made this one easy.
> Option A: keep looking. Option B: hire Jake.
> My contact info is right here. Say hi.
> Thanks for jamming with me.

*(~45 words)*

---

**Total:** about 415 words, which leaves room to ad-lib or add a sentence to the evidence block.

## Before you record

- Fill the `{{...}}` line in the evidence block, or cut it.
- Fill `decision.contact` in `graph.json` so the board doesn't end on placeholders.
- The side zones (full timeline, places, what shaped my taste) are deliberately left out of the tour. If you have spare time, a 3-second tilt toward one of them in frame 03 or 04 tells explorers they exist.
