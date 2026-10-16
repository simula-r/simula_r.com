"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { TextElementData } from "./types";
import { TEXT_COLORS, TEXT_FONTS, TEXT_SIZES, colorOption } from "./textStyle";

const TOOLBAR_GAP = 12;
const TOOLBAR_ATTR = "data-text-toolbar";

const TRIGGER_CLASS =
  "size-8 grid place-items-center rounded-control hover:bg-shell-hover data-[state=open]:bg-shell-active";
const CONTENT_CLASS =
  "w-auto min-w-28 p-1 rounded-panel border border-shell-border bg-shell text-ui text-ink shadow-dialog";
const ITEM_CLASS =
  "w-full h-8 px-2 flex items-center rounded-control text-left hover:bg-shell-hover focus-visible:bg-shell-hover outline-none aria-pressed:bg-shell-active";

function isInTextToolbar(node: EventTarget | null) {
  return node instanceof Element && node.closest(`[${TOOLBAR_ATTR}]`) !== null;
}

function useFollowAnchor(
  getAnchor: () => HTMLElement | null,
  floatingRef: React.RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    let frame = 0;
    const follow = () => {
      const anchor = getAnchor();
      const floating = floatingRef.current;
      if (anchor && floating) {
        const rect = anchor.getBoundingClientRect();
        floating.style.transform = `translate(${rect.left + rect.width / 2}px, ${rect.top - TOOLBAR_GAP}px) translate(-50%, -100%)`;
      }
      frame = requestAnimationFrame(follow);
    };
    follow();
    return () => cancelAnimationFrame(frame);
  }, [getAnchor, floatingRef]);
}

function ToolbarPopover({
  label,
  trigger,
  children,
}: {
  label: string;
  trigger: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const returnFocus = useRef<Element | null>(null);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) returnFocus.current = document.activeElement;
        setOpen(next);
      }}
    >
      <PopoverTrigger
        aria-label={label}
        className={TRIGGER_CLASS}
        onMouseDown={(e) => e.preventDefault()}
      >
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        {...{ [TOOLBAR_ATTR]: "" }}
        side="top"
        sideOffset={8}
        updatePositionStrategy="always"
        className={CONTENT_CLASS}
        onInteractOutside={() => {
          returnFocus.current = null;
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          const target = returnFocus.current;
          if (target instanceof HTMLElement && target.isConnected)
            target.focus();
        }}
      >
        {children(() => setOpen(false))}
      </PopoverContent>
    </Popover>
  );
}

function ToolbarItem({
  selected,
  className,
  onSelect,
  children,
}: {
  selected: boolean;
  className?: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(ITEM_CLASS, className)}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}

function TextToolbar({
  element,
  getAnchor,
  onChange,
}: {
  element: TextElementData;
  getAnchor: () => HTMLElement | null;
  onChange: (patch: Partial<TextElementData>) => void;
}) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  useFollowAnchor(getAnchor, toolbarRef);

  return createPortal(
    <div
      ref={toolbarRef}
      {...{ [TOOLBAR_ATTR]: "" }}
      role="toolbar"
      aria-label="Text formatting"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.preventDefault()}
      className="fixed left-0 top-0 z-40 h-10 px-1 flex items-center rounded-panel border text-ui text-ink bg-shell border-shell-border shadow-panel select-none"
    >
      <div className="flex items-center gap-4">
        <ToolbarPopover
          label="Font"
          trigger={
            <div className="flex items-center gap-0.5">
              <div className="text-ui font-handwritten">A</div>
              <div className="text-ui font-sans">b</div>
            </div>
          }
        >
          {(close) =>
            TEXT_FONTS.map((font) => (
              <ToolbarItem
                key={font.value}
                selected={element.font === font.value}
                className={font.className}
                onSelect={() => {
                  onChange({ font: font.value });
                  close();
                }}
              >
                {font.label}
              </ToolbarItem>
            ))
          }
        </ToolbarPopover>
        <div className="w-px h-8 bg-shell-border" />
        <ToolbarPopover
          label="Font size"
          trigger={<div className="text-ui font-mono">T</div>}
        >
          {(close) =>
            TEXT_SIZES.map((size) => (
              <ToolbarItem
                key={size}
                selected={element.fontSize === size}
                className="font-mono"
                onSelect={() => {
                  onChange({ fontSize: size });
                  close();
                }}
              >
                {size}pt
              </ToolbarItem>
            ))
          }
        </ToolbarPopover>
        <div className="w-px h-8 bg-shell-border" />
        <ToolbarPopover
          label="Text color"
          trigger={
            <div
              className={cn(
                "size-3.5 rounded-full ring-1 ring-shell-border-strong",
                colorOption(element).swatchClassName,
              )}
            />
          }
        >
          {(close) =>
            TEXT_COLORS.map((color) => (
              <ToolbarItem
                key={color.value}
                selected={colorOption(element).value === color.value}
                className="gap-2"
                onSelect={() => {
                  onChange({ color: color.value });
                  close();
                }}
              >
                <span
                  className={cn("size-3 rounded-full", color.swatchClassName)}
                />
                {color.label}
              </ToolbarItem>
            ))
          }
        </ToolbarPopover>
      </div>
    </div>,
    document.body,
  );
}

export { TextToolbar, isInTextToolbar };
