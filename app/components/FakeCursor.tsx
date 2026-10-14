import type { Ref } from "react";
import type { Camera } from "@/app/elements/types";
import { pointTransform } from "@/lib/camera";

function FakeCursor({
  camera,
  x,
  y,
  name,
  ref,
}: {
  ref?: Ref<HTMLDivElement>;
  camera: Camera;
  x: number;
  y: number;
  name: string;
}) {
  return (
    <div
      ref={ref}
      className="absolute left-1/2 top-1/2 pointer-events-none select-none z-10"
      style={{ transform: pointTransform(camera, { x, y }) }}
    >
      <svg width="18" height="22" viewBox="0 0 18 22">
        <path
          d="M1 1L1 18L5.5 13.5L8.5 21L11.5 19.8L8.5 12.5L15 12.5L1 1Z"
          className="fill-brand"
          stroke="white"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
      <div className="absolute left-4 top-7 rounded-md px-2 py-0.5 text-xs font-mono font-medium text-white whitespace-nowrap bg-brand">
        {name}
      </div>
    </div>
  );
}

export { FakeCursor };
