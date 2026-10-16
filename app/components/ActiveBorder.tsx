"use client";

import { useEffect, useRef, useState } from "react";
import type { DrivePlayer } from "@/app/drive/useDrivePlayer";
import {
  Pause,
  PauseCircle,
  Play,
  PlayCircle,
  Volume,
  VolumeMute,
} from "./Icons";

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
          node.style.transform = `scaleX(${fill})`;
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
    for (const [i, chapter] of chapters.entries()) {
      const last = i === chapters.length - 1;
      if (remaining < chapter.duration || last) {
        player.seek(i, Math.min(remaining, chapter.duration));
        return;
      }
      remaining -= chapter.duration;
    }
  };

  const endScrub = () => {
    scrubbing.current = false;
    player.settle();
  };

  return (
    <div
      ref={trackRef}
      className="w-[400px] flex items-center gap-1 h-full cursor-pointer touch-none"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        scrubbing.current = true;
        seekAt(e.clientX);
      }}
      onPointerMove={(e) => {
        if (scrubbing.current) seekAt(e.clientX);
      }}
      onPointerUp={endScrub}
      onPointerCancel={endScrub}
    >
      {chapters.map((chapter, i) => (
        <div
          key={chapter.id}
          className="bg-on-brand/25 relative overflow-hidden rounded-full h-1.5"
          style={{ flexGrow: chapter.duration }}
          title={chapter.title}
        >
          <div
            ref={(node) => {
              fills.current[i] = node;
            }}
            className="absolute inset-0 origin-left bg-on-brand"
            style={{ transform: "scaleX(0)" }}
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
        const text = formatTime((offsets[frame.chapter] ?? 0) + frame.time);
        if (node.textContent !== text) node.textContent = text;
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
  const playing = player.status === "playing";
  const active = playing || player.status === "paused";
  const [present, setPresent] = useState(active);
  if (active && !present) setPresent(true);
  if (!present) return null;

  const fade = `transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)] starting:opacity-0 ${
    active ? "opacity-100 duration-700" : "opacity-0 duration-300 pointer-events-none"
  }`;

  return (
    <>
      <div
        className={`absolute bottom-1 left-1/2 -translate-x-1/2 z-50 ${fade}`}
      >
        <div className="relative bg-brand flex items-center gap-4 px-2 h-10 font-mono text-ui font-bold text-on-brand rounded-t-panel select-none">
          <CornerLeft />
          <button
            onClick={playing ? player.pause : player.play}
            aria-label={playing ? "Pause" : "Play"}
            className="size-7 grid place-items-center rounded-control hover:bg-on-brand/10 active:bg-on-brand/20 outline-none focus-visible:ring-2 focus-visible:ring-on-brand"
          >
            {playing ? (
              <Pause className="size-4.5" />
            ) : (
              <Play className="size-4.5" />
            )}
          </button>
          <ProgressSegments player={player} />
          <ElapsedTime player={player} />
          <button
            onClick={player.toggleMute}
            aria-label={player.muted ? "Unmute" : "Mute"}
            aria-pressed={player.muted}
            className="size-7 grid place-items-center rounded-control hover:bg-on-brand/10 active:bg-on-brand/20 outline-none focus-visible:ring-2 focus-visible:ring-on-brand"
          >
            {player.muted ? (
              <VolumeMute className="w-5 h-5" />
            ) : (
              <Volume className="w-5 h-5" />
            )}
          </button>
          <CornerRight />
        </div>
      </div>
      <div
        className={`absolute inset-1 rounded-panel outline-solid outline-[length:100vmax] outline-brand pointer-events-none z-50 ${fade}`}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && !active) setPresent(false);
        }}
      />
    </>
  );
}

export { ActiveBorder };
