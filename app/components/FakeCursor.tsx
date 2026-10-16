"use client";

import { useEffect, useState, type Ref } from "react";
import type { Camera } from "@/app/elements/types";
import { pointTransform } from "@/lib/camera";
import { cn } from "@/lib/utils";

const TYPE_MS = 30;

function ChatBubble({
  text,
  delay,
  leaving,
  onLeft,
}: {
  text: string;
  delay: number;
  leaving: boolean;
  onLeft: () => void;
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (shown >= text.length) return;
    const timer = window.setTimeout(
      () => setShown(shown + 1),
      shown === 0 ? delay : TYPE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [shown, text, delay]);

  const unseen = shown === 0;
  useEffect(() => {
    if (unseen && leaving) onLeft();
  }, [unseen, leaving, onLeft]);

  if (unseen) return null;

  return (
    <div
      className={cn(
        "w-max max-w-60 rounded-panel rounded-tl-sm px-2 py-1.5 text-ui font-semibold text-on-brand bg-brand break-words whitespace-pre-wrap origin-top-left transition-[opacity,scale] starting:opacity-0 starting:scale-90",
        leaving
          ? "opacity-0 scale-95 ease-in duration-(--motion-instant)"
          : "ease-out duration-(--motion-fast)",
      )}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && leaving) onLeft();
      }}
    >
      {text.slice(0, shown)}
    </div>
  );
}

function FakeCursor({
  camera,
  x,
  y,
  name,
  chat,
  chatDelay = 0,
  onClick,
  ref,
}: {
  ref?: Ref<HTMLDivElement>;
  camera: Camera;
  x: number;
  y: number;
  name: string;
  chat?: string;
  chatDelay?: number;
  onClick?: () => void;
}) {
  const clickable = Boolean(onClick);
  const [said, setSaid] = useState(chat);
  if (chat && chat !== said) setSaid(chat);

  return (
    <div
      ref={ref}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? `${name}: ${chat ?? ""}` : undefined}
      className={cn(
        "group absolute left-1/2 top-1/2 select-none z-10",
        clickable
          ? "pointer-events-auto cursor-pointer"
          : "pointer-events-none",
      )}
      style={{ transform: pointTransform(camera, { x, y }) }}
      onPointerDown={clickable ? (e) => e.stopPropagation() : undefined}
      onClick={onClick}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter") onClick?.();
            }
          : undefined
      }
    >
      <div
        className={cn(
          "relative origin-top-left transition-transform",
          clickable && "group-hover:scale-105",
        )}
      >
        <svg width="18" height="22" viewBox="0 0 18 22">
          <path
            d="M1 1L1 18L5.5 13.5L8.5 21L11.5 19.8L8.5 12.5L15 12.5L1 1Z"
            className="fill-brand"
            stroke="white"
            strokeOpacity={0.9}
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
        <div className="absolute left-4 top-7 flex flex-col items-start gap-1">
          <div
            className={cn(
              "rounded-control px-1.5 py-0.5 font-mono text-ui font-bold text-on-brand whitespace-nowrap bg-brand",
              clickable && "group-hover:ring-2 group-hover:ring-brand/40",
            )}
          >
            {name}
          </div>
          {said && (
            <ChatBubble
              key={said}
              text={said}
              delay={chatDelay}
              leaving={!chat}
              onLeft={() => setSaid(undefined)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export { FakeCursor };
