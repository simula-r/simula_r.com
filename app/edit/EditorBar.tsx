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
  "h-8 px-2.5 rounded-control text-ui font-medium text-ink hover:bg-shell-hover active:bg-shell-active disabled:text-ink-4 disabled:hover:bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-brand select-none";

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
      <div className="flex items-center gap-1 border border-shell-border bg-shell text-ink shadow-panel p-1 rounded-panel">
        <div
          className={cn(
            "pl-2 pr-1 flex items-center gap-2 font-mono text-ui-sm select-none",
            failed ? "text-danger" : "text-ink-2",
          )}
        >
          {status === "recording" && (
            <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
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
