import { cn } from "@/lib/utils";
import type { TextColor, TextFont, TextStyle } from "./types";

const TEXT_FONTS: { value: TextFont; label: string; className: string }[] = [
  { value: "handwritten", label: "Handwritten", className: "font-handwritten" },
  { value: "mono", label: "Mono", className: "font-mono" },
  { value: "sans", label: "Sans Serif", className: "font-sans" },
];

const TEXT_COLORS: {
  value: TextColor;
  label: string;
  className: string;
  swatchClassName: string;
}[] = [
  {
    value: "ink",
    label: "Default",
    className: "text-ink",
    swatchClassName: "bg-ink",
  },
  {
    value: "muted",
    label: "Muted",
    className: "text-ink-2",
    swatchClassName: "bg-ink-2",
  },
  {
    value: "subtle",
    label: "Subtle",
    className: "text-ink-3",
    swatchClassName: "bg-ink-3",
  },
  {
    value: "brand",
    label: "Brand",
    className: "text-brand-ink",
    swatchClassName: "bg-brand-ink",
  },
  {
    value: "visitor",
    label: "Violet",
    className: "text-visitor",
    swatchClassName: "bg-visitor",
  },
];

const TEXT_SIZES = [8, 12, 14, 16, 24, 32, 40, 64];

function fontClass(font?: TextFont) {
  return TEXT_FONTS.find((f) => f.value === font)?.className;
}

function resolvedColor({ font, color }: TextStyle): TextColor {
  return color ?? (font === "mono" ? "muted" : "ink");
}

function colorOption(style: TextStyle) {
  const value = resolvedColor(style);
  return TEXT_COLORS.find((c) => c.value === value) ?? TEXT_COLORS[0];
}

function fontSizeStyle(fontSize?: number) {
  return fontSize ? { fontSize: `${fontSize}pt` } : undefined;
}

function textStyleProps(style: TextStyle) {
  return {
    className: cn(fontClass(style.font), colorOption(style).className),
    style: fontSizeStyle(style.fontSize),
  };
}

export { TEXT_FONTS, TEXT_COLORS, TEXT_SIZES, colorOption, textStyleProps };
