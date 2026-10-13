const ContainerCornerPiece = (
  <svg
    width="8"
    height="8"
    viewBox="0 0 8 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.99964 1.7643e-05C3.99964 2.20916 2.20877 4.00002 -0.00036478 4.00002V7.1366H7.63867V1.7643e-05H3.99964Z"
      fill="#F8640F"
    />
  </svg>
);

function ActiveBorder({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <>
      <div className="flex">
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
          <div className="relative bg-brand flex items-center px-4 h-8 text-xs text-foreground font-mono rounded-t-lg">
            <svg
              className="absolute -left-1 bottom-[-3.5px]"
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="fill-brand"
                d="M3.99964 1.7643e-05C3.99964 2.20916 2.20877 4.00002 -0.00036478 4.00002V7.1366H7.63867V1.7643e-05H3.99964Z"
              />
            </svg>

            <div>Following a_r</div>
            <div className="flex items-center gap-4">
              <div className="text-foreground-muted">Chapter:</div>
              <div className="">Work</div>

              <div className="flex items-center gap-2">
                <div className="bg-white/50 relative rounded-sm w-20 h-2">
                  <div className="absolute inset-0 w-10 bg-white rounded-l-sm"></div>
                </div>
                <div className="bg-white/50 relative rounded-sm w-20 h-2">
                  <div className="absolute inset-0 w-10 bg-white rounded-l-sm"></div>
                </div>
                <div className="bg-white/50 relative rounded-sm w-20 h-2">
                  <div className="absolute inset-0 w-10 bg-white rounded-l-sm"></div>
                </div>
                <div className="bg-white/50 relative rounded-sm w-20 h-2">
                  <div className="absolute inset-0 w-10 bg-white rounded-l-sm"></div>
                </div>
              </div>
            </div>
            <svg
              className="absolute -right-1 bottom-[-3.5px]"
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="fill-brand"
                d="M3.63904 1.7643e-05C3.63904 2.20916 5.4299 4.00002 7.63904 4.00002V7.1366H0V1.7643e-05H3.63904Z"
                fill="#F8640F"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 border-4 border-brand pointer-events-none z-50" />
    </>
  );
}

export { ActiveBorder };
