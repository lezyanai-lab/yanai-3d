import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { FILES } from "../../lib/github.js";
import { useRepoJson } from "../../lib/useRepoJson.js";
import { SaveBar, Spinner, inputCls } from "./ui.jsx";

export default function FaqTab() {
  const r = useRepoJson(FILES.faq, "עדכון שאלות נפוצות ממסך המנהל");
  if (r.loading) return <Spinner />;
  if (!r.data) return <p className="text-sm text-red-600 pt-6">{r.error}</p>;
  const items = r.data;

  const update = (i, patch) => r.setData((p) => p.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const remove = (i) => {
    if (window.confirm("האם למחוק שאלה זו?")) r.setData((p) => p.filter((_, idx) => idx !== i));
  };
  const move = (i, d) =>
    r.setData((p) => {
      const j = i + d;
      if (j < 0 || j >= p.length) return p;
      const n = [...p];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  const add = () => r.setData((p) => [...p, { id: `f${Date.now()}`, q: "", a: "", active: true }]);

  const problem = items.some((x) => !x.q.trim() || !x.a.trim()) ? "לכל שאלה צריכים להיות גם שאלה וגם תשובה" : "";

  return (
    <div className="pb-32">
      <p className="text-sm text-slate-500 mb-4">שאלה שמסומנת כלא פעילה לא תוצג ללקוחות. אפשר להוסיף אימוג'י בתחילת השאלה.</p>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={it.id || i} className="p-3 rounded-xl ring-1 ring-slate-100">
            <input value={it.q} onChange={(e) => update(i, { q: e.target.value })} placeholder="השאלה" className={`${inputCls} mb-2 font-semibold`} />
            <textarea value={it.a} onChange={(e) => update(i, { a: e.target.value })} placeholder="התשובה" rows={3} className={inputCls} />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-1 text-xs text-slate-600">
                <input type="checkbox" checked={it.active !== false} onChange={(e) => update(i, { active: e.target.checked })} />
                פעילה
              </label>
              <div className="flex items-center gap-3">
                <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="למעלה" className="disabled:opacity-20">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="למטה" className="disabled:opacity-20">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button onClick={() => remove(i)} aria-label="מחק" className="text-slate-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-slate-400 py-6">אין שאלות עדיין</p>}
      </div>
      <button
        onClick={add}
        className="mt-3 w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-xl py-2.5 text-sm text-slate-600"
      >
        <Plus className="w-4 h-4" /> הוסף שאלה
      </button>
      <SaveBar
        dirty={r.dirty}
        problem={problem}
        error={r.error}
        saved={r.saved}
        saving={r.saving}
        notice={r.notice}
        onSave={() => r.save(items.map((x) => ({ id: x.id, q: x.q.trim(), a: x.a.trim(), active: x.active !== false })))}
      />
    </div>
  );
}
