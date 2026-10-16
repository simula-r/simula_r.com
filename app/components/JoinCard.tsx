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
    <div className="absolute inset-0 z-100 grid place-items-center p-4 bg-black/10 backdrop-blur-xs">
      <form
        className="w-[800px] max-w-full grid grid-cols-1 sm:grid-cols-[1fr_1fr] border-2 border-shell-border bg-shell rounded-xl overflow-hidden text-white shadow-2xl"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onJoin();
        }}
      >
        <div className="p-3 border-b sm:border-b-0 border-shell-border">
          <div className="w-[410px] sm:h-full rounded-xl border-2 border-brand bg-shell-hover" />
        </div>
        <div className="flex flex-col justify-center gap-6 p-6 sm:p-8">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-white/60">
              Jake C. Schroeder invited you
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <div className="text-sm text-white/60">
              {ready
                ? `${formatDuration(duration)} session · Voice over`
                : "guided session · audio on"}
            </div>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-white/80">
              Display name
            </span>
            <div className="flex items-center gap-3 h-11 px-2 rounded-lg bg-shell-hover border border-shell-border focus-within:border-brand">
              <span className="grid place-items-center size-7 shrink-0 rounded-full bg-shell-hover-2 text-xs font-semibold text-white">
                {initial}
              </span>
              <input
                autoFocus
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Anonymous Hiring Manager"
                maxLength={40}
                className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
              />
            </div>
          </label>
          <div className="flex flex-col items-center gap-3">
            <button
              type="submit"
              disabled={!ready}
              className="w-full h-11 rounded-lg bg-brand text-white text-sm font-semibold hover:brightness-110 disabled:opacity-60"
            >
              {ready ? "Join session" : "Loading…"}
            </button>
            <button
              type="button"
              onClick={onLookAround}
              className="text-sm text-white/60 hover:text-white"
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
