const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_IN = "cubic-bezier(0.55, 0, 1, 0.45)";
const EASE_IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";

const MOTION = {
  instant: 100,
  fast: 150,
  base: 250,
  medium: 350,
  slow: 500,
  scenic: 700,
  stagger: 40,
} as const;

function easeInOut(k: number) {
  return k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export {
  EASE_OUT,
  EASE_IN,
  EASE_IN_OUT,
  MOTION,
  easeInOut,
  prefersReducedMotion,
};
