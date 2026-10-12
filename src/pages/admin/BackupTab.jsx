import { useState } from "react";
import { Download } from "lucide-react";
import { useAdmin } from "../../lib/admin.jsx";
import { FILES, getJson } from "../../lib/github.js";

export default function BackupTab() {
  const { token } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const download = async () => {
    setBusy(true);
    setErr("");
    try {
      const out = { exportedAt: new Date().toISOString() };
      for (const [k, path] of Object.entries(FILES)) out[k] = (await getJson(token, path)).data;
      const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `yanai3d-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
        הורדת כל נתוני האתר (מוצרים, צבעים, שאלות נפוצות והגדרות) לקובץ אחד במחשב. כדאי לעשות את זה מדי פעם ולשמור את הקובץ.
      </p>
      <button
        onClick={download}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl py-3 font-bold disabled:opacity-40"
      >
        <Download className="w-4 h-4" /> {busy ? "מכין גיבוי..." : "הורד גיבוי"}
      </button>
      {err && <p className="text-xs text-red-600 mt-2">{err}</p>}

      <div className="mt-8 text-sm text-slate-600 leading-relaxed rounded-xl bg-slate-50 ring-1 ring-slate-100 p-4">
        <p className="font-bold mb-1">ביטול שינוי שנעשה בטעות</p>
        <p>
          כל שמירה נרשמת ב-GitHub בהיסטוריה. כדי לחזור לגרסה קודמת: ב-GitHub היכנס לקובץ הרלוונטי בתיקייה
          <span dir="ltr"> src/data</span>, לחץ על History, ובחר Revert בשינוי הלא רצוי.
        </p>
      </div>
    </div>
  );
}
