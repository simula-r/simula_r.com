import { ChevronDown, Play, User } from "./Icons";
import { SplitButton } from "./MenuButton";

export function SpotlightTour() {
  return (
    <div className="absolute p-4 top-0 right-0 z-10">
      <div className="flex space-x-6 items-center border border-shell bg-shell p-1 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-4 items-center ">
            <div className="flex items-center -space-x-0.5">
              <div className="w-6 h-6 bg-gray-50 grid place-items-center rounded-full bg-linear-to-b from-[#5572A9] to-[#152033]">
                <User />
              </div>
              <div className="w-6 h-6 text-black font-bold grid place-items-center rounded-full bg-linear-to-b from-[#D9D9D9] to-[#676767] text-[11px] pb-2">
                a_r
              </div>
              <div className="w-6 h-6 grid place-items-center rounded-full bg-[#474747]">
                <ChevronDown className="w-2 h-2" />
              </div>
            </div>

            <SplitButton>
              <Play className="w-4 h-4" />
              <div>Take a tour</div>
            </SplitButton>
          </div>
        </div>
      </div>
    </div>
  );
}
