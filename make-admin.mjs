// יוצר את קובץ הכניסה של המנהל: content/admin.json
// הרצה (Node 18+): node make-admin.mjs
// האימייל, הסיסמה והטוקן נשארים רק במחשב שלך. לקובץ נכנס רק הטוקן, מוצפן.
import readline from "node:readline/promises";
import fs from "node:fs/promises";
import { stdin as input, stdout as output } from "node:process";

const ITER = 600000;
const REPO = "lezyanai-lab/yanai-3d";
const b64 = (u8) => Buffer.from(u8).toString("base64");

const rl = readline.createInterface({ input, output });
const env = process.env;

async function ask(q, envKey) {
  if (envKey && env[envKey]) return env[envKey];
  return (await rl.question(q)).trim();
}

console.log("\nיצירת כניסת מנהל לאתר\n");
const email = await ask("אימייל שתשתמש בו לכניסה: ", "ADMIN_EMAIL");
const pass1 = await ask("סיסמה (לפחות 12 תווים, לא משהו שקל לנחש): ", "ADMIN_PASSWORD");
const pass2 = env.ADMIN_PASSWORD ? pass1 : await ask("הקלד את הסיסמה שוב: ");
const token = await ask("הדבק כאן את הטוקן של GitHub: ", "ADMIN_TOKEN");
rl.close();

if (!email || !pass1 || !token) {
  console.log("\nחסר אימייל, סיסמה או טוקן. נסה שוב.");
  process.exit(1);
}
if (pass1 !== pass2) {
  console.log("\nהסיסמאות לא זהות. נסה שוב.");
  process.exit(1);
}
if (pass1.length < 12) {
  console.log("\nהסיסמה קצרה מדי. הקובץ יהיה גלוי באינטרנט, ולכן צריך סיסמה ארוכה (12 תווים לפחות).");
  process.exit(1);
}

if (!env.SKIP_CHECK) {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    });
    if (!res.ok) {
      console.log(`\nהטוקן לא התקבל ב-GitHub (קוד ${res.status}). בדוק שהעתקת אותו במלואו ושנתת לו גישה ל-yanai-3d.`);
      process.exit(1);
    }
  } catch {
    console.log("\nלא הצלחתי להתחבר ל-GitHub כדי לבדוק את הטוקן. בדוק את האינטרנט.");
    process.exit(1);
  }
}

const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey(
  "raw",
  enc.encode(`${email.trim().toLowerCase()}\n${pass1}`),
  "PBKDF2",
  false,
  ["deriveKey"]
);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" },
  base,
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt", "decrypt"]
);
const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(token)));

// בדיקה שהפענוח עובד
const back = new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data));
if (back !== token) throw new Error("בדיקת הצפנה נכשלה");

await fs.mkdir("content", { recursive: true });
await fs.writeFile(
  "content/admin.json",
  JSON.stringify({ v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), data: b64(data) }, null, 2) + "\n"
);
console.log("\nהצלחה! נוצר הקובץ content/admin.json");
console.log("עכשיו מעלים את הקובץ content/admin.json ל-GitHub. שמור את האימייל והסיסמה במקום בטוח, אי אפשר לשחזר אותם.");
