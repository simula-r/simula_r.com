"use client";

import { useState } from "react";
import type { DrivePlayer } from "@/app/drive/useDrivePlayer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Gear } from "./Icons";
import { Switch } from "./Switch";
import { cn } from "@/lib/utils";

type SessionPhase = "lobby" | "following" | "control" | "ended";

function SessionBar({
  phase,
  player,
  name,
  onStart,
}: {
  phase: SessionPhase;
  player: DrivePlayer;
  name: string;
  onStart: () => void;
}) {
  const [internals, setInternals] = useState(false);
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
              "rounded-full border-2 border-shell outline-2 outline-transparent transition-[outline-color] ease-out duration-(--motion-base) focus-visible:ring-2 focus-visible:ring-brand",
              following && "outline-brand delay-650",
              startable && "hover:outline-brand/50",
            )}
          >
            <div className="size-6 font-mono font-semibold text-ui-sm tracking-tighter text-on-brand grid place-items-center rounded-full bg-brand select-none">
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
        <div className="w-px h-5 -mr-1.5 bg-shell-border" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Settings"
              className="grid place-items-center size-8 rounded-control text-ink-2 hover:text-ink hover:bg-shell-hover active:bg-shell-active data-[state=open]:bg-shell-active data-[state=open]:text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Gear className="size-4.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" alignOffset={-5} className="w-56">
            <DropdownMenuItem
              role="menuitemcheckbox"
              aria-checked={internals}
              className="justify-between"
              onSelect={(e) => {
                e.preventDefault();
                setInternals((on) => !on);
              }}
            >
              Show internals
              <Switch on={internals} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export { SessionBar };
export type { SessionPhase };
