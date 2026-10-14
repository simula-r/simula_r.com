const MAX_SIDE = 480;

type UploadedImage = { src: string; width: number; height: number };

function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unreadable image"));
    };
    image.src = url;
  });
}

async function uploadImage(file: File): Promise<UploadedImage | null> {
  const natural = await readImageSize(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(natural.width, natural.height));
  const width = Math.round(natural.width * scale);
  const height = Math.round(natural.height * scale);

  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/upload", { method: "POST", body });
  if (!response.ok) return null;
  const { src } = (await response.json()) as { src: string };
  return { src, width, height };
}

export { uploadImage };
export type { UploadedImage };
