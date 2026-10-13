"use client";

import { useRef } from "react";
import { SidebarItem } from "./SidebarItem";
import { StickyNoteBaseSVG, StickyNoteSidebarIcon } from "./StickyNote";
import { TextPreviewElement, TextSidebarIcon } from "./Text";

function SidebarKnurling() {
  return (
    <svg
      width="51"
      height="6"
      viewBox="0 0 34 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="2.15576" height="1.29744" fill="#212121" />
      <rect x="3.15576" width="2.15576" height="1.29744" fill="#212121" />
      <rect x="6.31152" width="2.15576" height="1.29744" fill="#212121" />
      <rect x="9.46729" width="2.15576" height="1.29744" fill="#212121" />
      <rect x="12.623" width="2.15576" height="1.29744" fill="#212121" />
      <rect x="15.7788" width="2.15576" height="1.29744" fill="#212121" />
      <rect x="18.9346" width="2.15576" height="1.29744" fill="#212121" />
      <rect x="22.0903" width="2.15576" height="1.29744" fill="#212121" />
      <rect x="25.2461" width="2.15576" height="1.29744" fill="#212121" />
      <rect x="28.4019" width="2.15576" height="1.29744" fill="#212121" />
      <rect x="31.5576" width="2.15576" height="1.29744" fill="#212121" />
      <rect y="2.29749" width="2.15576" height="1.29744" fill="#212121" />
      <rect
        x="3.15576"
        y="2.29749"
        width="2.15576"
        height="1.29744"
        fill="#212121"
      />
      <rect
        x="6.31152"
        y="2.29749"
        width="2.15576"
        height="1.29744"
        fill="#212121"
      />
      <rect
        x="9.46729"
        y="2.29749"
        width="2.15576"
        height="1.29744"
        fill="#212121"
      />
      <rect
        x="12.623"
        y="2.29749"
        width="2.15576"
        height="1.29744"
        fill="#212121"
      />
      <rect
        x="15.7788"
        y="2.29749"
        width="2.15576"
        height="1.29744"
        fill="#212121"
      />
      <rect
        x="18.9346"
        y="2.29749"
        width="2.15576"
        height="1.29744"
        fill="#212121"
      />
      <rect
        x="22.0903"
        y="2.29749"
        width="2.15576"
        height="1.29744"
        fill="#212121"
      />
      <rect
        x="25.2461"
        y="2.29749"
        width="2.15576"
        height="1.29744"
        fill="#212121"
      />
      <rect
        x="28.4019"
        y="2.29749"
        width="2.15576"
        height="1.29744"
        fill="#212121"
      />
      <rect
        x="31.5576"
        y="2.29749"
        width="2.15576"
        height="1.29744"
        fill="#212121"
      />
    </svg>
  );
}

type SidebarProps = {
  zoom: number;
  onCreateNote: (clientX: number, clientY: number) => void;
  onCreateText: (clientX: number, clientY: number) => void;
};

function Sidebar({ zoom, onCreateNote, onCreateText }: SidebarProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2">
      <div
        ref={panelRef}
        className="relative border border-shell bg-shell rounded-sm flex flex-col items-center justify-center p-4 space-y-4 pt-8"
      >
        <div className="absolute top-2">
          <SidebarKnurling />
        </div>
        <div className="flex items-center flex-col space-y-2">
          <SidebarItem
            panelRef={panelRef}
            icon={<StickyNoteSidebarIcon />}
            preview={<StickyNoteBaseSVG />}
            zoom={zoom}
            onCreate={onCreateNote}
          />
          <div className="text-xl font-handwritten select-none">Note</div>
        </div>
        <div className="flex items-center flex-col space-y-2">
          <SidebarItem
            panelRef={panelRef}
            icon={<TextSidebarIcon />}
            preview={<TextPreviewElement />}
            zoom={zoom}
            onCreate={onCreateText}
          />
          <div className="text-xl font-handwritten select-none">Text</div>
        </div>
      </div>
    </div>
  );
}

export { Sidebar };
