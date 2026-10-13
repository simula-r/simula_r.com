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

type SplitButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  onMenuClick?: () => void;
  className?: string;
};

function SplitButton({
  children,
  onClick,
  onMenuClick,
  className,
}: SplitButtonProps) {
  return (
    <div className="group flex items-center space-x-[0.5px]">
      <button
        onClick={onClick}
        className={cn(
          "font-mono flex items-center space-x-2 text-xs h-8 px-2 group-hover:bg-shell-hover hover:bg-shell-hover-2 rounded-l-md",
          className,
        )}
      >
        {children}
      </button>
      <button
        onClick={onMenuClick}
        className="h-8 px-2 group-hover:bg-shell-hover hover:bg-shell-hover-2 rounded-r-md"
      >
        <ChevronDown className="w-2 h-2" />
      </button>
    </div>
  );
}

export { DropdownButton, SplitButton };
