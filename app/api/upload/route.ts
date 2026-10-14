import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { devOnly } from "@/lib/devOnly";

const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export const POST = devOnly(async (request) => {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return new Response(null, { status: 400 });
  const extension = EXTENSIONS[file.type];
  if (!extension) return new Response(null, { status: 415 });

  const name = `${crypto.randomUUID()}.${extension}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return Response.json({ src: `/uploads/${name}` });
});
