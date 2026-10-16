"use client";

import { useState, type ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownButton } from "./MenuButton";

const BOARD_TITLE = "Jake's Dope Portfolio";
const SOURCE_URL = "https://github.com/simula-r/simula_r.com";

const FEATURES = [
  ["Camera", "Pan, zoom, fly-to"],
  ["Culling", "Draws only what's on screen"],
  ["Presence", "Cursors and follow mode"],
  ["Sessions", "Narration synced to the camera"],
] as const;

function ARBall({ className = "size-5" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 300 300"
    >
      <circle cx="150" cy="150" r="150" className="fill-brand" />
    </svg>
  );
}

function About() {
  return (
    <div className="p-2 pb-3">
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
            <dt className="font-mono text-ui-sm text-ink-3">{term}</dt>
            <dd className="text-ink-2">{detail}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative h-4 w-7 rounded-full transition-colors ${
        on ? "bg-ink" : "bg-shell-border-strong"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-3 rounded-full transition-transform ${
          on ? "translate-x-3 bg-shell" : "bg-ink-2"
        }`}
      />
    </span>
  );
}

function Navigation({ children }: { children?: ReactNode }) {
  const [internals, setInternals] = useState(false);

  return (
    <div className="absolute p-4 top-0 left-0 z-10">
      <div className="flex gap-1 items-center border border-shell-border bg-shell text-ink shadow-panel p-1 rounded-panel">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <DropdownButton className="select-none">
              <ARBall />
              <div>{BOARD_TITLE}</div>
            </DropdownButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" alignOffset={-5} className="w-72">
            <About />
            <DropdownMenuItem asChild>
              <a
                href={SOURCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="justify-between"
              >
                View source on GitHub
                <svg
                  className="size-3"
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
            </DropdownMenuItem>
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
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={BOARD_TITLE}>
              <DropdownMenuRadioItem value={BOARD_TITLE}>
                {BOARD_TITLE}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Game Jam Board" disabled>
                Game Jam Board
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuItem className="text-ink-3">New project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {children}
      </div>
    </div>
  );
}

export { Navigation, ARBall, BOARD_TITLE };
