import type { ReactNode } from "react";
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
        <DropdownButton className="select-none">
          <ARBall />
          <div>{BOARD_TITLE}</div>
        </DropdownButton>
        {children}
      </div>
    </div>
  );
}

export { Navigation, ARBall, BOARD_TITLE };
