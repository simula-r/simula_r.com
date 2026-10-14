import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { devOnly } from "@/lib/devOnly";
import {
  DRIVE_VERSION,
  type Chapter,
  type DriveManifest,
  type DriveUpload,
} from "@/app/drive/types";

const run = promisify(execFile);

function isDriveUpload(value: unknown): value is DriveUpload {
  if (typeof value !== "object" || value === null) return false;
  const upload = value as Partial<DriveUpload>;
  return upload.version === DRIVE_VERSION && Array.isArray(upload.chapters);
}

async function hasFfmpeg() {
  try {
    await run("ffmpeg", ["-version"]);
    return true;
  } catch {
    return false;
  }
}

async function convertToM4a(webmPath: string, m4aPath: string) {
  try {
    await run("ffmpeg", [
      "-y",
      "-i",
      webmPath,
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      m4aPath,
    ]);
    return true;
  } catch {
    return false;
  }
}

export const POST = devOnly(async (request) => {
  const form = await request.formData();
  const manifestField = form.get("manifest");
  if (typeof manifestField !== "string") {
    return new Response(null, { status: 400 });
  }
  const upload: unknown = JSON.parse(manifestField);
  if (!isDriveUpload(upload)) return new Response(null, { status: 400 });

  const dir = path.join(process.cwd(), "public", "drive");
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const ffmpeg = await hasFfmpeg();

  const chapters: Chapter[] = [];
  for (const [i, tracks] of upload.chapters.entries()) {
    const file = form.get(`audio-${i}`);
    if (!(file instanceof File)) return new Response(null, { status: 400 });
    const base = `chapter-${i + 1}`;
    const webmPath = path.join(dir, `${base}.webm`);
    const m4aPath = path.join(dir, `${base}.m4a`);
    await writeFile(webmPath, Buffer.from(await file.arrayBuffer()));
    const audio: Chapter["audio"] = { webm: `/drive/${base}.webm` };
    if (ffmpeg && (await convertToM4a(webmPath, m4aPath))) {
      audio.m4a = `/drive/${base}.m4a`;
    }
    chapters.push({ ...tracks, audio });
  }

  const manifest: DriveManifest = {
    version: DRIVE_VERSION,
    viewport: upload.viewport,
    chapters,
  };
  await writeFile(
    path.join(dir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return Response.json({ ffmpeg });
});
