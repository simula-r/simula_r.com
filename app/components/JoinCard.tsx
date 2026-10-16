"use client";

function formatDuration(seconds: number) {
  if (seconds < 120) return `${Math.round(seconds)}-second`;
  return `${Math.round(seconds / 60)}-minute`;
}

function JoinCard({
  title,
  duration,
  ready,
  name,
  onNameChange,
  onJoin,
  onLookAround,
}: {
  title: string;
  duration: number;
  ready: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onJoin: () => void;
  onLookAround: () => void;
}) {
  const initial = (name.trim()[0] ?? "A").toUpperCase();

  return (
    <div className="absolute inset-0 z-100 grid place-items-center p-4 bg-black/30 backdrop-blur-xs">
      <form
        className="w-[800px] max-w-full grid grid-cols-1 sm:grid-cols-[1fr_1fr] border border-shell-border bg-shell rounded-dialog overflow-hidden text-ink shadow-dialog"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onJoin();
        }}
      >
        <div className="p-3 border-b sm:border-b-0 border-shell-border">
          <div className="w-[410px] sm:h-full rounded-panel border-2 border-brand bg-shell-inset" />
        </div>
        <div className="flex flex-col justify-center gap-6 p-6 sm:p-8">
          <div className="flex flex-col gap-1.5">
            <div className="text-ui-md text-ink-2">
              Jake C. Schroeder invited you
            </div>
            <h1 className="text-ui-title font-semibold">{title}</h1>
            <div className="font-mono text-ui-sm text-ink-3">
              {ready
                ? `${formatDuration(duration)} session · Voice over`
                : "guided session · audio on"}
            </div>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-ui font-medium text-ink-2">
              Display name
            </span>
            <div className="flex items-center gap-2 h-9 px-1.5 rounded-control bg-shell-inset border border-shell-border-strong focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/20">
              <span className="grid place-items-center size-6 shrink-0 rounded-full bg-visitor text-ui font-bold text-on-visitor">
                {initial}
              </span>
              <input
                autoFocus
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Anonymous Hiring Manager"
                maxLength={40}
                className="flex-1 min-w-0 bg-transparent text-ui-md text-ink placeholder:text-ink-3 caret-brand outline-none"
              />
            </div>
          </label>
          <div className="flex flex-col gap-1">
            <button
              type="submit"
              disabled={!ready}
              className="w-full h-9 rounded-control bg-brand text-on-brand text-ui-md font-semibold shadow-bevel hover:bg-brand-hover active:bg-brand-pressed outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-shell disabled:bg-shell-active disabled:text-ink-3 disabled:shadow-none"
            >
              {ready ? "Join session" : "Loading…"}
            </button>
            <button
              type="button"
              onClick={onLookAround}
              className="w-full h-9 rounded-control text-ui-md font-medium text-ink-2 hover:text-ink hover:bg-shell-hover active:bg-shell-active outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Explore on my own
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export { JoinCard };
