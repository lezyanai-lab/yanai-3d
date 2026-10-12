import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { FILES } from "../../lib/github.js";
import { useRepoJson } from "../../lib/useRepoJson.js";
import { img } from "../../lib/config.js";
import { DEFAULT_LABELS } from "../../data/products.js";
import { Field, ImageUpload, SaveBar, Spinner, inputCls } from "./ui.jsx";

const emptyProduct = () => ({
  id: `p${Date.now()}`,
  name: "",
  price: 0,
  priceText: "",
  desc: "",
  img: "",
  colors: 1,
  colorLabels: [],
  link: "",
  specialOffer: null,
  hidden: false,
  textPricing: null,
  partPricing: null,
});

function validate(list) {
  for (const p of list) {
    const label = p.name.trim() || "דגם חדש";
    if (!p.name.trim()) return "לכל דגם חייב להיות שם";
    if (!(Number(p.price) > 0)) return `"${label}": צריך להזין מחיר גדול מ-0`;
    if (p.colors > 0 && Array.from({ length: p.colors }, (_, i) => p.colorLabels[i] ?? "").some((l) => !l.trim())) {
      return `"${label}": חסר שם לאחד הצבעים`;
    }
    if (p.specialOffer && !(p.specialOffer.packSize >= 2 && p.specialOffer.packPrice > 0))
      return `"${label}": במבצע חבילה צריך כמות של 2 ומעלה ומחיר גדול מ-0`;
    if (p.textPricing && !(Number(p.textPricing.perChar) >= 0))
      return `"${label}": מחיר לכל תו חייב להיות 0 ומעלה`;
    if (p.partPricing && !(Number(p.partPricing.unitPrice) > 0))
      return `"${label}": מחיר לחלק חייב להיות גדול מ-0`;
  }
  return "";
}

export default function ProductsTab({ openId }) {
  const r = useRepoJson(FILES.products, "עדכון מוצרים ממסך המנהל");
  const [open, setOpen] = useState(openId || "");
  useEffect(() => {
    if (openId) setOpen(openId);
  }, [openId]);

  if (r.loading) return <Spinner />;
  if (!r.data) return <p className="text-sm text-red-600 pt-6">{r.error}</p>;
  const list = r.data;

  const update = (id, patch) => r.setData((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const remove = (id) => {
    if (window.confirm("האם למחוק דגם זה?")) r.setData((p) => p.filter((x) => x.id !== id));
  };
  const move = (i, d) =>
    r.setData((p) => {
      const j = i + d;
      if (j < 0 || j >= p.length) return p;
      const n = [...p];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  const add = () => {
    const np = emptyProduct();
    r.setData((p) => [np, ...p]);
    setOpen(np.id);
  };

  const clean = () =>
    list.map((p) => ({
      ...p,
      name: p.name.trim(),
      price: Number(p.price),
      priceText: p.priceText.trim(),
      desc: p.desc,
      link: p.link.trim(),
      colorLabels: p.colors > 0 ? Array.from({ length: p.colors }, (_, i) => (p.colorLabels[i] ?? "").trim()) : [],
      textPricing: p.textPricing && p.textPricing.kind === "perChar"
        ? {
            kind: "perChar",
            included: Number(p.textPricing.included || 0),
            perChar: Number(p.textPricing.perChar || 0),
            maxChars: Number(p.textPricing.maxChars || 20),
          }
        : null,
      partPricing: p.partPricing && p.partPricing.kind === "parts"
        ? {
            kind: "parts",
            unitPrice: Number(p.partPricing.unitPrice || 0),
            min: Number(p.partPricing.min || 1),
            defaultQty: Number(p.partPricing.defaultQty || p.partPricing.min || 1),
            label: p.partPricing.label || "מספר חלקים",
          }
        : null,
      specialOffer: p.specialOffer
        ? { packSize: Number(p.specialOffer.packSize), packPrice: Number(p.specialOffer.packPrice) }
        : null,
    }));

  return (
    <div className="pb-32">
      <p className="text-sm text-slate-500 mb-3">
        הדגם הראשון ברשימה מוצג ראשון באתר. דגם מוסתר לא מופיע ללקוחות.
      </p>
      <button
        onClick={add}
        className="mb-3 w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl py-2.5 text-sm font-bold"
      >
        <Plus className="w-4 h-4" /> דגם חדש
      </button>

      <div className="space-y-2">
        {list.map((p, i) => {
          const isOpen = open === p.id;
          return (
            <div key={p.id} className={`rounded-xl ring-1 ${isOpen ? "ring-slate-300" : "ring-slate-100"}`}>
              <div className="flex items-center gap-3 p-2">
                <div className="w-12 h-12 rounded-lg bg-slate-50 overflow-hidden shrink-0">
                  {p.img && <img src={img(p.img)} alt="" className={`w-full h-full object-cover ${p.hidden ? "opacity-40" : ""}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${p.hidden ? "text-slate-400" : ""}`}>{p.name || "דגם חדש"}</p>
                  <p className="text-xs text-slate-500">
                    ₪{p.priceText || p.price}
                    {p.hidden && " · מוסתר"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="למעלה" className="disabled:opacity-20">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label="למטה" className="disabled:opacity-20">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => update(p.id, { hidden: !p.hidden })} aria-label={p.hidden ? "הצג" : "הסתר"}>
                    {p.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setOpen(isOpen ? "" : p.id)} aria-label="עריכה" data-testid={`edit-${p.id}`}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(p.id)} aria-label="מחק">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-slate-100 p-3">
                  <Field label="שם הדגם *">
                    <input value={p.name} onChange={(e) => update(p.id, { name: e.target.value })} className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="מחיר (₪) *">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={p.price === 0 ? "" : p.price}
                        onChange={(e) => update(p.id, { price: e.target.value === "" ? 0 : Number(e.target.value) })}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="טקסט מחיר להצגה" hint='אופציונלי, למשל "4-10"'>
                      <input value={p.priceText} onChange={(e) => update(p.id, { priceText: e.target.value })} className={inputCls} />
                    </Field>
                  </div>
                  <Field label="תיאור">
                    <textarea value={p.desc} onChange={(e) => update(p.id, { desc: e.target.value })} rows={4} className={inputCls} />
                  </Field>
                  <Field label="קישור (MakerWorld)" hint="מוצג רק למנהל, עם כפתורי פתיחה והעתקה.">
                    <input dir="ltr" value={p.link} onChange={(e) => update(p.id, { link: e.target.value })} className={`${inputCls} text-left`} />
                  </Field>

                  <Field label="תמונת הדגם">
                    <ImageUpload value={p.img} prefix="p" onChange={(v) => update(p.id, { img: v })} />
                  </Field>

                  <Field label="אפשרויות צבע">
                    <select
                      value={p.colors}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        update(p.id, { colors: n, colorLabels: n > 0 ? (p.colorLabels.length === n ? p.colorLabels : Array.from({ length: n }, (_, i) => p.colorLabels[i] || "")) : [] });
                      }}
                      className={inputCls}
                    >
                      <option value={0}>ללא צבעים</option>
                      <option value={1}>צבע אחד</option>
                      <option value={2}>שני צבעים + טקסט אישי</option>
                      <option value={3}>שלושה צבעים</option>
                    </select>
                  </Field>

                  {p.colors > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: p.colors }, (_, k) => (
                        <Field key={k} label={p.colors === 2 ? `שם צבע ${k + 1}` : `צבע ${k + 1}`}>
                          <input
                            value={p.colorLabels[k] ?? ""}
                            onChange={(e) => {
                              const l = [...(p.colorLabels || [])];
                              l[k] = e.target.value;
                              update(p.id, { colorLabels: l });
                            }}
                            className={inputCls}
                          />
                        </Field>
                      ))}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                      <input
                        type="checkbox"
                        checked={!!p.specialOffer}
                        onChange={(e) => update(p.id, { specialOffer: e.target.checked ? { packSize: 2, packPrice: 0 } : null })}
                      />
                      מבצע חבילה
                    </label>
                    {p.specialOffer && (
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="כמות בחבילה">
                          <input
                            type="number"
                            min="2"
                            value={p.specialOffer.packSize}
                            onChange={(e) => update(p.id, { specialOffer: { ...p.specialOffer, packSize: Number(e.target.value) } })}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="מחיר החבילה (₪)">
                          <input
                            type="number"
                            min="0"
                            value={p.specialOffer.packPrice || ""}
                            onChange={(e) => update(p.id, { specialOffer: { ...p.specialOffer, packPrice: Number(e.target.value) } })}
                            className={inputCls}
                          />
                        </Field>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                      <input
                        type="checkbox"
                        checked={!!p.textPricing}
                        onChange={(e) => update(p.id, { textPricing: e.target.checked ? { kind: "perChar", included: 0, perChar: 1, maxChars: 20 } : null })}
                      />
                      מחיר לפי מספר תווים
                    </label>
                    {p.textPricing && (
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="כולל תווים">
                          <input
                            type="number"
                            min="0"
                            value={p.textPricing.included}
                            onChange={(e) => update(p.id, { textPricing: { ...p.textPricing, included: Number(e.target.value) } })}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="לכל תו נוסף (₪)">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={p.textPricing.perChar}
                            onChange={(e) => update(p.id, { textPricing: { ...p.textPricing, perChar: Number(e.target.value) } })}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="מקס׳ תווים">
                          <input
                            type="number"
                            min="1"
                            value={p.textPricing.maxChars}
                            onChange={(e) => update(p.id, { textPricing: { ...p.textPricing, maxChars: Number(e.target.value) } })}
                            className={inputCls}
                          />
                        </Field>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                      <input
                        type="checkbox"
                        checked={!!p.partPricing}
                        onChange={(e) => update(p.id, { partPricing: e.target.checked ? { kind: "parts", unitPrice: 1, min: 1, defaultQty: 1, label: "מספר חלקים" } : null })}
                      />
                      מחיר לפי מספר חלקים
                    </label>
                    {p.partPricing && (
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="מחיר לחלק (₪)">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={p.partPricing.unitPrice}
                            onChange={(e) => update(p.id, { partPricing: { ...p.partPricing, unitPrice: Number(e.target.value) } })}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="שם השדה">
                          <input
                            value={p.partPricing.label}
                            onChange={(e) => update(p.id, { partPricing: { ...p.partPricing, label: e.target.value } })}
                            className={inputCls}
                          />
                        </Field>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {list.length === 0 && <p className="text-center text-slate-400 py-6">אין דגמים עדיין</p>}
      </div>

      <SaveBar
        dirty={r.dirty}
        problem={validate(list)}
        error={r.error}
        saved={r.saved}
        saving={r.saving}
        onSave={() => r.save(clean())}
      />
    </div>
  );
}
