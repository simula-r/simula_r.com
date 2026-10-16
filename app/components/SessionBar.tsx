"use client";

import type { ReactNode } from "react";
import type { DrivePlayer } from "@/app/drive/useDrivePlayer";
import { Gear, Pause, Play, Replay } from "./Icons";
import { cn } from "@/lib/utils";

type SessionPhase = "lobby" | "following" | "control" | "ended";

const ACTION_LABELS = ["Start sesh", "Resume sesh", "Pause sesh", "Replay sesh"];

function ActionButton({
  onClick,
  disabled,
  icon,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 text-ui font-semibold h-8 pl-2 pr-2.5 rounded-control select-none text-on-brand bg-brand shadow-bevel hover:bg-brand-hover active:bg-brand-pressed outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-shell disabled:bg-shell-active disabled:text-ink-3 disabled:shadow-none"
    >
      {icon}
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

function SessionAction({
  phase,
  player,
  onStart,
}: {
  phase: SessionPhase;
  player: DrivePlayer;
  onStart: () => void;
}) {
  if (phase === "ended") {
    return (
      <ActionButton
        onClick={player.replay}
        icon={<Replay className="size-4" />}
        label="Replay sesh"
      />
    );
  }
  if (phase === "following") {
    const playing = player.status === "playing";
    return (
      <ActionButton
        onClick={playing ? player.pause : player.play}
        icon={
          playing ? <Pause className="size-4" /> : <Play className="size-4" />
        }
        label={playing ? "Pause sesh" : "Resume sesh"}
      />
    );
  }
  const started = player.status !== "idle";
  return (
    <ActionButton
      disabled={player.chapters.length === 0}
      onClick={phase === "lobby" ? onStart : player.play}
      icon={<Play className="size-4" />}
      label={started ? "Resume sesh" : "Start sesh"}
    />
  );
}

function SessionBar({
  phase,
  player,
  name,
  onStart,
  onSettings,
}: {
  phase: SessionPhase;
  player: DrivePlayer;
  name: string;
  onStart: () => void;
  onSettings?: () => void;
}) {
  const following = phase === "following";
  const startable = !following && player.chapters.length > 0;
  const handleHostClick = () => {
    if (phase === "ended") player.replay();
    else if (phase === "lobby") onStart();
    else if (phase === "control") player.play();
  };

  return (
    <div className="absolute p-4 top-0 right-0 z-50">
      <div className="flex items-center gap-3 border border-shell-border bg-shell text-ink shadow-panel p-1 pl-2 rounded-panel">
        <div className="flex items-center -space-x-0.5 h-8">
          <button
            type="button"
            title="a_r"
            aria-label={phase === "ended" ? "Replay sesh" : "Start sesh"}
            onClick={handleHostClick}
            disabled={!startable}
            className={cn(
              "rounded-full border-2 border-shell focus-visible:ring-2 focus-visible:ring-brand",
              following && "outline-2 outline-brand",
              startable && "cursor-pointer hover:outline-2 hover:outline-brand/50",
            )}
          >
            <div className="size-6 font-mono font-bold text-[10px] tracking-tighter text-on-brand grid place-items-center rounded-full bg-brand select-none">
              a_r
            </div>
          </button>
          <div
            title={name || "Anonymous"}
            className="rounded-full border-2 border-shell"
          >
            <div className="size-6 font-bold text-ui text-on-visitor grid place-items-center rounded-full bg-visitor select-none">
              {(name.charAt(0) || "A").toUpperCase()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SessionAction phase={phase} player={player} onStart={onStart} />
          <button
            type="button"
            aria-label="Settings"
            onClick={onSettings}
            className="grid place-items-center size-8 rounded-control text-ink-2 hover:text-ink hover:bg-shell-hover active:bg-shell-active outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Gear className="size-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export { SessionBar };
export type { SessionPhase };
