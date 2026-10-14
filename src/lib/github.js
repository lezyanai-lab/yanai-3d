// עדכון קבצי האתר ישירות ב-GitHub מתוך מסך המנהל.
// הטוקן מתקבל מפענוח הקובץ המוצפן (אימייל + סיסמה) ולא נמצא בקוד.
import { ensureIds } from "./merge.js";

export const REPO = { owner: "lezyanai-lab", repo: "yanai-3d", branch: "main" };
// קבצי הנתונים יושבים בתיקייה content (ולא ב-src), כדי שעדכוני קוד לעולם לא ידרסו אותם
export const FILES = {
  products: "content/products.json",
  faq: "content/faq.json",
  colors: "content/colors.json",
  settings: "content/settings.json",
};

const API = "https://api.github.com";
const base = `${API}/repos/${REPO.owner}/${REPO.repo}/contents`;

const headers = (token) => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
});

// קידוד/פענוח UTF-8 (עברית) ל-base64
const enc = (s) => btoa(unescape(encodeURIComponent(s)));
const dec = (b) => decodeURIComponent(escape(atob(b.replace(/\n/g, ""))));

function authError(status) {
  if (status === 401 || status === 403 || status === 404)
    return new Error("אין הרשאת כתיבה ל-GitHub. בדוק שהטוקן עדיין בתוקף ושיש לו Contents: Read and write.");
  return null;
}

export async function getJson(token, path) {
  const res = await fetch(`${base}/${path}?ref=${REPO.branch}`, { headers: headers(token), cache: "no-store" });
  if (!res.ok) throw authError(res.status) || new Error(`הטעינה נכשלה (${res.status})`);
  const json = await res.json();
  return { sha: json.sha, data: ensureIds(JSON.parse(dec(json.content))) };
}

// שמירה עם הגנה: אם הקובץ השתנה בינתיים GitHub דוחה (409/422) ואנחנו לא דורסים בשקט.
// מי שקורא (useRepoJson) טוען את הגרסה העדכנית, ממזג ומנסה שוב.
export async function saveJson(token, path, data, sha, message = "עדכון ממסך המנהל") {
  const res = await fetch(`${base}/${path}`, {
    method: "PUT",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: enc(JSON.stringify(data, null, 2) + "\n"),
      sha,
      branch: REPO.branch,
    }),
  });
  if (res.status === 409 || res.status === 422) {
    const err = new Error("הקובץ עודכן בינתיים ממקום אחר");
    err.code = "conflict";
    throw err;
  }
  if (!res.ok) throw authError(res.status) || new Error(`השמירה נכשלה (${res.status})`);
  return (await res.json()).content.sha;
}

// העלאת קובץ בינארי (תמונה) לנתיב חדש
export async function uploadBinary(token, path, base64, message = "העלאת תמונה ממסך המנהל") {
  const res = await fetch(`${base}/${path}`, {
    method: "PUT",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify({ message, content: base64, branch: REPO.branch }),
  });
  if (!res.ok) throw authError(res.status) || new Error(`העלאת התמונה נכשלה (${res.status})`);
}
