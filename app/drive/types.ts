import type { Size } from "@/lib/camera";

const DRIVE_VERSION = 1;

type CameraKeyframe = { t: number; x: number; y: number; zoom: number };
type PointerKeyframe = { t: number; x: number; y: number };

type ChapterTracks = {
  id: string;
  title: string;
  duration: number;
  camera: CameraKeyframe[];
  pointer: PointerKeyframe[];
  events: never[];
};

type ChapterAudio = { webm: string; m4a?: string };
type Chapter = ChapterTracks & { audio: ChapterAudio };

type DriveUpload = {
  version: typeof DRIVE_VERSION;
  viewport: Size;
  chapters: ChapterTracks[];
};

type DriveManifest = {
  version: typeof DRIVE_VERSION;
  viewport: Size;
  chapters: Chapter[];
};

export { DRIVE_VERSION };
export type {
  CameraKeyframe,
  PointerKeyframe,
  ChapterTracks,
  Chapter,
  DriveUpload,
  DriveManifest,
};
