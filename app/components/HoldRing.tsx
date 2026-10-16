"use client";

import { useEffect, useRef } from "react";
import { EASE_IN_OUT, EASE_OUT, MOTION } from "@/lib/motion";

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
  duration,
  done = false,
}: {
  pointerId: number | null;
  x: number;
  y: number;
  duration: number;
  done?: boolean;
}) {
  const ringRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const fillRef = useRef<SVGCircleElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animations = [
      fillRef.current?.animate(
        [{ strokeDashoffset: CIRCUMFERENCE }, { strokeDashoffset: 0 }],
        { duration, easing: EASE_IN_OUT, fill: "forwards" },
      ),
      svgRef.current?.animate(
        [
          { opacity: 0, transform: "scale(0.6)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: MOTION.medium, easing: EASE_OUT, fill: "backwards" },
      ),
      labelRef.current?.animate(
        [
          { opacity: 0, transform: "translateY(6px) scale(0.9)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        {
          duration: MOTION.medium,
          delay: MOTION.stagger,
          easing: EASE_OUT,
          fill: "backwards",
        },
      ),
    ];
    const controller = new AbortController();
    window.addEventListener(
      "pointermove",
      (e) => {
        const ring = ringRef.current;
        const tracked =
          pointerId === null
            ? e.pointerType === "mouse"
            : e.pointerId === pointerId;
        if (ring && tracked) {
          ring.style.transform = ringTransform(e.clientX, e.clientY);
        }
      },
      { capture: true, passive: true, signal: controller.signal },
    );
    return () => {
      controller.abort();
      for (const animation of animations) animation?.cancel();
    };
  }, [pointerId, duration]);

  useEffect(() => {
    if (!done) return;
    const options = {
      duration: MOTION.fast,
      easing: EASE_OUT,
      fill: "forwards",
    } as const;
    const animations = [
      svgRef.current?.animate(
        [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: "scale(1.25)" },
        ],
        options,
      ),
      labelRef.current?.animate(
        [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(-4px)" },
        ],
        options,
      ),
    ];
    return () => {
      for (const animation of animations) animation?.cancel();
    };
  }, [done]);

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
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 rounded-control px-1.5 py-0.5 text-ui font-semibold text-on-brand whitespace-nowrap bg-brand"
      >
        Take control
      </div>
    </div>
  );
}

export { HoldRing };
