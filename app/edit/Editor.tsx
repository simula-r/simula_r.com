"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { Canvas } from "@/app/components/Canvas";
import { Sidebar } from "@/app/components/Sidebar";
import { useDriveRecorder } from "@/app/drive/useDriveRecorder";
import { definitionOf } from "@/app/elements/registry";
import { imageElement } from "@/app/elements/image";
import { uploadImage } from "@/app/elements/uploadImage";
import type {
  CanvasElementData,
  ElementDefinition,
  ElementKind,
} from "@/app/elements/types";
import type { Graph } from "@/app/graph/types";
import { screenToWorld, viewportCenterWorld, windowSize } from "@/lib/camera";
import { EditNavigation } from "./EditNavigation";
import { EditorBar } from "./EditorBar";
import { useGraphDraft } from "./useGraphDraft";
import { useSaveGraph } from "./useSaveGraph";

function isTextInput(target: EventTarget | null) {
  return (
    target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement
  );
}

function nextPaint() {
  return new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

function Editor({ initial }: { initial: Graph }) {
  const draft = useGraphDraft(initial);
  const { status: saveStatus, dirty, save } = useSaveGraph(draft.graph);
  const recorder = useDriveRecorder(draft.camera);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const driving =
    recorder.status === "recording" || recorder.status === "paused";

  const createElement = async (
    kind: ElementKind,
    clientX: number,
    clientY: number,
  ) => {
    const { x, y } = screenToWorld(
      draft.camera,
      { x: clientX, y: clientY },
      windowSize(),
    );
    const definition = definitionOf(kind) as unknown as ElementDefinition<CanvasElementData>;
    const element = definition.create(x, y);
    draft.addElement(element);
    if (!definition.fill) return;
    await nextPaint();
    const patch = await definition.fill(element);
    if (patch) draft.updateElement(element.id, patch);
    else draft.removeElements([element.id]);
  };

  const deleteSelected = useEffectEvent(() => {
    if (driving || selectedIds.length === 0) return false;
    draft.removeElements(selectedIds);
    setSelectedIds([]);
    return true;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      if (isTextInput(e.target)) return;
      if (deleteSelected()) e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const pasteImage = useEffectEvent(async (file: File) => {
    const upload = await uploadImage(file);
    if (!upload) return;
    const { x, y } = viewportCenterWorld(draft.camera);
    draft.addElement(imageElement(x, y, upload));
  });

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (isTextInput(e.target)) return;
      const file = Array.from(e.clipboardData?.files ?? []).find((f) =>
        f.type.startsWith("image/"),
      );
      if (!file) return;
      e.preventDefault();
      pasteImage(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  return (
    <div className="w-full h-full relative">
      <Canvas
        mode={driving ? "view" : "edit"}
        camera={draft.camera}
        setCamera={draft.setCamera}
        elements={draft.elements}
        onMoveElements={draft.moveElements}
        onUpdateElement={draft.updateElement}
        selectedIds={selectedIds}
        onSelectElement={setSelectedIds}
      />
      <EditNavigation
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
        disabled={driving}
      />
      {!driving && sidebarOpen && (
        <Sidebar zoom={draft.camera.zoom} onCreate={createElement} />
      )}
      <EditorBar
        saveStatus={saveStatus}
        dirty={dirty}
        onSave={save}
        recorder={recorder}
      />
    </div>
  );
}

export { Editor };
