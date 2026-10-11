// מוריד את כל התמונות וקבצי ה-3MF מהאתר הישן. הרצה: node download.mjs (Node 18+)
import fs from "node:fs/promises";

const A = "https://base44.app/api/apps/6a4e30a5ffc5a61c564ea3bd/files/mp/public/6a4e30a5ffc5a61c564ea3bd/";
const M = "https://media.base44.com/images/public/6a4e30a5ffc5a61c564ea3bd/";

// סדר זהה לסדר המוצרים באתר (1..33)
const images = [
  [A, "a3dc24a99_1000195844.jpg"], [A, "b92481c40_1000193044.jpg"], [A, "07eeb5b89_1000186215.jpg"],
  [A, "50d93e98d_1000182167.jpg"], [A, "9091b0a0a_1000186223.png"], [A, "6747eedaf_1000177043.jpg"],
  [A, "da0b30645_1000177037.jpg"], [A, "5fdfc9f25_1000177031.jpg"], [A, "2f88b19d9_1000177028.png"],
  [M, "cfd4ec7fc_.jpg"], [M, "814757f44_.jpg"], [M, "a3ef5ce04_.jpg"], [M, "c8a86ca5d_9.jpg"],
  [M, "5688ba610_.jpg"], [M, "698448e79_.jpg"], [M, "d37f719ff_.jpeg"], [M, "9c6831d0e_.jpeg"],
  [M, "1ba37bde2_.jpeg"], [M, "aad7c4028_.jpg"], [M, "a3c208038_.jpeg"], [M, "915b43ddc_.jpeg"],
  [M, "9ee7d894e_.jpg"], [M, "4f6a41ca7_.jpg"], [M, "6863fa2fe_.jpg"], [M, "23376bf54_.jpg"],
  [M, "b41b3781c_2.jpg"], [A, "9a489f4d8_1000177063.jpg"], [M, "b04377e7c_.jpg"], [M, "c11c90e24_.jpg"],
  [M, "593cc4448_.jpg"], [M, "ae5680bea_.jpeg"], [A, "ff02fc67e_WhatsAppImage2026-07-30at0913001.jpeg"],
  [A, "4faa43728_2.png"],
];

const extras = [
  [M + "0ae17e0b4_WhatsAppImage2026-07-13at151546.jpg", "logo.jpg"],
  [M + "e1d3b9755_image.png", "bit-logo.png"],
  [M + "aad12bf45_WhatsAppImage2026-07-13at144019.jpeg", "bit-qr.jpeg"],
];

const files3mf = [
  "639dd2223_gravity_knife.3mf", "da8aa57bf_PentaClick_v2_dual_color.3mf", "233f647ad_Twisty_Mini_Tighter_Tol.3mf",
  "058c9e895_BubblePopper2x2.3mf", "75b689402_TriPopit_v2_PROJ.3mf", "5d9f7d32c_Singlecolor-noAMS.3mf",
  "867014bed_ToothbrushV36x2mm.3mf", "fe24b5fd7_InfinityCubeFidget5.3mf",
  "5ace0e4fd_infinite_hexagon_fidget_v20_triangles.3mf", "f9ebb9735_FoldingEquillateralTriangleFidgetChain-20.3mf",
  "e03b5143a_HexFidgetSmall.3mf", "a14da8cbc_origami-transforming-cube-S-2color.3mf",
  "e73fec0cc_CuteEggNoFace.3mf", "f9fe5babc_SkullbrainclickerOnePlatePBO.3mf", "864daf305_FidgetPaws_Profile.3mf",
  "c3e767d46_piston.3mf", "eb1fb166f_grassblockclickeramsbyobject.3mf", "c32a53755_Minecraft_TNT_clicker_NoAMS.3mf",
  "86deabd85_NOFACEKEYCHAINV.3mf", "2457e5a39_.3mf", "6394faee3_glindacrown_Silk.3mf",
  "a063da3bd_CHOCOLATE3CLICK.3mf", "70515ea50_lowpolyheartkeychain.3mf",
];

await fs.mkdir("public/images", { recursive: true });
await fs.mkdir("backup-3mf", { recursive: true });

async function get(url, dest) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
    console.log("OK  ", dest);
  } catch (e) {
    console.log("FAIL", dest, e.message);
  }
}

const jobs = [];
images.forEach(([prefix, suffix], i) => {
  const ext = suffix.split(".").pop();
  const n = String(i + 1).padStart(2, "0");
  jobs.push(get(prefix + suffix, `public/images/${n}.${ext}`));
});
extras.forEach(([url, name]) => jobs.push(get(url, `public/images/${name}`)));
files3mf.forEach((s) => jobs.push(get(A + s, `backup-3mf/${s}`)));
await Promise.all(jobs);
console.log("סיימתי. בדוק שאין שורות FAIL.");
