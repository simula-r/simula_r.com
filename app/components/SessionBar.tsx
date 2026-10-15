"use client";

import type { ReactNode } from "react";
import { Play, Replay } from "./Icons";
import { cn } from "@/lib/utils";

type SessionPhase = "lobby" | "following" | "control" | "ended";

function ActionButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="font-mono flex items-center space-x-2 text-xs h-8 px-2 rounded-md hover:bg-shell-hover select-none"
    >
      {children}
    </button>
  );
}

function SessionAction({
  phase,
  started,
  onPlay,
  onReplay,
}: {
  phase: SessionPhase;
  started: boolean;
  onPlay: () => void;
  onReplay: () => void;
}) {
  if (phase === "ended") {
    return (
      <ActionButton onClick={onReplay}>
        <Replay className="w-4 h-4" />
        <div>Replay</div>
      </ActionButton>
    );
  }
  if (phase !== "control") return null;
  return (
    <ActionButton onClick={onPlay}>
      <Play className="w-4 h-4" />
      <div>{started ? "Resume tour" : "Start tour"}</div>
    </ActionButton>
  );
}

function SessionBar({
  phase,
  started,
  name,
  onPlay,
  onReplay,
}: {
  phase: SessionPhase;
  started: boolean;
  name: string;
  onPlay: () => void;
  onReplay: () => void;
}) {
  const following = phase === "following";
  const hasAction = phase === "control" || phase === "ended";

  return (
    <div className="absolute p-4 top-0 right-0 z-10">
      <div
        className={cn(
          "flex items-center gap-4 border border-shell-border bg-shell p-1 rounded-lg",
          !hasAction && "px-2",
        )}
      >
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
            title={name}
            className="rounded-full border-2 border-transparent"
          >
            <div className="w-6 h-6 text-white font-mono text-[11px] grid place-items-center rounded-full bg-linear-to-b from-[#5572A9] to-[#152033] select-none">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        <SessionAction
          phase={phase}
          started={started}
          onPlay={onPlay}
          onReplay={onReplay}
        />
      </div>
    </div>
  );
}

export { SessionBar };
export type { SessionPhase };
