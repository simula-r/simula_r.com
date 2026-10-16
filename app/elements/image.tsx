"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ElementDefinition, ImageElementData } from "./types";
import { uploadImage } from "./uploadImage";

const PREVIEW_WIDTH = 240;
const PREVIEW_HEIGHT = 180;

function ImageIconSVG({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="61"
      height="46"
      viewBox="0 0 61 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_138_498)">
        <path
          d="M55.44 0H5.04C2.25648 0 0 2.25648 0 5.04V40.32C0 43.1035 2.25648 45.36 5.04 45.36H55.44C58.2235 45.36 60.48 43.1035 60.48 40.32V5.04C60.48 2.25648 58.2235 0 55.44 0Z"
          className="fill-shell-active"
        />
        <mask
          id="mask0_138_498"
          style={{ maskType: "luminance" }}
          maskUnits="userSpaceOnUse"
          x="3"
          y="3"
          width="54"
          height="34"
        >
          <path
            d="M55.4403 3.78003H5.04027C4.34439 3.78003 3.78027 4.34415 3.78027 5.04003V35.28C3.78027 35.9759 4.34439 36.54 5.04027 36.54H55.4403C56.1362 36.54 56.7003 35.9759 56.7003 35.28V5.04003C56.7003 4.34415 56.1362 3.78003 55.4403 3.78003Z"
            fill="white"
          />
        </mask>
        <g mask="url(#mask0_138_498)">
          <path
            d="M56.7003 3.78003H3.78027V36.54H56.7003V3.78003Z"
            fill="#9CC3F0"
          />
          <path
            d="M42.8401 15.7497C44.9277 15.7497 46.6201 14.0573 46.6201 11.9697C46.6201 9.88206 44.9277 8.1897 42.8401 8.1897C40.7524 8.1897 39.0601 9.88206 39.0601 11.9697C39.0601 14.0573 40.7524 15.7497 42.8401 15.7497Z"
            fill="#F9D98A"
          />
          <path
            d="M3.78027 30.2399L16.3803 17.6399L26.4603 26.4599L36.5403 18.8999L56.7003 31.4999V36.5399H3.78027V30.2399Z"
            fill="#5E9C7E"
          />
          <path
            d="M3.78027 34.02L21.4203 26.46L35.2803 32.13L56.7003 27.72V36.54H3.78027V34.02Z"
            fill="#8CD3A6"
          />
        </g>
        <path
          d="M55.4404 0.629883H5.04037C2.6048 0.629883 0.630371 2.60431 0.630371 5.03988V40.3199C0.630371 42.7555 2.6048 44.7299 5.04037 44.7299H55.4404C57.8759 44.7299 59.8504 42.7555 59.8504 40.3199V5.03988C59.8504 2.60431 57.8759 0.629883 55.4404 0.629883Z"
          stroke="white"
          strokeOpacity={0.09}
          strokeWidth={1.26}
        />
      </g>
      <defs>
        <clipPath id="clip0_138_498">
          <rect width="60.48" height="45.36" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function ImageSidebarIcon() {
  return <ImageIconSVG className="w-12" />;
}

function ImagePlaceholder({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  return (
    <div className="flex items-center justify-center" style={{ width, height }}>
      <ImageIconSVG className="block w-full h-full" />
    </div>
  );
}

function ImagePreviewElement() {
  return <ImagePlaceholder width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} />;
}

function ImageCanvasElement({ element }: { element: ImageElementData }) {
  if (!element.src) {
    return <ImagePlaceholder width={element.width} height={element.height} />;
  }
  return (
    <div
      className={cn(
        element.variant !== "bare" &&
          "overflow-hidden rounded-control outline-8 outline-shell shadow-[0_0_0_9px_var(--shell-border),0_16px_40px_8px_rgb(0_0_0/0.4)]",
      )}
    >
      <Image
        src={element.src}
        width={element.width}
        height={element.height}
        alt=""
        draggable={false}
        unoptimized
        className="block max-w-none select-none"
      />
    </div>
  );
}

function ImageEditor({ element }: { element: ImageElementData }) {
  return <ImageCanvasElement element={element} />;
}

function pickImageFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.oncancel = () => resolve(null);
    input.click();
  });
}

function imageElement(
  x: number,
  y: number,
  upload: { src: string; width: number; height: number },
): ImageElementData {
  return { id: crypto.randomUUID(), type: "image", x, y, ...upload };
}

const imageDefinition: ElementDefinition<ImageElementData> = {
  kind: "image",
  label: "Image",
  editable: false,
  Icon: ImageSidebarIcon,
  Preview: ImagePreviewElement,
  Render: ImageCanvasElement,
  Editor: ImageEditor,
  create: (x, y) =>
    imageElement(x, y, {
      src: "",
      width: PREVIEW_WIDTH,
      height: PREVIEW_HEIGHT,
    }),
  fill: async () => {
    const file = await pickImageFile();
    if (!file) return null;
    return uploadImage(file);
  },
};

export { imageDefinition, imageElement };
