// עדכון קובץ הצבעים ישירות ב-GitHub מתוך מסך המנהל.
// "הסיסמה" של המנהל היא טוקן אישי של GitHub שנשמר רק בדפדפן של המנהל (לא בקוד).
export const REPO = { owner: "lezyanai-lab", repo: "yanai-3d", branch: "main" };
export const COLORS_PATH = "src/data/colors.json";

const API = "https://api.github.com";

const headers = (token) => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
});

// קידוד/פענוח UTF-8 (עברית) ל-base64
const enc = (s) => btoa(unescape(encodeURIComponent(s)));
const dec = (b) => decodeURIComponent(escape(atob(b.replace(/\n/g, ""))));

export async function verifyToken(token) {
  try {
    const res = await fetch(`${API}/repos/${REPO.owner}/${REPO.repo}`, {
      headers: headers(token),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getColorsFile(token) {
  const res = await fetch(
    `${API}/repos/${REPO.owner}/${REPO.repo}/contents/${COLORS_PATH}?ref=${REPO.branch}`,
    { headers: headers(token), cache: "no-store" }
  );
  if (!res.ok) throw new Error(`טעינת הצבעים נכשלה (${res.status})`);
  const json = await res.json();
  return { sha: json.sha, colors: JSON.parse(dec(json.content)) };
}

async function put(token, colors, sha) {
  return fetch(`${API}/repos/${REPO.owner}/${REPO.repo}/contents/${COLORS_PATH}`, {
    method: "PUT",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "עדכון צבעים ממסך המנהל",
      content: enc(JSON.stringify(colors, null, 2) + "\n"),
      sha,
      branch: REPO.branch,
    }),
  });
}

export async function saveColors(token, colors, sha) {
  let res = await put(token, colors, sha);
  if (res.status === 409 || res.status === 422) {
    // הקובץ השתנה בינתיים - מושכים sha עדכני ומנסים שוב פעם אחת
    const fresh = await getColorsFile(token);
    res = await put(token, colors, fresh.sha);
  }
  if (res.status === 401 || res.status === 403 || res.status === 404) {
    throw new Error("אין לטוקן הרשאת כתיבה ל-repo (נדרש Contents: Read and write)");
  }
  if (!res.ok) throw new Error(`השמירה נכשלה (${res.status})`);
  const json = await res.json();
  return json.content.sha;
}
