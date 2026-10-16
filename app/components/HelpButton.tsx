"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Question } from "./Icons";

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
        <PopoverTrigger
          aria-label="Help"
          className="grid place-items-center w-8 h-8 border border-shell-border bg-shell rounded-lg hover:bg-shell-hover data-[state=open]:bg-shell-hover"
        >
          <Question className="w-5 h-5 text-[#AAAAAA]" />
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          sideOffset={8}
          className="w-80 p-5 rounded-xl border-shell-border bg-shell text-[#EDEDED] font-sans shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="size-9 shrink-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFB27A,#F8640F_45%,#B83A00)]" />
            <div className="min-w-0">
              <div className="text-base font-semibold text-white">Simula_r</div>
              <div className="font-mono text-xs text-[#888888]">
                v0.1 · by Jake C. Schroeder
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#DDDDDD]">
            A whiteboard I built from scratch for this portfolio. No whiteboard
            library, no site builder.
          </p>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            {FEATURES.map(([term, detail]) => (
              <div key={term} className="contents">
                <dt className="font-mono text-xs leading-5 text-[#888888]">
                  {term}
                </dt>
                <dd className="text-[#DDDDDD]">{detail}</dd>
              </div>
            ))}
          </dl>
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-center gap-1 h-10 rounded-lg border border-shell-border text-sm font-medium text-white hover:bg-shell-hover"
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
          <label className="mt-4 flex items-center justify-between text-sm text-[#888888] cursor-pointer">
            Show internals
            <button
              type="button"
              role="switch"
              aria-checked={internals}
              onClick={() => setInternals((on) => !on)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                internals ? "bg-brand" : "bg-shell-hover-2"
              }`}
            >
              <span
                className={`absolute top-1 left-1 size-4 rounded-full bg-white transition-transform ${
                  internals ? "translate-x-5" : ""
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
