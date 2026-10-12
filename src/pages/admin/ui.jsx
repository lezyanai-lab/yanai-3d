import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { useAdmin } from "../../lib/admin.jsx";
import { uploadBinary } from "../../lib/github.js";
import { fileToBase64 } from "../../lib/image.js";
import { img } from "../../lib/config.js";

export const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white";

export function Spinner() {
  return (
    <div className="pt-16 flex justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-semibold text-slate-700 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-400 mt-1">{hint}</span>}
    </label>
  );
}

// פס שמירה קבוע בתחתית המסך
export function SaveBar({ dirty, problem, error, saved, saving, onSave }) {
  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 z-20">
      <div className="max-w-2xl mx-auto p-4">
        {problem && <p className="text-xs text-red-600 mb-2">{problem}</p>}
        {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
        {saved && !dirty && (
          <p className="text-xs text-green-700 mb-2">✅ נשמר! השינוי יופיע באתר בעוד כדקה-שתיים.</p>
        )}
        <button
          onClick={onSave}
          disabled={!dirty || !!problem || saving}
          className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold disabled:opacity-40"
        >
          {saving ? "שומר..." : "שמור שינויים"}
        </button>
      </div>
    </div>
  );
}

// העלאת תמונה ישירות ל-repo (public/images). התמונה מוקטנת אוטומטית.
export function ImageUpload({ value, onChange, prefix = "img" }) {
  const { token } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState("");

  const pick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setBusy(true);
    setErr("");
    try {
      const { base64, ext, previewUrl } = await fileToBase64(f);
      const name = `${prefix}-${Date.now()}.${ext}`;
      await uploadBinary(token, `public/images/${name}`, base64);
      setPreview(previewUrl);
      onChange(name);
    } catch (e2) {
      setErr(e2.message || "ההעלאה נכשלה");
    } finally {
      setBusy(false);
    }
  };

  const src = preview || (value ? img(value) : "");
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 h-20 rounded-xl bg-slate-50 ring-1 ring-slate-100 overflow-hidden flex items-center justify-center shrink-0">
        {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : <Upload className="w-5 h-5 text-slate-300" />}
      </div>
      <div className="flex-1">
        <label className="inline-block text-sm bg-white ring-1 ring-slate-200 rounded-lg px-3 py-1.5 cursor-pointer">
          {busy ? "מעלה..." : value ? "החלף תמונה" : "בחר תמונה"}
          <input type="file" accept="image/*" onChange={pick} disabled={busy} className="hidden" />
        </label>
        {preview && <p className="text-xs text-slate-400 mt-1">התמונה תופיע באתר אחרי השמירה (כדקה-שתיים).</p>}
        {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
      </div>
    </div>
  );
}
