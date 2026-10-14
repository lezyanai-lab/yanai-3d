// פענוח הטוקן של GitHub באמצעות אימייל + סיסמה (AES-GCM + PBKDF2).
// הקובץ המוצפן (content/admin.json) נוצר במחשב של המנהל באמצעות make-admin.mjs.
const b64d = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function decryptToken(blob, email, password) {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey(
    "raw",
    enc.encode(`${email.trim().toLowerCase()}\n${password}`),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: b64d(blob.salt), iterations: blob.iter, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64d(blob.iv) }, key, b64d(blob.data));
  return new TextDecoder().decode(plain);
}
