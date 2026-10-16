"use client";

import type { DrivePlayer } from "@/app/drive/useDrivePlayer";
import { Gear } from "./Icons";
import { cn } from "@/lib/utils";

type SessionPhase = "lobby" | "following" | "control" | "ended";

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
            <div className="size-6 font-mono font-bold text-ui-sm tracking-tighter text-on-brand grid place-items-center rounded-full bg-brand select-none">
              a_r
            </div>
          </button>
          <div
            title={name || "Anonymous"}
            className="rounded-full border-2 border-shell"
          >
            <div className="size-6 font-semibold text-ui text-on-visitor grid place-items-center rounded-full bg-visitor select-none">
              {(name.charAt(0) || "A").toUpperCase()}
            </div>
          </div>
        </div>
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
  );
}

export { SessionBar };
export type { SessionPhase };
