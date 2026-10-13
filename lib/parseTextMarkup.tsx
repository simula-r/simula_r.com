import type { ReactNode } from "react";

const LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;

function parseLine(line: string, lineIndex: number): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let linkIndex = 0;
  let match: RegExpExecArray | null;

  LINK_PATTERN.lastIndex = 0;
  while ((match = LINK_PATTERN.exec(line))) {
    const [full, label, href] = match;
    if (match.index > lastIndex) {
      nodes.push(line.slice(lastIndex, match.index));
    }
    nodes.push(
      <a
        key={`link-${lineIndex}-${linkIndex}`}
        href={href}
        target="_blank"
        rel="noreferrer"
        className="pointer-events-auto underline"
      >
        {label}
      </a>,
    );
    lastIndex = match.index + full.length;
    linkIndex += 1;
  }
  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex));
  }

  return nodes;
}

function parseTextMarkup(source: string): ReactNode[] {
  const lines = source.split("\n");
  const nodes: ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) nodes.push(<br key={`br-${lineIndex}`} />);
    nodes.push(...parseLine(line, lineIndex));
  });

  return nodes;
}

export { parseTextMarkup };
