const SOURCE_URL = "https://github.com/simula-r/simula_r.com";

function SourceLink() {
  return (
    <div className="absolute bottom-0 left-0 p-4 z-10 font-mono text-[11px] text-foreground-muted">
      Jake's Custom Canvas Engine ·{" "}
      <a
        href={SOURCE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5 underline-offset-2 hover:text-foreground hover:underline"
      >
        Source
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7 17L17 7M8 7h9v9" />
        </svg>
      </a>
    </div>
  );
}

export { SourceLink };
