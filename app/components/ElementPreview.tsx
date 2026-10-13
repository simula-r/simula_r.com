"use client";

import { createPortal } from "react-dom";

type ElementPreviewProps = {
  ref?: React.Ref<HTMLDivElement>;
  zoom: number;
  children: React.ReactNode;
};

function ElementPreview({ ref, zoom, children }: ElementPreviewProps) {
  return createPortal(
    <div
      ref={ref}
      className="fixed left-0 top-0 z-20 pointer-events-none opacity-60"
    >
      <div style={{ transform: `translate(-50%, -50%) scale(${zoom})` }}>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export { ElementPreview };
