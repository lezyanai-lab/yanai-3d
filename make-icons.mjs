// אופציונלי: יוצר אייקונים לאפליקציה מהלוגו האמיתי (public/images/logo.jpg).
// הרצה: npm install --no-save sharp && node make-icons.mjs
import sharp from "sharp";
import fs from "node:fs/promises";

const src = "public/images/logo.jpg";
await fs.mkdir("public/icons", { recursive: true });

const sizes = [
  [192, "icon-192.png"],
  [512, "icon-512.png"],
  [180, "apple-touch-icon.png"],
];

for (const [size, name] of sizes) {
  // לוגו עגול עם שוליים לבנים כדי שלא ייחתך באייקון "maskable"
  const inner = Math.round(size * 0.8);
  const logo = await sharp(src).resize(inner, inner, { fit: "cover" }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: "#ffffff" } })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(`public/icons/${name}`);
  console.log("OK", name);
}
