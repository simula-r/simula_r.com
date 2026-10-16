"use client";

import { useEffect, useRef } from "react";
import { HOLD_MS } from "./useHoldToControl";

const SIZE = 36;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const FILL_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";
const ENTER_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const ENTER_MS = 320;

function ringTransform(x: number, y: number) {
  return `translate(${x - SIZE / 2}px, ${y - SIZE / 2}px)`;
}

function HoldRing({
  pointerId,
  x,
  y,
}: {
  pointerId: number;
  x: number;
  y: number;
}) {
  const ringRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const fillRef = useRef<SVGCircleElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animations = [
      fillRef.current?.animate(
        [{ strokeDashoffset: CIRCUMFERENCE }, { strokeDashoffset: 0 }],
        { duration: HOLD_MS, easing: FILL_EASING, fill: "forwards" },
      ),
      svgRef.current?.animate(
        [
          { opacity: 0, transform: "scale(0.6)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: ENTER_MS, easing: ENTER_EASING, fill: "backwards" },
      ),
      labelRef.current?.animate(
        [
          { opacity: 0, transform: "translateY(6px) scale(0.9)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        {
          duration: ENTER_MS,
          delay: 60,
          easing: ENTER_EASING,
          fill: "backwards",
        },
      ),
    ];
    const controller = new AbortController();
    window.addEventListener(
      "pointermove",
      (e) => {
        const ring = ringRef.current;
        if (ring && e.pointerId === pointerId) {
          ring.style.transform = ringTransform(e.clientX, e.clientY);
        }
      },
      { capture: true, passive: true, signal: controller.signal },
    );
    return () => {
      controller.abort();
      for (const animation of animations) animation?.cancel();
    };
  }, [pointerId]);

  return (
    <div
      ref={ringRef}
      className="fixed left-0 top-0 pointer-events-none z-50"
      style={{ transform: ringTransform(x, y) }}
    >
      <svg
        ref={svgRef}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="-rotate-90"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-brand/25"
        />
        <circle
          ref={fillRef}
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          className="stroke-brand"
        />
      </svg>
      <div
        ref={labelRef}
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 rounded-md px-2 py-0.5 text-xs font-mono font-medium text-white whitespace-nowrap bg-brand"
      >
        Take control
      </div>
    </div>
  );
}

export { HoldRing };
