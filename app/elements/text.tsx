"use client";

import { parseTextMarkup } from "@/lib/parseTextMarkup";
import type { ElementDefinition, TextElementData } from "./types";
import { EditableTextarea } from "./EditableTextarea";

function TextSidebarIcon() {
  return (
    <svg
      className="w-12 h-12"
      width="37"
      height="27"
      viewBox="0 0 37 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M36.3018 0.30188H0.301758V26.5611H36.3018V0.30188Z"
        stroke="#62A6DE"
        strokeWidth="0.603853"
      />
      <path
        d="M21.1312 18.9198C19.2298 18.9198 18.667 18.3874 18.667 16.5621C18.667 14.4021 19.4732 13.7632 22.196 13.7632H23.6259V13.3829C23.6259 12.1204 23.2152 11.7401 21.8157 11.7401C20.5836 11.7401 20.2186 11.9987 20.1881 12.8809H18.9104C18.9104 11.1468 19.5797 10.6296 21.8157 10.6296C24.1431 10.6296 24.8276 11.2533 24.8276 13.3829V18.7677H23.6715V17.7486H23.5651C23.0479 18.646 22.485 18.9198 21.1312 18.9198ZM19.9447 16.4252C19.9447 17.4748 20.2946 17.779 21.4507 17.779C23.1087 17.779 23.6107 17.1097 23.6107 14.8432L21.8918 14.8584C20.3859 14.8736 19.9447 15.2387 19.9447 16.4252Z"
        fill="white"
      />
      <path
        d="M8.84668 18.7678L11.8129 8.42407H13.7904L16.7566 18.7678H15.4636L14.703 16.1515H10.885L10.1396 18.7678H8.84668ZM11.1892 15.0106H14.414L12.8625 9.5345H12.7408L11.1892 15.0106Z"
        fill="white"
      />
      <path
        d="M27.0767 6.46252L27.0767 20.5631"
        stroke="#62A6DE"
        strokeWidth="1.20771"
      />
    </svg>
  );
}


function TextPreviewElement() {
  return (
    <div className="py-1 pointer-events-none">
      <p className="m-0 p-0 block text-base">Add text</p>
    </div>
  );
}

function TextCanvasElement({ element }: { element: TextElementData }) {
  return (
    <div className="py-1">
      <p className="m-0 p-0 block text-base whitespace-nowrap">
        {parseTextMarkup(element.text)}
      </p>
    </div>
  );
}

function TextEditor({
  element,
  onChange,
  onDone,
}: {
  element: TextElementData;
  onChange: (patch: Partial<TextElementData>) => void;
  onDone: () => void;
}) {
  return (
    <div className="py-1">
      <EditableTextarea
        value={element.text}
        className="m-0 p-0 block text-base whitespace-nowrap"
        onChange={(text) => onChange({ text })}
        onDone={onDone}
      />
    </div>
  );
}

const textDefinition: ElementDefinition<TextElementData> = {
  kind: "text",
  label: "Text",
  editable: true,
  Icon: TextSidebarIcon,
  Preview: TextPreviewElement,
  Render: TextCanvasElement,
  Editor: TextEditor,
  create: (x, y) => ({
    id: crypto.randomUUID(),
    type: "text",
    x,
    y,
    text: "Add text",
  }),
};

export { textDefinition };
