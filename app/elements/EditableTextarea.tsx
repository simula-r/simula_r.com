"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { isInTextToolbar } from "./TextToolbar";

function EditableTextarea({
  value,
  className,
  style,
  onChange,
  onDone,
}: {
  value: string;
  className?: string;
  style?: CSSProperties;
  onChange: (value: string) => void;
  onDone: () => void;
}) {
  return (
    <textarea
      autoFocus
      value={value}
      rows={1}
      className={cn(
        "field-sizing-content resize-none bg-transparent outline-none select-text",
        className,
      )}
      style={style}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => {
        if (isInTextToolbar(e.relatedTarget)) return;
        onDone();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") e.currentTarget.blur();
      }}
      onFocus={(e) => {
        const length = e.currentTarget.value.length;
        e.currentTarget.setSelectionRange(length, length);
      }}
    />
  );
}

export { EditableTextarea };
