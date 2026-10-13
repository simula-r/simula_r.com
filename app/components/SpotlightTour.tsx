import { ChevronDown, Info, Play, User } from "./Icons";
import { SplitButton } from "./MenuButton";
import { cn } from "@/lib/utils";

const users = [
  {
    id: "a_r",
    el: (
      <div className="w-6 h-6 text-black font-bold grid place-items-center rounded-full bg-linear-to-b from-[#D9D9D9] to-[#676767] text-[11px] pb-2 select-none">
        a_r
      </div>
    ),
  },

  {
    id: "Anonymous",
    el: (
      <div className="w-6 h-6 bg-gray-50 grid place-items-center rounded-full bg-linear-to-b from-[#5572A9] to-[#152033] select-none">
        <User />
      </div>
    ),
  },
];

type SpotlightTourProps = {
  active: boolean;
  onActiveChange: (active: boolean) => void;
};

export function SpotlightTour({ active, onActiveChange }: SpotlightTourProps) {
  return (
    <div className="absolute p-4 top-0 right-0 z-10">
      <div className="flex space-x-6 items-center border border-shell bg-shell p-1 rounded-lg">
        <div className="flex items-center">
          <div className="flex items-center">
            <div className="flex items-center -space-x-0.5 pr-4">
              {users.map((user) => (
                <div
                  onClick={(e) => {
                    if (user.id === "a_r") {
                      onActiveChange(true);
                    }
                  }}
                  key={user.id}
                  className={cn(
                    "rounded-full border-2 border-transparent",
                    active && user.id === "a_r" ? "border-brand" : null,
                  )}
                >
                  {user.el}
                </div>
              ))}

              <div className="w-6 h-6 grid place-items-center rounded-full bg-[#474747]">
                <ChevronDown className="w-2 h-2" />
              </div>
            </div>

            <SplitButton onClick={() => onActiveChange(!active)}>
              <Play className="w-4 h-4" />
              <div className="select-none">Watch a_r drive</div>
            </SplitButton>

            <div className="pl-2">
              <button className="w-8 h-8 hover:bg-shell-hover grid place-items-center rounded-md">
                <Info />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
