import type { Size } from "@/lib/camera";
import { DRIVE_VERSION, type ChapterTracks, type DriveUpload } from "./types";

type RecordedChapter = ChapterTracks & { blob: Blob };
type DriveSaveResult = { ok: boolean; ffmpeg: boolean };

function tracksOf(chapter: RecordedChapter): ChapterTracks {
  const { id, title, duration, camera, pointer, events } = chapter;
  return { id, title, duration, camera, pointer, events };
}

async function saveDrive(
  viewport: Size,
  chapters: RecordedChapter[],
): Promise<DriveSaveResult> {
  const upload: DriveUpload = {
    version: DRIVE_VERSION,
    viewport,
    chapters: chapters.map(tracksOf),
  };
  const body = new FormData();
  body.append("manifest", JSON.stringify(upload));
  chapters.forEach((chapter, i) => body.append(`audio-${i}`, chapter.blob));

  const response = await fetch("/api/drive", { method: "POST", body });
  if (!response.ok) return { ok: false, ffmpeg: false };
  const { ffmpeg } = (await response.json()) as { ffmpeg: boolean };
  return { ok: true, ffmpeg };
}

export { saveDrive };
export type { RecordedChapter };
