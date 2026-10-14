import type { ComponentType } from "react";

type Camera = { x: number; y: number; zoom: number };

type ElementBase = { id: string; x: number; y: number };
type StickyElementData = ElementBase & { type: "sticky"; text: string };
type TextElementData = ElementBase & { type: "text"; text: string };
type ImageElementData = ElementBase & {
  type: "image";
  src: string;
  width: number;
  height: number;
};
type CanvasElementData = StickyElementData | TextElementData | ImageElementData;

type ElementKind = CanvasElementData["type"];
type ElementOf<K extends ElementKind> = Extract<CanvasElementData, { type: K }>;

type ElementEditorProps<T extends CanvasElementData> = {
  element: T;
  onChange: (patch: Partial<T>) => void;
  onDone: () => void;
};

type ElementDefinition<T extends CanvasElementData> = {
  kind: T["type"];
  label: string;
  editable: boolean;
  Icon: ComponentType;
  Preview: ComponentType;
  Render: ComponentType<{ element: T }>;
  Editor: ComponentType<ElementEditorProps<T>>;
  create: (x: number, y: number) => T;
  fill?: (element: T) => Promise<Partial<T> | null>;
};

export type {
  Camera,
  CanvasElementData,
  StickyElementData,
  TextElementData,
  ImageElementData,
  ElementKind,
  ElementOf,
  ElementDefinition,
};
