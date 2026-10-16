"use client";

import type { ElementDefinition, StickyElementData } from "./types";
import { EditableTextarea } from "./EditableTextarea";

function StickyNoteBaseSVG({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={314}
      height={309}
      viewBox={`0 0 314 309`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_50_855)">
        <path
          d="M32 28.7H273.4C274.275 28.7 275.115 29.0476 275.733 29.6665C276.352 30.2854 276.7 31.1247 276.7 32V227.7L229.7 271.7H32C31.1248 271.7 30.2854 271.352 29.6666 270.733C29.0477 270.115 28.7 269.275 28.7 268.4V32C28.7 31.1247 29.0477 30.2854 29.6666 29.6665C30.2854 29.0476 31.1248 28.7 32 28.7Z"
          className="fill-sticky stroke-sticky-edge"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M229.7 271.7L276.7 227.7C264.2 239 237.2 237.2 237.2 237.2C237.2 237.2 239.2 262.4 229.7 271.7Z"
          className="fill-sticky-fold stroke-sticky-edge"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_50_855"
          x="0"
          y="0"
          width="313.4"
          height="308.4"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="4" dy="4" />
          <feGaussianBlur stdDeviation="16" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_50_855"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_50_855"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

function StickyNoteSidebarIcon() {
  return (
    <svg
      className="w-11 h-11"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.516138 0.090332H31.6645C31.7775 0.090332 31.8858 0.136117 31.9656 0.217614C32.0455 0.299111 32.0903 0.409645 32.0903 0.5249V22.2138L22.0258 32.0903H0.516138C0.403207 32.0903 0.294902 32.0445 0.215048 31.963C0.135194 31.8816 0.090332 31.771 0.090332 31.6558V0.5249C0.090332 0.409645 0.135194 0.299111 0.215048 0.217614C0.294902 0.136117 0.403207 0.090332 0.516138 0.090332Z"
        className="fill-sticky stroke-sticky-edge"
        strokeWidth="0.180645"
        strokeLinejoin="round"
      />
      <path
        d="M22.0259 32.0903L32.0904 22.2137C30.4775 23.7018 22.9936 23.4648 22.9936 23.4648C22.9936 23.4648 23.2517 30.8656 22.0259 32.0903Z"
        className="fill-sticky-fold stroke-sticky-edge"
        strokeWidth="0.180645"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const STICKY_TEXT_CLASS =
  "absolute w-[216px] text-center whitespace-pre-wrap wrap-break-word text-[22px] leading-[1.2] font-handwritten font-semibold text-on-sticky";

function StickyNoteCanvasElement({ element }: { element: StickyElementData }) {
  return (
    <div className="flex items-center justify-center select-none">
      <div className={STICKY_TEXT_CLASS}>
        {element.text}
      </div>
      <StickyNoteBaseSVG />
    </div>
  );
}

function StickyNoteEditor({
  element,
  onChange,
  onDone,
}: {
  element: StickyElementData;
  onChange: (patch: Partial<StickyElementData>) => void;
  onDone: () => void;
}) {
  return (
    <div className="flex items-center justify-center">
      <EditableTextarea
        value={element.text}
        className={STICKY_TEXT_CLASS}
        onChange={(text) => onChange({ text })}
        onDone={onDone}
      />
      <StickyNoteBaseSVG />
    </div>
  );
}

const stickyDefinition: ElementDefinition<StickyElementData> = {
  kind: "sticky",
  label: "Note",
  editable: true,
  Icon: StickyNoteSidebarIcon,
  Preview: StickyNoteBaseSVG,
  Render: StickyNoteCanvasElement,
  Editor: StickyNoteEditor,
  create: (x, y) => ({
    id: crypto.randomUUID(),
    type: "sticky",
    x,
    y,
    text: "New note",
  }),
};

export { stickyDefinition };
