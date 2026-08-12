import type { PendingAsset } from "./api";

const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const MAX_EDGE = 1920;

export async function prepareProductImage(file: File, slug: string, directory: "products" | "news" | "certificates" = "products"): Promise<PendingAsset> {
  if (!file.type.startsWith("image/")) throw new Error("Choose a JPG, PNG or WebP image.");
  if (file.size > MAX_SOURCE_BYTES) throw new Error("The source image cannot exceed 12 MB.");

  const source = await loadImage(file);
  const ratio = Math.min(1, MAX_EDGE / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * ratio));
  const height = Math.max(1, Math.round(source.height * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("This browser cannot process the image.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(source.image, 0, 0, width, height);
  source.dispose();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("Image conversion failed."))), "image/webp", 0.86);
  });
  const safeSlug = slug.replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") || "product";
  const suffix = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const path = `public/uploads/${directory}/${safeSlug}-${suffix}-${crypto.randomUUID().slice(0, 8)}.webp`;
  return {
    path,
    contentBase64: await blobToBase64(blob),
    previewUrl: URL.createObjectURL(blob),
  };
}

async function loadImage(file: File): Promise<{ image: CanvasImageSource; width: number; height: number; dispose: () => void }> {
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(file);
    return { image: bitmap, width: bitmap.width, height: bitmap.height, dispose: () => bitmap.close() };
  }
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;
  await image.decode();
  return { image, width: image.naturalWidth, height: image.naturalHeight, dispose: () => URL.revokeObjectURL(url) };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read image."));
    reader.readAsDataURL(blob);
  });
}
