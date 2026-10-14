// עזרי מוצר: שדה טקסט, תמחור לפי תווים ומחיר "ייקבע בפרטי"
export const DEFAULT_TEXT = { label: "מה יהיה כתוב על הדגם", placeholder: "הזן טקסט", maxChars: 20, required: true };

export function textFieldOf(m) {
  if (m.textField) return { ...DEFAULT_TEXT, ...m.textField };
  return null;
}

export function pricingOf(m) {
  return m.pricing || { type: "fixed" };
}

// ספירת תווים בלי רווחים
export function countChars(s) {
  return Array.from(String(s || "")).filter((c) => !/\s/.test(c)).length;
}

export function unitPrice(m, text) {
  const p = pricingOf(m);
  if (p.type === "perChar") {
    const extra = Math.max(0, countChars(text) - (Number(p.included) || 0));
    return Number(m.price) + extra * (Number(p.extra) || 0);
  }
  return Number(m.price);
}

export const isQuote = (m) => pricingOf(m).type === "quote";

export function colorCount(m) {
  const n = Number(m.colors);
  return Number.isFinite(n) ? Math.max(0, Math.min(6, n)) : 1;
}

export function colorLabelsOf(m) {
  const n = colorCount(m);
  const given = Array.isArray(m.colorLabels) ? m.colorLabels : [];
  return Array.from({ length: n }, (_, i) => given[i] || (n === 1 ? "צבע" : n === 2 ? ["צבע בסיס", "צבע טקסט"][i] : `צבע ${i + 1}`));
}

const WORDS = { 1: "שקל אחד", 2: "שני שקלים" };
export function rateText(m) {
  const e = Number(pricingOf(m).extra) || 0;
  return WORDS[e] || `${e} שקלים`;
}
export const sortPrice = (m) => (pricingOf(m).type === "perChar" ? Number(pricingOf(m).extra) || 0 : Number(m.price));
