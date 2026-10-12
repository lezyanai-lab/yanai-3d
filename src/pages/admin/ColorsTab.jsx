import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { FILES } from "../../lib/github.js";
import { useRepoJson } from "../../lib/useRepoJson.js";
import { SaveBar, Spinner, inputCls } from "./ui.jsx";

const HEX = /^#[0-9a-fA-F]{6}$/;

export default function ColorsTab() {
  const r = useRepoJson(FILES.colors, "עדכון צבעים ממסך המנהל");
  if (r.loading) return <Spinner />;
  if (!r.data) return <p className="text-sm text-red-600 pt-6">{r.error}</p>;
  const colors = r.data;

  const update = (i, patch) => r.setData((p) => p.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const remove = (i) => r.setData((p) => p.filter((_, idx) => idx !== i));
  const move = (i, d) =>
    r.setData((p) => {
      const j = i + d;
      if (j < 0 || j >= p.length) return p;
      const n = [...p];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  const add = () => r.setData((p) => [...p, { name: "", hex: "#888888", inStock: true }]);

  const names = colors.map((c) => c.name.trim());
  const problem = colors.some((c) => !c.name.trim())
    ? "לכל צבע חייב להיות שם"
    : colors.some((c) => !HEX.test(c.hex))
    ? "קוד צבע חייב להיות בפורמט #RRGGBB"
    : new Set(names).size !== names.length
    ? "יש שני צבעים עם אותו שם"
    : "";

  return (
    <div className="pb-32">
      <p className="text-sm text-slate-500 mb-4">
        שנה גוון, הוסף צבע חדש או סמן "אזל מהמלאי". הצבעים מופיעים בעמוד הראשי ובבחירת הצבע של הלקוח.
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
                className={`${inputCls} mb-1 !py-1`}
              />
              <div className="flex items-center gap-2">
                <input
                  dir="ltr"
                  value={c.hex}
                  onChange={(e) => update(i, { hex: e.target.value })}
                  className={`w-24 border rounded-lg px-2 py-1 text-xs text-left ${HEX.test(c.hex) ? "border-slate-200" : "border-red-400"}`}
                />
                <label className="flex items-center gap-1 text-xs text-slate-600">
                  <input type="checkbox" checked={!!c.inStock} onChange={(e) => update(i, { inStock: e.target.checked })} />
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
      <SaveBar
        dirty={r.dirty}
        problem={problem}
        error={r.error}
        saved={r.saved}
        saving={r.saving}
        onSave={() => r.save(colors.map((c) => ({ name: c.name.trim(), hex: c.hex, inStock: !!c.inStock })))}
      />
    </div>
  );
}
