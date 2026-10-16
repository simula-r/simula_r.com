"use client";

import type { ComponentType, ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import pkg from "@/package.json";
import { DropdownButton } from "./MenuButton";
import { ArrowUpRight, Branch, Code, Hand, Info, Mic } from "./Icons";

const BOARD_TITLE = "Jake's Dope Portfolio";
const REPO = "simula-r/simula_r.com";
const SOURCE_URL = `https://github.com/${REPO}`;
const DEPENDENCY_COUNT = Object.keys(pkg.dependencies).length;

const HIGHLIGHTS: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  file: string;
}[] = [
  {
    icon: Mic,
    title: "The tour is one live take",
    detail: "Voice, cursor and camera recorded together",
    file: "app/drive/useDriveRecorder.ts",
  },
  {
    icon: Hand,
    title: "Hold to take the wheel",
    detail: "Interrupt anytime, click my cursor to resume",
    file: "app/components/useHoldToControl.ts",
  },
  {
    icon: Code,
    title: "No canvas library",
    detail: "Camera, culling and input are hand-rolled",
    file: "app/components/Canvas.tsx",
  },
];

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
    <DropdownMenuItem asChild>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group h-auto items-start gap-3 py-2"
      >
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
      <div className="min-w-0">
        <div className="text-ui-lg font-semibold text-ink">Simula_r</div>
        <div className="text-ui-sm text-ink-3">
          A canvas I built to make my case
        </div>
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
            {HIGHLIGHTS.map(({ icon: Icon, title, detail, file }) => (
              <ExternalItem key={file} href={`${SOURCE_URL}/blob/master/${file}`}>
                <Icon className="size-4 mt-0.5 shrink-0 text-ink-3 group-data-highlighted:text-brand" />
                <div className="min-w-0">
                  <div className="text-ink">{title}</div>
                  <div className="text-ui-sm text-ink-3">{detail}</div>
                </div>
              </ExternalItem>
            ))}
            <DropdownMenuSeparator />
            <ExternalItem href={SOURCE_URL}>
              <Branch className="size-4 mt-0.5 shrink-0 text-ink-3 group-data-highlighted:text-ink" />
              <div className="min-w-0">
                <div className="font-mono text-ui-sm text-ink">{REPO}</div>
                <div className="text-ui-sm text-ink-3">
                  Read the source · {DEPENDENCY_COUNT} dependencies
                </div>
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
