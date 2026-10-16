import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownButton } from "./MenuButton";

const BOARD_TITLE = "Jake's Dope Portfolio";

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
          <DropdownMenuContent align="start" alignOffset={-5}>
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
