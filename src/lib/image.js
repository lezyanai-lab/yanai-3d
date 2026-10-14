// מקטין תמונה (עד 1200px) ומחזיר base64 להעלאה. PNG נשאר PNG (שקיפות, קודי QR), השאר ל-JPG.
export async function fileToBase64(file, { max = 1200, quality = 0.85 } = {}) {
  let bmp;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    throw new Error("פורמט התמונה לא נתמך. נסה JPG או PNG.");
  }
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const png = file.type === "image/png";
  if (!png) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(bmp, 0, 0, w, h);
  const previewUrl = canvas.toDataURL(png ? "image/png" : "image/jpeg", quality);
  return { base64: previewUrl.split(",")[1], ext: png ? "png" : "jpg", previewUrl };
}

// תצוגה מקדימה של תמונות שהועלו בסשן הזה, כדי שיופיעו במסך המנהל גם לפני שהפריסה באוויר
const previews = new Map();
export const rememberPreview = (name, url) => previews.set(name, url);
export const previewOf = (name) => previews.get(name) || "";
