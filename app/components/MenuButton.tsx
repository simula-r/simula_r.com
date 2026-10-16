import { cn } from "@/lib/utils";
import { ChevronDown } from "./Icons";

type DropdownButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

function DropdownButton({ children, onClick, className }: DropdownButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 text-ui-md font-medium h-8 px-2 rounded-control hover:bg-shell-hover active:bg-shell-active outline-none focus-visible:ring-2 focus-visible:ring-brand",
        className,
      )}
    >
      {children}
      <ChevronDown className="size-2 text-ink-3" />
    </button>
  );
}

export { DropdownButton };
