import { cn } from "@/lib/utils";
import { ChevronDown } from "./Icons";

function DropdownButton({
  children,
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-2 text-ui font-medium h-8 px-2 rounded-control hover:bg-shell-hover active:bg-shell-active data-[state=open]:bg-shell-active outline-none focus-visible:ring-2 focus-visible:ring-brand",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="size-2 text-ink-3" />
    </button>
  );
}

export { DropdownButton };
