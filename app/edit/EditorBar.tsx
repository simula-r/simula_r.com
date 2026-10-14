"use client";

import { cn } from "@/lib/utils";
import type { RecorderStatus } from "@/app/drive/useDriveRecorder";
import type { SaveStatus } from "./useSaveGraph";

const SAVE_LABEL: Record<SaveStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Save failed",
};

const RECORDER_LABEL: Record<RecorderStatus, string> = {
  idle: "",
  recording: "Recording",
  paused: "Paused",
  saving: "Saving drive…",
  saved: "Drive saved",
  "saved-webm-only": "Drive saved (no ffmpeg, WebM only)",
  error: "Recording failed",
};

type Recorder = {
  status: RecorderStatus;
  chapterCount: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  done: () => void;
};

const BUTTON_CLASS =
  "h-8 px-3 rounded-md hover:bg-shell-hover disabled:opacity-50 select-none";

function EditorBar({
  saveStatus,
  dirty,
  onSave,
  recorder,
}: {
  saveStatus: SaveStatus;
  dirty: boolean;
  onSave: () => void;
  recorder: Recorder;
}) {
  const { status } = recorder;
  const active = status === "recording" || status === "paused";
  const saveLabel =
    saveStatus === "saved" && dirty ? "" : SAVE_LABEL[saveStatus];
  const label =
    RECORDER_LABEL[status] || saveLabel || (dirty ? "Unsaved changes" : "");
  const failed = status === "error" || saveStatus === "error";

  return (
    <div className="absolute p-4 top-0 right-0 z-10">
      <div className="flex items-center space-x-3 border border-shell-border bg-shell p-1 rounded-sm font-mono text-xs">
        <div
          className={cn(
            "pl-2 flex items-center gap-2 select-none",
            failed ? "text-brand" : "text-white/60",
          )}
        >
          {status === "recording" && (
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
          {label}
          {active && ` · Chapter ${recorder.chapterCount + 1}`}
        </div>
        {status === "recording" && (
          <button onClick={recorder.pause} className={BUTTON_CLASS}>
            Pause
          </button>
        )}
        {status === "paused" && (
          <button onClick={recorder.resume} className={BUTTON_CLASS}>
            Resume
          </button>
        )}
        {active && (
          <button onClick={recorder.done} className={BUTTON_CLASS}>
            Done
          </button>
        )}
        {!active && (
          <>
            <button
              onClick={recorder.start}
              disabled={status === "saving"}
              className={BUTTON_CLASS}
            >
              Record
            </button>
            <button
              onClick={onSave}
              disabled={saveStatus === "saving"}
              className={BUTTON_CLASS}
            >
              Save
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export { EditorBar };
