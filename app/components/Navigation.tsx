"use client";

import type { ReactNode } from "react";
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
import { ArrowUpRight, GitHub, Info } from "./Icons";

const BOARD_TITLE = "Jake's Dope Portfolio";
const REPO = "simula-r/simula_r.com";
const SOURCE_URL = `https://github.com/${REPO}`;
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

function ExternalItem({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <DropdownMenuItem
      asChild
      className="group h-auto items-start gap-3 py-2 cursor-pointer"
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <ArrowUpRight className="size-3.5 mt-0.5 ml-auto shrink-0 text-ink-4 opacity-0 transition-opacity group-data-highlighted:opacity-100" />
      </a>
    </DropdownMenuItem>
  );
}

function About() {
  return (
    <div className="flex items-center gap-3 p-2 pb-3">
      <ARBall className="size-8 shrink-0" />
      <div className="min-w-0 text-ui-lg font-semibold text-ink">
        Simula_r <span className="font-normal text-ink-3">(Jake)</span>
      </div>
    </div>
  );
}

function Navigation({ children }: { children?: ReactNode }) {
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
          <DropdownMenuContent align="start" alignOffset={-5} className="w-56">
            <DropdownMenuRadioGroup value={BOARD_TITLE}>
              <DropdownMenuRadioItem value={BOARD_TITLE}>
                {BOARD_TITLE}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Game Jam Board" disabled>
                Game Jam Board
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-ink-3">New project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="About this site"
              className="grid place-items-center size-8 rounded-control text-ink-3 hover:text-ink hover:bg-shell-hover active:bg-shell-active data-[state=open]:bg-shell-active data-[state=open]:text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Info className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" alignOffset={-5} className="w-80">
            <About />
            <p className="px-2 pb-3 text-ui-sm text-ink-2 text-pretty">
              An infinite canvas with a narrated tour of my work. Sit back and
              watch, or hold anywhere to take the controls and explore on your
              own.
            </p>
            <p className="px-2 pb-3 text-ui-sm text-ink-2 text-pretty">
              No tldraw, no Excalidraw, mostly because that&apos;s overkill.
              Did build my own editor tho.
            </p>
            <DropdownMenuSeparator />
            <ExternalItem href={SOURCE_URL}>
              <GitHub className="size-4 mt-0.5 shrink-0 text-ink-3 group-data-highlighted:text-ink" />
              <div className="min-w-0">
                <div className="font-mono text-ui-sm text-ink">{REPO}</div>
                <div className="text-ui-sm text-ink-3">Read the source</div>
              </div>
            </ExternalItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {children}
      </div>
    </div>
  );
}

export { Navigation, ARBall, BOARD_TITLE, SOURCE_URL };
