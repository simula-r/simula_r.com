"use client";

import type { ReactNode } from "react";
import type { DrivePlayer } from "@/app/drive/useDrivePlayer";
import { Gear, Pause, Play, Replay } from "./Icons";
import { cn } from "@/lib/utils";

type SessionPhase = "lobby" | "following" | "control" | "ended";

function ActionButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="font-mono flex items-center space-x-2 text-xs h-8 px-2 rounded-md select-none text-white bg-brand hover:brightness-110 disabled:opacity-60"
    >
      {children}
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
      <ActionButton onClick={player.replay}>
        <Replay className="w-4.5 h-4.5" />
        <div>Replay sesh</div>
      </ActionButton>
    );
  }
  if (phase === "following") {
    const playing = player.status === "playing";
    return (
      <ActionButton onClick={playing ? player.pause : player.play}>
        {playing ? (
          <Pause className="w-4.5 h-4.5" />
        ) : (
          <Play className="w-4.5 h-4.5" />
        )}
        <div>{playing ? "Pause sesh" : "Resume sesh"}</div>
      </ActionButton>
    );
  }
  const started = player.status !== "idle";
  return (
    <ActionButton
      disabled={player.chapters.length === 0}
      onClick={phase === "lobby" ? onStart : player.play}
    >
      <Play className="w-4.5 h-4.5" />
      <div>{started ? "Resume sesh" : "Start sesh"}</div>
    </ActionButton>
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

  return (
    <div className="absolute p-4 top-0 right-0 z-50">
      <div className="flex items-center gap-4 border border-shell-border bg-shell p-1 pl-2 rounded-lg">
        <div className="flex items-center -space-x-0.5 h-8">
          <div
            title="a_r"
            className={cn(
              "rounded-full border-2 border-transparent",
              following && "border-brand",
            )}
          >
            <div className="w-6 h-6 text-black font-bold grid place-items-center rounded-full bg-linear-to-b from-[#D9D9D9] to-[#676767] text-[11px] pb-2 select-none">
              a_r
            </div>
          </div>
          <div
            title={name || "Anonymous"}
            className="rounded-full border-2 border-transparent"
          >
            <div className="w-6 h-6 text-white font-semibold text-[11px] grid place-items-center rounded-full bg-shell-hover-2 select-none">
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
            className="grid place-items-center w-8 h-8 rounded-md text-white hover:bg-shell-hover"
          >
            <Gear className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export { SessionBar };
export type { SessionPhase };
