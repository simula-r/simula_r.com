"use client";

import { cn } from "@/lib/utils";

function EditableTextarea({
  value,
  className,
  onChange,
  onDone,
}: {
  value: string;
  className?: string;
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
      onChange={(e) => onChange(e.target.value)}
      onBlur={onDone}
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
