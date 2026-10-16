"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Question } from "./Icons";
import { ARBall } from "./Navigation";

const SOURCE_URL = "https://github.com/simula-r/simula_r.com";

const FEATURES = [
  ["Camera", "Pan, zoom, fly-to"],
  ["Culling", "Draws only what's on screen"],
  ["Presence", "Cursors and follow mode"],
  ["Sessions", "Narration synced to the camera"],
] as const;

function HelpButton() {
  const [internals, setInternals] = useState(false);

  return (
    <div className="absolute p-4 bottom-0 right-0 z-10">
      <Popover>
        <div className="p-1 border border-shell-border bg-shell shadow-panel rounded-panel">
          <PopoverTrigger
            aria-label="Help"
            className="grid place-items-center size-8 rounded-control text-ink-2 hover:text-ink hover:bg-shell-hover data-[state=open]:bg-shell-active data-[state=open]:text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Question className="size-4.5" />
          </PopoverTrigger>
        </div>
        <PopoverContent
          side="top"
          align="start"
          sideOffset={8}
          className="w-80 p-4 rounded-panel border-shell-border bg-shell text-ink shadow-dialog"
        >
          <div className="flex items-center gap-3">
            <ARBall className="size-8 shrink-0" />
            <div className="min-w-0">
              <div className="text-ui-lg font-semibold text-ink">Simula_r</div>
              <div className="font-mono text-ui-sm text-ink-3">
                v0.1 · by Jake C. Schroeder
              </div>
            </div>
          </div>
          <p className="mt-3 text-ui text-ink-2">
            A whiteboard I built from scratch for this portfolio. No whiteboard
            library, no site builder.
          </p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-ui">
            {FEATURES.map(([term, detail]) => (
              <div key={term} className="contents">
                <dt className="font-mono text-ui-sm text-ink-3">
                  {term}
                </dt>
                <dd className="text-ink-2">{detail}</dd>
              </div>
            ))}
          </dl>
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-1 h-8 rounded-control border border-shell-border-strong text-ui font-medium text-ink hover:bg-shell-hover active:bg-shell-active outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            View source on GitHub
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
          </a>
          <label className="mt-3 flex items-center justify-between text-ui font-medium text-ink-2 cursor-pointer">
            Show internals
            <button
              type="button"
              role="switch"
              aria-checked={internals}
              onClick={() => setInternals((on) => !on)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                internals ? "bg-ink" : "bg-shell-border-strong"
              }`}
            >
              <span
                className={`absolute top-1 left-1 size-4 rounded-full transition-transform ${
                  internals ? "translate-x-5 bg-shell" : "bg-ink-2"
                }`}
              />
            </button>
          </label>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { HelpButton };
