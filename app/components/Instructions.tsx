import { Hand, Zoom } from "./Icons";

function Instructions() {
  return (
    <div className="flex items-center space-x-4 bottom-12 absolute left-1/2 -translate-x-1/2 font-mono z-10 text-xs">
      <div className="flex items-center space-x-2">
        <div className="">
          <Hand />
        </div>
        <div>Drag to pan</div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="">
          <Zoom />
        </div>
        <div>Scroll to zoom</div>
      </div>
    </div>
  );
}

export { Instructions };
