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
        "font-mono flex items-center space-x-2 text-xs h-8 px-2 rounded-md hover:bg-shell-hover",
        className,
      )}
    >
      {children}
      <ChevronDown className="w-2 h-2" />
    </button>
  );
}

export { DropdownButton };
