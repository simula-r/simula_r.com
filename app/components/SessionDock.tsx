"use client";

import type { DrivePlayer } from "@/app/drive/useDrivePlayer";
import type { SessionPhase } from "./SessionBar";
import { Play, Replay } from "./Icons";

const ACTION_LABELS = ["Start sesh", "Resume sesh", "Replay sesh"];

function SessionDock({
  phase,
  player,
}: {
  phase: SessionPhase;
  player: DrivePlayer;
}) {
  if (phase !== "control" && phase !== "ended") return null;

  const ended = phase === "ended";
  const label = ended
    ? "Replay sesh"
    : player.status === "idle"
      ? "Start sesh"
      : "Resume sesh";

  return (
    <div className="absolute p-4 bottom-0 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] starting:opacity-0">
      <div className="border border-shell-border bg-shell shadow-panel p-1 rounded-panel">
        <button
          onClick={ended ? player.replay : player.play}
          disabled={player.chapters.length === 0}
          className="flex items-center gap-1.5 text-ui font-semibold h-8 pl-2 pr-2.5 rounded-control select-none text-on-brand bg-brand shadow-bevel hover:bg-brand-hover active:bg-brand-pressed outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-shell disabled:bg-shell-active disabled:text-ink-3 disabled:shadow-none"
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
      </div>
    </div>
  );
}

export { SessionDock };
