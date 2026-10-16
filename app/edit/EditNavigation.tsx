import { Navigation } from "@/app/components/Navigation";
import { Sidebar } from "@/app/components/Icons";

type EditNavigationProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  disabled?: boolean;
};

function EditNavigation({
  sidebarOpen,
  onToggleSidebar,
  disabled = false,
}: EditNavigationProps) {
  return (
    <Navigation>
      <button
        type="button"
        onClick={onToggleSidebar}
        disabled={disabled}
        aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        aria-pressed={sidebarOpen}
        className={`size-8 rounded-control grid place-items-center text-ink-2 hover:text-ink hover:bg-shell-hover disabled:text-ink-4 disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-brand ${
          sidebarOpen ? "bg-shell-active text-ink" : ""
        }`}
      >
        <Sidebar className="w-4 h-4" />
      </button>
    </Navigation>
  );
}

export { EditNavigation };
