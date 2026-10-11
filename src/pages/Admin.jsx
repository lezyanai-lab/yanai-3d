import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, LogOut, Plus, Trash2 } from "lucide-react";
import TopNav from "../components/TopNav.jsx";
import { useAdmin } from "../lib/admin.jsx";
import { getColorsFile, saveColors } from "../lib/github.js";

const HEX = /^#[0-9a-fA-F]{6}$/;

function Login() {
  const { login } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await login(email, password);
    setBusy(false);
    if (r === "wrong") setError("אימייל או סיסמה שגויים");
    if (r === "missing") setError("כניסת המנהל עדיין לא הוגדרה באתר");
  };

  return (
    <form onSubmit={submit} className="max-w-md mx-auto px-4 pt-6">
      <h1 className="text-xl font-bold mb-4">כניסת מנהל</h1>

      <label className="block text-sm font-semibold mb-1">אימייל</label>
      <input
        type="email"
        dir="ltr"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 text-left"
        autoComplete="username"
      />

      <label className="block text-sm font-semibold mb-1">סיסמה</label>
      <input
        type="password"
        dir="ltr"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 text-left"
        autoComplete="current-password"
      />

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <button
        disabled={busy || !email.trim() || !password}
        className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold disabled:opacity-40"
      >
        {busy ? "בודק..." : "התחבר"}
      </button>
    </form>
  );
}

function ColorsManager() {
  const { token, logout } = useAdmin();
  const [sha, setSha] = useState("");
  const [original, setOriginal] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    getColorsFile(token)
      .then((f) => {
        if (!alive) return;
        setSha(f.sha);
        setOriginal(f.colors);
        setColors(f.colors);
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [token]);

  const update = (i, patch) => {
    setSaved(false);
    setColors((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  };
  const remove = (i) => {
    setSaved(false);
    setColors((prev) => prev.filter((_, idx) => idx !== i));
  };
  const move = (i, d) => {
    setSaved(false);
    setColors((prev) => {
      const j = i + d;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };
  const add = () => {
    setSaved(false);
    setColors((prev) => [...prev, { name: "", hex: "#888888", inStock: true }]);
  };

  const names = colors.map((c) => c.name.trim());
  const problem = colors.some((c) => !c.name.trim())
    ? "לכל צבע חייב להיות שם"
    : colors.some((c) => !HEX.test(c.hex))
    ? "קוד צבע חייב להיות בפורמט #RRGGBB"
    : new Set(names).size !== names.length
    ? "יש שני צבעים עם אותו שם"
    : "";
  const dirty = JSON.stringify(colors) !== JSON.stringify(original);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const clean = colors.map((c) => ({ name: c.name.trim(), hex: c.hex, inStock: !!c.inStock }));
      const newSha = await saveColors(token, clean, sha);
      setSha(newSha);
      setOriginal(clean);
      setColors(clean);
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-32">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold">ניהול צבעים</h1>
        <button onClick={logout} className="flex items-center gap-1 text-xs text-slate-500">
          <LogOut className="w-3.5 h-3.5" /> התנתק
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        שנה גוון, הוסף צבע חדש או סמן "אזל מהמלאי". אחרי השמירה השינוי מופיע באתר תוך כדקה-שתיים.
      </p>

      <div className="space-y-2">
        {colors.map((c, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-xl ring-1 ring-slate-100">
            <input
              type="color"
              value={HEX.test(c.hex) ? c.hex.toLowerCase() : "#888888"}
              onChange={(e) => update(i, { hex: e.target.value })}
              className="w-10 h-10 rounded-lg border border-slate-200 bg-white shrink-0"
              aria-label="בחירת גוון"
            />
            <div className="flex-1 min-w-0">
              <input
                value={c.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="שם הצבע"
                className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm mb-1"
              />
              <div className="flex items-center gap-2">
                <input
                  dir="ltr"
                  value={c.hex}
                  onChange={(e) => update(i, { hex: e.target.value })}
                  className={`w-24 border rounded-lg px-2 py-1 text-xs text-left ${
                    HEX.test(c.hex) ? "border-slate-200" : "border-red-400"
                  }`}
                />
                <label className="flex items-center gap-1 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={!!c.inStock}
                    onChange={(e) => update(i, { inStock: e.target.checked })}
                  />
                  במלאי
                </label>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <button onClick={() => move(i, -1)} aria-label="למעלה" disabled={i === 0} className="disabled:opacity-20">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button onClick={() => move(i, 1)} aria-label="למטה" disabled={i === colors.length - 1} className="disabled:opacity-20">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => remove(i)} aria-label="מחק" className="text-slate-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="mt-3 w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-xl py-2.5 text-sm text-slate-600"
      >
        <Plus className="w-4 h-4" /> הוסף צבע
      </button>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100">
        <div className="max-w-md mx-auto p-4">
          {problem && <p className="text-xs text-red-600 mb-2">{problem}</p>}
          {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
          {saved && !dirty && (
            <p className="text-xs text-green-700 mb-2">✅ נשמר! השינוי יופיע באתר בעוד כדקה-שתיים.</p>
          )}
          <button
            onClick={save}
            disabled={!dirty || !!problem || saving}
            className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold disabled:opacity-40"
          >
            {saving ? "שומר..." : "שמור שינויים"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { isAdmin } = useAdmin();
  return (
    <div className="min-h-screen">
      <TopNav back />
      {isAdmin ? <ColorsManager /> : <Login />}
    </div>
  );
}
