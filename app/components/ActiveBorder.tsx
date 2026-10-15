"use client";

import { useEffect, useRef, type Ref } from "react";
import type { DrivePlayer } from "@/app/drive/useDrivePlayer";
import { Volume, VolumeOff } from "./Icons";

function formatTime(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

function CornerLeft() {
  return (
    <svg
      className="absolute -left-1 bottom-[-3.5px]"
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="fill-brand"
        d="M3.99964 1.7643e-05C3.99964 2.20916 2.20877 4.00002 -0.00036478 4.00002V7.1366H7.63867V1.7643e-05H3.99964Z"
      />
    </svg>
  );
}

function CornerRight() {
  return (
    <svg
      className="absolute -right-1 bottom-[-3.5px]"
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="fill-brand"
        d="M3.63904 1.7643e-05C3.63904 2.20916 5.4299 4.00002 7.63904 4.00002V7.1366H0V1.7643e-05H3.63904Z"
      />
    </svg>
  );
}

function ProgressSegments({ player }: { player: DrivePlayer }) {
  const fills = useRef<(HTMLDivElement | null)[]>([]);
  const { subscribe, chapters } = player;

  useEffect(
    () =>
      subscribe((frame) => {
        for (const [i, node] of fills.current.entries()) {
          if (!node) continue;
          const fill =
            i < frame.chapter
              ? 1
              : i > frame.chapter
                ? 0
                : Math.min(1, frame.time / chapters[i].duration);
          node.style.width = `${fill * 100}%`;
        }
      }),
    [subscribe, chapters],
  );

  return (
    <div className="flex items-center gap-1 w-40 h-4">
      {chapters.map((chapter, i) => (
        <div
          key={chapter.id}
          className="bg-white/50 relative rounded-sm h-1.5"
          style={{ flexGrow: chapter.duration }}
        >
          <div
            ref={(node) => {
              fills.current[i] = node;
            }}
            className="absolute inset-y-0 left-0 bg-white rounded-sm"
          />
        </div>
      ))}
    </div>
  );
}

function ElapsedTime({ player }: { player: DrivePlayer }) {
  const elapsedRef = useRef<HTMLSpanElement>(null);
  const { subscribe, offsets } = player;

  useEffect(
    () =>
      subscribe((frame) => {
        const node = elapsedRef.current;
        if (!node) return;
        node.textContent = formatTime((offsets[frame.chapter] ?? 0) + frame.time);
      }),
    [subscribe, offsets],
  );

  return (
    <div className="whitespace-nowrap tabular-nums">
      <span ref={elapsedRef} /> / {formatTime(player.total)}
    </div>
  );
}

function ActiveBorder({
  player,
  hintRef,
}: {
  player: DrivePlayer;
  hintRef?: Ref<HTMLDivElement>;
}) {
  if (player.status !== "playing") return null;

  return (
    <>
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-50">
        <div className="relative bg-brand flex items-center gap-4 pl-4 pr-2 h-8 text-xs text-foreground font-mono rounded-t-lg select-none">
          <CornerLeft />
          <div className="whitespace-nowrap">Following a_r</div>
          <div ref={hintRef} className="whitespace-nowrap text-foreground/70">
            Hold anywhere to take control
          </div>
          <ProgressSegments player={player} />
          <ElapsedTime player={player} />
          <button
            onClick={player.toggleMute}
            aria-label={player.muted ? "Unmute" : "Mute"}
            aria-pressed={player.muted}
            className="w-6 h-6 grid place-items-center rounded-sm hover:bg-white/20"
          >
            {player.muted ? (
              <VolumeOff className="w-4 h-4" />
            ) : (
              <Volume className="w-4 h-4" />
            )}
          </button>
          <CornerRight />
        </div>
      </div>
      <div className="absolute inset-0 border-4 border-brand pointer-events-none z-50" />
    </>
  );
}

export { ActiveBorder, formatTime };
