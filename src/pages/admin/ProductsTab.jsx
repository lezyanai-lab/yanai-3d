import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { FILES } from "../../lib/github.js";
import { useRepoJson } from "../../lib/useRepoJson.js";
import { img } from "../../lib/config.js";
import { previewOf } from "../../lib/image.js";
import { DEFAULT_TEXT, colorCount, colorLabelsOf } from "../../lib/product.js";
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
});

function validate(list) {
  for (const p of list) {
    const label = p.name.trim() || "דגם חדש";
    if (!p.name.trim()) return "לכל דגם חייב להיות שם";
    const noPrice = p.pricing?.type === "quote" || p.pricing?.type === "perChar";
    if (!noPrice && !(Number(p.price) > 0)) return `"${label}": צריך להזין מחיר גדול מ-0`;
    if (colorCount(p) > 1 && colorLabelsOf(p).some((l) => !String(l).trim())) return `"${label}": חסר שם לאחד הצבעים`;
    if (p.pricing?.type === "perChar" && !p.textField) return `"${label}": תמחור לפי תווים דורש שדה טקסט`;
    if (p.specialOffer && !(p.specialOffer.packSize >= 2 && p.specialOffer.packPrice > 0))
      return `"${label}": במבצע חבילה צריך כמות של 2 ומעלה ומחיר גדול מ-0`;
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
      colors: colorCount(p),
      colorLabels: colorLabelsOf(p).map((l) => String(l).trim()),
      textField: p.textField ? { ...DEFAULT_TEXT, ...p.textField, maxChars: Number(p.textField.maxChars) || 20 } : null,
      pricing:
        p.pricing?.type === "perChar"
          ? { type: "perChar", included: Number(p.pricing.included) || 0, extra: Number(p.pricing.extra) || 0 }
          : p.pricing?.type === "quote"
          ? { type: "quote" }
          : { type: "fixed" },
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
                  {p.img && <img src={previewOf(p.img) || img(p.img)} alt="" className={`w-full h-full object-cover ${p.hidden ? "opacity-40" : ""}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${p.hidden ? "text-slate-400" : ""}`}>{p.name || "דגם חדש"}</p>
                  <p className="text-xs text-slate-500">
                    {p.pricing?.type === "perChar" ? `₪${p.pricing.extra} לתו` : p.pricing?.type === "quote" ? "ייקבע בפרטי" : `₪${p.priceText || p.price}`}
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

                  <Field label="כמה צבעים הלקוח בוחר" hint="0 = אין בחירת צבע (לדגם עם צבע קבוע)">
                    <select
                      value={colorCount(p)}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        update(p.id, { colors: n, colorLabels: Array.from({ length: n }, (_, i) => p.colorLabels?.[i] || "") });
                      }}
                      className={inputCls}
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n === 0 ? "0 - ללא בחירת צבע" : n === 1 ? "צבע אחד" : `${n} צבעים`}</option>
                      ))}
                    </select>
                  </Field>
                  {colorCount(p) > 1 && (
                    <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: colorCount(p) }).map((_, k) => (
                        <Field key={k} label={`שם צבע ${k + 1}`}>
                          <input
                            value={p.colorLabels?.[k] ?? colorLabelsOf(p)[k]}
                            onChange={(e) => {
                              const l = Array.from({ length: colorCount(p) }, (_, i) => p.colorLabels?.[i] ?? colorLabelsOf(p)[i]);
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
                        checked={!!p.textField}
                        onChange={(e) => update(p.id, { textField: e.target.checked ? { ...DEFAULT_TEXT } : null, ...(e.target.checked ? {} : { pricing: { type: p.pricing?.type === "quote" ? "quote" : "fixed" } }) })}
                      />
                      שדה טקסט ללקוח (שם, אותיות, מספר חלק...)
                    </label>
                    {p.textField && (
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="כותרת השדה">
                          <input value={p.textField.label} onChange={(e) => update(p.id, { textField: { ...p.textField, label: e.target.value } })} className={inputCls} />
                        </Field>
                        <Field label="טקסט לדוגמה">
                          <input value={p.textField.placeholder} onChange={(e) => update(p.id, { textField: { ...p.textField, placeholder: e.target.value } })} className={inputCls} />
                        </Field>
                        <Field label="מקסימום תווים">
                          <input type="number" min="1" value={p.textField.maxChars} onChange={(e) => update(p.id, { textField: { ...p.textField, maxChars: Number(e.target.value) } })} className={inputCls} />
                        </Field>
                        <label className="flex items-center gap-2 text-sm mt-6">
                          <input type="checkbox" checked={!!p.textField.required} onChange={(e) => update(p.id, { textField: { ...p.textField, required: e.target.checked } })} />
                          חובה למלא
                        </label>
                      </div>
                    )}
                  </div>

                  <Field label="סוג תמחור">
                    <select
                      value={p.pricing?.type || "fixed"}
                      onChange={(e) => {
                        const t = e.target.value;
                        update(p.id, {
                          pricing: t === "perChar" ? { type: "perChar", included: p.pricing?.included ?? 0, extra: p.pricing?.extra ?? 1 } : { type: t },
                          ...(t !== "fixed" && !p.textField ? { textField: { ...DEFAULT_TEXT } } : {}),
                        });
                      }}
                      className={inputCls}
                    >
                      <option value="fixed">מחיר קבוע</option>
                      <option value="perChar">לפי מספר תווים (אוטומטי)</option>
                      <option value="quote">המחיר ייקבע בפרטי (לא מוצג ללקוח)</option>
                    </select>
                  </Field>
                  {p.pricing?.type === "perChar" && (
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="תווים שכלולים במחיר הבסיס" hint="0 = כל תו עולה">
                        <input type="number" min="0" value={p.pricing.included} onChange={(e) => update(p.id, { pricing: { ...p.pricing, included: Number(e.target.value) } })} className={inputCls} />
                      </Field>
                      <Field label="מחיר לכל תו נוסף (₪)">
                        <input type="number" min="0" step="0.5" value={p.pricing.extra} onChange={(e) => update(p.id, { pricing: { ...p.pricing, extra: Number(e.target.value) } })} className={inputCls} />
                      </Field>
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
        notice={r.notice}
        onSave={() => r.save(clean())}
      />
    </div>
  );
}
