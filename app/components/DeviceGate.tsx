"use client";

import { useState } from "react";

function DeviceGate() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="hidden handheld:grid fixed inset-0 z-200 place-items-center p-4 bg-background">
      <div className="w-[320px] max-w-full flex flex-col gap-6 p-6 border border-shell-border bg-shell rounded-dialog text-ink shadow-dialog">
        <div className="flex flex-col gap-2">
          <h1 className="text-ui-title font-semibold">
            Best on a laptop or desktop
          </h1>
          <p className="text-ui-lg text-ink-2 text-pretty">
            This portfolio is an interactive canvas built for a mouse and
            keyboard. Open it on a bigger screen for the full experience.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="w-full h-9 rounded-control text-ui font-medium text-ink-2 hover:text-ink hover:bg-shell-hover active:bg-shell-active outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Continue anyway
        </button>
      </div>
    </div>
  );
}

export { DeviceGate };
