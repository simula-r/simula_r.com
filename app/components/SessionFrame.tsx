"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { DrivePlayer } from "@/app/drive/useDrivePlayer";
import type { SessionPhase } from "./SessionBar";
import { HandPalm, Pause, Play, Replay, Volume, VolumeMute } from "./Icons";
import { cn } from "@/lib/utils";

const ACTION_LABELS = ["Start sesh", "Resume sesh", "Replay sesh"];

function formatTime(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

function CornerLeft({ className }: { className?: string }) {
  return (
    <svg
      className={cn(
        "absolute -left-1 bottom-[-3.5px] transition-opacity",
        className,
      )}
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

function CornerRight({ className }: { className?: string }) {
  return (
    <svg
      className={cn(
        "absolute -right-1 bottom-[-3.5px] transition-opacity",
        className,
      )}
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

function useWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState<number>();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setWidth(node.offsetWidth));
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

function Border({ active }: { active: boolean }) {
  const [present, setPresent] = useState(active);
  if (active && !present) setPresent(true);
  if (!present) return null;

  return (
    <div
      className={cn(
        "absolute inset-1 rounded-panel outline-solid outline-[length:100vmax] outline-brand pointer-events-none z-50 transition-opacity ease-out starting:opacity-0",
        active
          ? "opacity-100 duration-(--motion-scenic) delay-150"
          : "opacity-0 duration-(--motion-base)",
      )}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && !active) setPresent(false);
      }}
    />
  );
}

function Controls({ player }: { player: DrivePlayer }) {
  const playing = player.status === "playing";

  return (
    <div className="flex items-center gap-4 px-2 h-full">
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
      <div className="w-px h-5 -mx-1.5 bg-on-brand/25" />
      <button
        onClick={player.interrupt}
        aria-label="Explore"
        title="Explore (or press and hold anywhere on the board)"
        className="size-7 grid place-items-center rounded-control hover:bg-on-brand/10 active:bg-on-brand/20 outline-none focus-visible:ring-2 focus-visible:ring-on-brand"
      >
        <HandPalm className="size-4.5" />
      </button>
    </div>
  );
}

function Action({
  phase,
  player,
}: {
  phase: SessionPhase;
  player: DrivePlayer;
}) {
  const ended = phase === "ended";
  const label = ended
    ? "Replay sesh"
    : player.status === "idle"
      ? "Start sesh"
      : "Resume sesh";

  return (
    <button
      onClick={ended ? player.replay : player.play}
      disabled={player.chapters.length === 0}
      className="flex items-center gap-1.5 h-full pl-3 pr-3.5 font-sans text-ui font-semibold hover:bg-on-brand/10 active:bg-on-brand/20 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-on-brand disabled:opacity-50"
    >
      {ended ? <Replay className="size-4" /> : <Play className="size-4" />}
      <span className="grid">
        {ACTION_LABELS.map((l) => (
          <span
            key={l}
            aria-hidden
            className="invisible col-start-1 row-start-1"
          >
            {l}
          </span>
        ))}
        <span className="col-start-1 row-start-1">{label}</span>
      </span>
    </button>
  );
}

function Face({
  shown,
  enter,
  children,
  ref,
}: {
  shown: boolean;
  enter: string;
  children: React.ReactNode;
  ref: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={ref}
      inert={!shown}
      className={cn(
        "absolute inset-y-0 left-1/2 -translate-x-1/2 w-max transition-opacity ease-out",
        shown
          ? cn("opacity-100", enter)
          : "opacity-0 duration-(--motion-instant)",
      )}
    >
      {children}
    </div>
  );
}

function SessionFrame({
  phase,
  player,
}: {
  phase: SessionPhase;
  player: DrivePlayer;
}) {
  const controlsRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const controlsWidth = useWidth(controlsRef);
  const actionWidth = useWidth(actionRef);
  const docked = phase === "following";
  const [landed, setLanded] = useState(false);
  const [wasDocked, setWasDocked] = useState(docked);
  if (docked !== wasDocked) {
    setWasDocked(docked);
    setLanded(false);
  }

  const land = (e: React.TransitionEvent) => {
    if (e.target !== e.currentTarget || e.propertyName !== "translate") return;
    if (docked) setLanded(true);
  };
  const corner = cn(
    "ease-out",
    docked && landed
      ? "opacity-100 duration-(--motion-fast)"
      : "opacity-0 duration-(--motion-instant)",
  );

  return (
    <>
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-50">
        <div
          className="transition-[opacity,translate] ease-out duration-(--motion-slow) delay-300 starting:opacity-0 starting:translate-y-3"
          onTransitionEnd={land}
        >
          <div
            className={cn(
              "relative select-none transition-[translate] ease-out",
              docked
                ? "duration-(--motion-slow)"
                : "-translate-y-3 duration-(--motion-medium) delay-40",
            )}
            onTransitionEnd={land}
          >
            <CornerLeft className={corner} />
            <div
              className={cn(
                "relative h-10 overflow-hidden bg-brand font-mono text-ui font-bold text-on-brand transition-[width,border-radius,box-shadow] ease-out",
                docked
                  ? "rounded-t-panel duration-(--motion-slow)"
                  : "rounded-panel duration-(--motion-medium) delay-40 shadow-[var(--shadow-bevel),0_1px_2px_rgb(0_0_0/0.3),0_4px_12px_rgb(0_0_0/0.18)]",
              )}
              style={{ width: docked ? controlsWidth : actionWidth }}
            >
              <Face
                shown={docked}
                enter="duration-(--motion-medium) delay-250"
                ref={controlsRef}
              >
                <Controls player={player} />
              </Face>
              <Face
                shown={!docked}
                enter="duration-(--motion-base) delay-200"
                ref={actionRef}
              >
                <Action phase={phase} player={player} />
              </Face>
            </div>
            <CornerRight className={corner} />
          </div>
        </div>
      </div>
      <Border active={docked} />
    </>
  );
}

export { SessionFrame };
