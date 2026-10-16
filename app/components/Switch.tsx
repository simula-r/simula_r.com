function Switch({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative h-4 w-7 rounded-full transition-colors ${
        on ? "bg-ink" : "bg-shell-border-strong"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-3 rounded-full transition-transform ${
          on ? "translate-x-3 bg-shell" : "bg-ink-2"
        }`}
      />
    </span>
  );
}

export { Switch };
