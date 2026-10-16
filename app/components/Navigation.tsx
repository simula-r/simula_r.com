import type { ReactNode } from "react";
import { DropdownButton } from "./MenuButton";

const BOARD_TITLE = "Jake's Dope Portfolio";

function ARBall({ className = "w-6 h-6" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 300 300"
    >
      <defs>
        <radialGradient
          id="highlight"
          cx="182"
          cy="88"
          r="120"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FFD9BC" stopOpacity="1" />
          <stop offset="0.15" stopColor="#FFCDA6" stopOpacity="1" />
          <stop offset="0.45" stopColor="#FFA764" stopOpacity="0.75" />
          <stop offset="1" stopColor="#FF7200" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="150" r="150" fill="#FF7200" />
      <circle cx="150" cy="150" r="150" fill="url(#highlight)" />
    </svg>
  );
}

function Navigation({ children }: { children?: ReactNode }) {
  return (
    <div className="absolute p-4 top-0 left-0 z-10">
      <div className="flex space-x-6 items-center border border-shell-border bg-shell p-1 rounded-sm">
        <DropdownButton className="select-none">
          <ARBall />
          <div>{BOARD_TITLE}</div>
        </DropdownButton>
        {children}
      </div>
    </div>
  );
}

export { Navigation, BOARD_TITLE };
