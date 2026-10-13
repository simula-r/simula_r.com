import { Fragment } from "react/jsx-runtime";
import { Sidebar } from "./Icons";
import { DropdownButton } from "./MenuButton";

function Navigation() {
  return (
    <>
      <div className="absolute p-4 top-0 left-0 z-10">
        <div className="flex space-x-6 items-center border border-shell bg-shell p-1 rounded-sm">
          <DropdownButton>
            <img
              src="/simula_r.png"
              className="w-6 h-6 rounded-full border border-[#919191]"
            />
            <div>Simula_r Portfolio</div>
          </DropdownButton>
          <button className="h-8 w-8 rounded-sm hover:bg-shell-hover grid place-items-center">
            <Sidebar className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export { Navigation };
