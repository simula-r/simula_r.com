"use client";

import { useState } from "react";
import { formatTime } from "./ActiveBorder";

function formatDuration(seconds: number) {
  if (seconds < 60) return formatTime(seconds);
  return `${Math.round(seconds / 60)} min`;
}

function JoinCard({
  title,
  duration,
  ready,
  onJoin,
  onLookAround,
}: {
  title: string;
  duration: number;
  ready: boolean;
  onJoin: (name: string) => void;
  onLookAround: (name: string) => void;
}) {
  const [name, setName] = useState("");

  return (
    <div className="absolute inset-0 z-40 grid place-items-center p-4 bg-black/10 backdrop-blur-sm">
      <form
        className="w-80 max-w-full flex flex-col gap-4 border border-shell-border bg-shell rounded-lg p-4 text-white"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onJoin(name);
        }}
      >
        <div className="flex flex-col gap-1">
          <div className="font-mono text-xs text-white/60">
            a_r invited you to a jam
          </div>
          <h1 className="text-lg font-medium">{title}</h1>
          <div className="font-mono text-xs text-white/60">
            {ready ? `${formatDuration(duration)} · sound on` : "sound on"}
          </div>
        </div>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What should I call you?"
          aria-label="What should I call you?"
          maxLength={40}
          className="h-8 px-2 rounded-md bg-shell-hover border border-shell-border font-mono text-xs text-white placeholder:text-white/40 outline-none focus:border-brand"
        />
        <div className="flex flex-col items-center gap-2">
          <button
            type="submit"
            disabled={!ready}
            className="w-full h-8 rounded-md bg-brand text-white font-mono text-xs disabled:opacity-60"
          >
            {ready ? "Join" : "Loading…"}
          </button>
          <button
            type="button"
            onClick={() => onLookAround(name)}
            className="font-mono text-xs text-white/60 hover:text-white hover:underline"
          >
            just let me look around
          </button>
        </div>
      </form>
    </div>
  );
}

export { JoinCard };
