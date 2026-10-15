"use client";

import { Close, Play } from "./Icons";

type TourPausedProps = {
  onResume: () => void;
  onClose: () => void;
};

function TourPaused({ onResume, onClose }: TourPausedProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 border border-shell-border bg-shell p-1 pl-2 rounded-lg font-mono text-xs select-none h-10">
        <div className="whitespace-nowrap pr-2 text-foreground-muted">
          Tour paused
        </div>
        <button
          onClick={onResume}
          className="flex items-center gap-2 h-6 px-2 rounded-md bg-brand text-white text-xs"
        >
          <Play className="w-3 h-3" />
          <span>Resume</span>
        </button>
        <button
          onClick={onClose}
          aria-label="Close tour"
          className="w-6 h-6 grid place-items-center rounded-full hover:bg-shell-hover"
        >
          <Close className="w-2 h-2" />
        </button>
      </div>
    </div>
  );
}

export { TourPaused };
