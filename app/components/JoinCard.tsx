"use client";

import { useState, type CSSProperties, type Ref } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "./Icons";
import { SOURCE_URL } from "./Navigation";

const RISE =
  "transition-[opacity,translate] ease-out duration-(--motion-medium) delay-[calc(200ms+var(--i)*var(--motion-stagger))] starting:opacity-0 starting:translate-y-1";

function rise(i: number) {
  return { "--i": i } as CSSProperties;
}

function JoinCard({
  open,
  title,
  previewRef,
  ready,
  name,
  onNameChange,
  onJoin,
  onLookAround,
}: {
  open: boolean;
  title: string;
  previewRef?: Ref<HTMLDivElement>;
  ready: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onJoin: () => void;
  onLookAround: () => void;
}) {
  const initial = (name.trim()[0] ?? "A").toUpperCase();
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);
  if (!present) return null;

  return (
    <div
      inert={!open}
      className={cn(
        "absolute inset-0 z-100 grid place-items-center p-4 bg-black/30 backdrop-blur-xs transition-opacity starting:opacity-0",
        open
          ? "opacity-100 ease-out duration-(--motion-base)"
          : "opacity-0 ease-in duration-(--motion-medium) delay-60",
      )}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && !open) setPresent(false);
      }}
    >
      <form
        className={cn(
          "w-[800px] max-w-full grid grid-cols-1 sm:grid-cols-[1fr_1fr] border border-shell-border bg-shell rounded-dialog overflow-hidden text-ink shadow-dialog transition-[opacity,translate,scale] starting:opacity-0 starting:translate-y-2 starting:scale-98",
          open
            ? "ease-out duration-(--motion-medium) delay-120"
            : "opacity-0 scale-98 ease-in duration-200",
        )}
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onJoin();
        }}
      >
        <div className="p-1 border-b sm:border-b-0 border-shell-border">
          <div
            ref={previewRef}
            className="relative aspect-video sm:aspect-auto sm:h-full rounded-panel border-2 border-brand bg-shell-inset overflow-hidden isolate"
          >
            <video
              src="/chrome_DW9jeDVRGf.mp4"
              autoPlay
              loop
              muted
              playsInline
              disablePictureInPicture
              disableRemotePlayback
              preload="auto"
              aria-hidden
              tabIndex={-1}
              className="absolute inset-0 size-full object-cover scale-120 pointer-events-none"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center gap-8 p-6 sm:p-8">
          <div className="flex flex-col">
            <h1
              className={cn(RISE, "text-ui-title font-semibold")}
              style={rise(0)}
            >
              {title}
            </h1>
            <p
              className={cn(RISE, "mt-2 text-ui text-ink-2 text-pretty")}
              style={rise(1)}
            >
              My portfolio, as a guided walk across an infinite canvas: less
              resume, more how I think. Built from scratch (no tldraw, no
              Excalidraw) because canvases are my favorite excuse to show
              off.{" "}
              <a
                href={SOURCE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 font-medium text-ink underline decoration-ink-4 underline-offset-2 hover:decoration-brand outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-xs"
              >
                Source
                <ArrowUpRight className="size-3 text-ink-3" />
              </a>
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <label className={cn(RISE, "flex flex-col gap-2")} style={rise(2)}>
              <span className="text-ui font-medium text-ink-2">
                Display name
              </span>
              <div className="flex items-center gap-2 h-9 px-1.5 rounded-control bg-shell-inset border border-shell-border-strong focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/20">
                <span className="grid place-items-center size-6 shrink-0 rounded-full bg-visitor text-ui font-semibold text-on-visitor">
                  {initial}
                </span>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="Anonymous Hiring Manager"
                  maxLength={40}
                  className="flex-1 min-w-0 bg-transparent text-ui text-ink placeholder:text-ink-3 caret-brand outline-none"
                />
              </div>
            </label>
            <div className={cn(RISE, "flex flex-col gap-2")} style={rise(3)}>
              <button
                type="submit"
                disabled={!ready}
                className="w-full h-9 rounded-control bg-brand text-on-brand text-ui font-semibold shadow-bevel hover:bg-brand-hover active:bg-brand-pressed outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-shell disabled:bg-shell-active disabled:text-ink-3 disabled:shadow-none"
              >
                {ready ? "Join session" : "Loading…"}
              </button>
              <button
                type="button"
                onClick={onLookAround}
                className="w-full h-9 rounded-control text-ui font-medium text-ink-2 hover:text-ink hover:bg-shell-hover active:bg-shell-active outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Explore on my own
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export { JoinCard };
