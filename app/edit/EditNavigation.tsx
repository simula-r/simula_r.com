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
        className={`h-8 w-8 rounded-sm grid place-items-center hover:bg-shell-hover disabled:opacity-40 disabled:pointer-events-none ${
          sidebarOpen ? "bg-shell-hover" : ""
        }`}
      >
        <Sidebar className="w-4 h-4" />
      </button>
    </Navigation>
  );
}

export { EditNavigation };
