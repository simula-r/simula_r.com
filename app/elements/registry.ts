import type {
  CanvasElementData,
  ElementDefinition,
  ElementKind,
  ElementOf,
} from "./types";
import { stickyDefinition } from "./sticky";
import { textDefinition } from "./text";
import { imageDefinition } from "./image";

const registry: { [K in ElementKind]: ElementDefinition<ElementOf<K>> } = {
  sticky: stickyDefinition,
  text: textDefinition,
  image: imageDefinition,
};

const sidebarKinds: ElementKind[] = ["sticky", "text", "image"];

function definitionOf<K extends ElementKind>(kind: K) {
  return registry[kind];
}

function definitionFor(element: CanvasElementData) {
  return registry[element.type] as unknown as ElementDefinition<CanvasElementData>;
}

export { definitionOf, definitionFor, sidebarKinds };
