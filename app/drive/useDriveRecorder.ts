import { useEffect, useRef, useState } from "react";
import type { Camera } from "@/app/elements/types";
import { screenToWorld, windowSize, type Size } from "@/lib/camera";
import { recordAudio, type AudioRecording } from "./recordAudio";
import { saveDrive, type RecordedChapter } from "./save";
import type { CameraKeyframe, PointerKeyframe } from "./types";

const HOLD_GAP_SECONDS = 0.25;
const HOLD_LEAD_SECONDS = 0.016;

type RecorderStatus =
  | "idle"
  | "recording"
  | "paused"
  | "saving"
  | "saved"
  | "saved-webm-only"
  | "error";

type ActiveChapter = {
  start: number;
  camera: CameraKeyframe[];
  pointer: PointerKeyframe[];
};

const round = (value: number, digits: number) => {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
};

function useDriveRecorder(camera: Camera) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [chapterCount, setChapterCount] = useState(0);
  const cameraRef = useRef(camera);
  const stream = useRef<MediaStream | null>(null);
  const audio = useRef<AudioRecording | null>(null);
  const viewport = useRef<Size>({ width: 0, height: 0 });
  const chapters = useRef<RecordedChapter[]>([]);
  const active = useRef<ActiveChapter | null>(null);

  const elapsed = (chapter: ActiveChapter) =>
    (performance.now() - chapter.start) / 1000;

  const cameraFrame = (t: number, c: Camera): CameraKeyframe => ({
    t: round(t, 3),
    x: round(c.x, 1),
    y: round(c.y, 1),
    zoom: round(c.zoom, 4),
  });

  useEffect(() => {
    cameraRef.current = camera;
    const chapter = active.current;
    if (!chapter) return;
    const t = elapsed(chapter);
    const frames = chapter.camera;
    const last = frames[frames.length - 1];
    if (last && t - last.t > HOLD_GAP_SECONDS) {
      frames.push({ ...last, t: round(t - HOLD_LEAD_SECONDS, 3) });
    }
    frames.push(cameraFrame(t, camera));
  }, [camera]);

  useEffect(() => {
    if (status !== "recording") return;
    let frame: number | null = null;
    let pending: { x: number; y: number } | null = null;
    const flush = () => {
      frame = null;
      const chapter = active.current;
      if (!chapter || !pending) return;
      const world = screenToWorld(cameraRef.current, pending, windowSize());
      chapter.pointer.push({
        t: round(elapsed(chapter), 3),
        x: round(world.x, 1),
        y: round(world.y, 1),
      });
    };
    const onMove = (e: PointerEvent) => {
      pending = { x: e.clientX, y: e.clientY };
      if (frame == null) frame = requestAnimationFrame(flush);
    };
    window.addEventListener("pointermove", onMove, { capture: true });
    return () => {
      window.removeEventListener("pointermove", onMove, { capture: true });
      if (frame != null) cancelAnimationFrame(frame);
    };
  }, [status]);

  const beginChapter = () => {
    if (!stream.current) return;
    audio.current = recordAudio(stream.current);
    active.current = {
      start: performance.now(),
      camera: [cameraFrame(0, cameraRef.current)],
      pointer: [],
    };
    setStatus("recording");
  };

  const endChapter = async () => {
    const chapter = active.current;
    const recording = audio.current;
    if (!chapter || !recording) return;
    active.current = null;
    audio.current = null;
    const duration = round(elapsed(chapter), 3);
    const blob = await recording.stop();
    const index = chapters.current.length + 1;
    const fallback = `Chapter ${index}`;
    const title = window.prompt("Chapter title", fallback)?.trim() || fallback;
    chapters.current.push({
      id: crypto.randomUUID(),
      title,
      duration,
      camera: chapter.camera,
      pointer: chapter.pointer,
      events: [],
      blob,
    });
    setChapterCount(chapters.current.length);
  };

  const start = async () => {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    } catch {
      setStatus("error");
      return;
    }
    chapters.current = [];
    setChapterCount(0);
    viewport.current = windowSize();
    beginChapter();
  };

  const pause = async () => {
    await endChapter();
    setStatus("paused");
  };

  const resume = () => beginChapter();

  const done = async () => {
    await endChapter();
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (chapters.current.length === 0) {
      setStatus("idle");
      return;
    }
    setStatus("saving");
    const result = await saveDrive(viewport.current, chapters.current);
    if (!result.ok) setStatus("error");
    else setStatus(result.ffmpeg ? "saved" : "saved-webm-only");
  };

  return { status, chapterCount, start, pause, resume, done };
}

export { useDriveRecorder };
export type { RecorderStatus };
