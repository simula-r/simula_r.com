import type { DriveManifest } from "./types";

async function loadDriveManifest(): Promise<DriveManifest | null> {
  try {
    const response = await fetch("/drive/manifest.json");
    if (!response.ok) return null;
    return (await response.json()) as DriveManifest;
  } catch {
    return null;
  }
}

export { loadDriveManifest };
