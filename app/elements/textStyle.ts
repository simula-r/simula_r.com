import type { TextFont, TextStyle } from "./types";

const TEXT_FONTS: { value: TextFont; label: string; className: string }[] = [
  { value: "handwritten", label: "Handwritten", className: "font-handwritten" },
  { value: "mono", label: "Mono", className: "font-mono" },
  { value: "sans", label: "Sans Serif", className: "font-sans" },
];

const TEXT_SIZES = [8, 12, 14, 16, 24, 32, 40, 64];

function fontClass(font?: TextFont) {
  return TEXT_FONTS.find((f) => f.value === font)?.className;
}

function fontSizeStyle(fontSize?: number) {
  return fontSize ? { fontSize: `${fontSize}pt` } : undefined;
}

function textStyleProps({ font, fontSize }: TextStyle) {
  return { className: fontClass(font), style: fontSizeStyle(fontSize) };
}

export { TEXT_FONTS, TEXT_SIZES, textStyleProps };
