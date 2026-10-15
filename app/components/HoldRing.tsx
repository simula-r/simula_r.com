"use client";

import { useEffect, useRef } from "react";
import { HOLD_MS } from "./useHoldToControl";

const SIZE = 36;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

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
  const fillRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const animation = fillRef.current?.animate(
      [{ strokeDashoffset: CIRCUMFERENCE }, { strokeDashoffset: 0 }],
      { duration: HOLD_MS, easing: "linear", fill: "forwards" },
    );
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
      animation?.cancel();
    };
  }, [pointerId]);

  return (
    <div
      ref={ringRef}
      className="fixed left-0 top-0 pointer-events-none z-50"
      style={{ transform: ringTransform(x, y) }}
    >
      <svg
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
    </div>
  );
}

export { HoldRing };
