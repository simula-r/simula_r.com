"use client";

import { useEffect, useRef } from "react";
import type { DrivePlayer } from "@/app/drive/useDrivePlayer";
import { Play } from "./Icons";

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

function PauseIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3" y="2" width="4" height="12" rx="1" />
      <rect x="9" y="2" width="4" height="12" rx="1" />
    </svg>
  );
}

function ProgressSegments({ player }: { player: DrivePlayer }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const fills = useRef<(HTMLDivElement | null)[]>([]);
  const scrubbing = useRef(false);
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

  const seekAt = (clientX: number) => {
    const track = trackRef.current;
    if (!track || player.total === 0) return;
    const rect = track.getBoundingClientRect();
    const fraction = Math.min(
      1,
      Math.max(0, (clientX - rect.left) / rect.width),
    );
    let remaining = fraction * player.total;
    for (const [i, chapter] of player.chapters.entries()) {
      const last = i === player.chapters.length - 1;
      if (remaining < chapter.duration || last) {
        player.seek(i, Math.min(remaining, chapter.duration));
        return;
      }
      remaining -= chapter.duration;
    }
  };

  return (
    <div
      ref={trackRef}
      className="flex items-center gap-2 w-80 h-4 cursor-pointer touch-none"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        scrubbing.current = true;
        seekAt(e.clientX);
      }}
      onPointerMove={(e) => {
        if (scrubbing.current) seekAt(e.clientX);
      }}
      onPointerUp={() => {
        scrubbing.current = false;
        player.settle();
      }}
      onPointerCancel={() => {
        scrubbing.current = false;
        player.settle();
      }}
    >
      {chapters.map((chapter, i) => (
        <div
          key={chapter.id}
          className="bg-white/50 relative rounded-sm h-2"
          style={{ flexGrow: chapter.duration }}
          title={chapter.title}
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

function ActiveBorder({ player }: { player: DrivePlayer }) {
  if (player.status !== "playing" && player.status !== "paused") return null;
  const chapter = player.chapters[player.chapterIndex];

  return (
    <>
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-50">
        <div className="relative bg-brand flex items-center gap-4 px-4 h-8 text-xs text-foreground font-mono rounded-t-lg select-none">
          <CornerLeft />
          <button
            onClick={player.toggle}
            className="w-6 h-6 grid place-items-center rounded-sm hover:bg-white/20"
          >
            {player.status === "playing" ? (
              <PauseIcon />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          <div className="whitespace-nowrap">Following a_r</div>
          <div className="text-foreground/70">Chapter:</div>
          <div className="whitespace-nowrap">{chapter?.title}</div>
          <ProgressSegments player={player} />
          <ElapsedTime player={player} />
          <CornerRight />
        </div>
      </div>
      <div className="absolute inset-0 border-4 border-brand pointer-events-none z-50" />
    </>
  );
}

export { ActiveBorder };
