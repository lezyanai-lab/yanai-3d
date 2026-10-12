import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Copy, ExternalLink, Pencil } from "lucide-react";
import TopNav from "../components/TopNav.jsx";
import ColorPicker from "../components/ColorPicker.jsx";
import { PRODUCTS, DEFAULT_LABELS } from "../data/products.js";
import { useCart } from "../lib/cart.jsx";
import { useAdmin } from "../lib/admin.jsx";
import { img } from "../lib/config.js";

function getDynamicPrice(model, text = "", partCount = 1) {
  if (!model) return 0;
  const base = Number(model.price || 0);

  if (model.textPricing?.kind === "perChar") {
    const included = Number(model.textPricing.included || 0);
    const extra = Math.max(0, String(text || "").length - included);
    return base + extra * Number(model.textPricing.perChar || 0);
  }

  if (model.partPricing?.kind === "parts") {
    const unitPrice = Number(model.partPricing.unitPrice ?? base);
    const minimum = Math.max(1, Number(model.partPricing.min || 1));
    const qty = Math.max(minimum, Number(partCount || 0));
    return unitPrice * qty;
  }

  return base;
}

export default function ModelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAdmin } = useAdmin();
  const model = PRODUCTS.find((p) => p.id === id);

  const totalColors = Number(model?.colors ?? 1);
  const labels = Array.isArray(model?.colorLabels) && model.colorLabels.length === 2 ? model.colorLabels : DEFAULT_LABELS;
  const needsText = model?.textPricing?.kind === "perChar";
  const needsPartCount = model?.partPricing?.kind === "parts";

  const [selected, setSelected] = useState(() => Array.from({ length: Math.max(0, totalColors) }, () => null));
  const [text, setText] = useState("");
  const [partCount, setPartCount] = useState(() => Math.max(1, Number(model?.partPricing?.defaultQty || model?.partPricing?.min || 1)));
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSelected((prev) =>
      Array.from({ length: Math.max(0, totalColors) }, (_, i) => prev[i] ?? null)
    );
  }, [totalColors, model?.id]);

  useEffect(() => {
    if (model?.partPricing?.defaultQty || model?.partPricing?.min) {
      setPartCount(Math.max(1, Number(model.partPricing.defaultQty || model.partPricing.min || 1)));
    }
  }, [model?.id]);

  if (!model) {
    return (
      <div className="min-h-screen">
        <TopNav back />
        <div className="max-w-md mx-auto px-4 pt-16 text-center">
          <p className="mb-4">הדגם לא נמצא</p>
          <Link to="/" className="text-blue-700 underline">חזרה לרשימה</Link>
        </div>
      </div>
    );
  }

  const currentPrice = getDynamicPrice(model, text, partCount);
  const colorsValid = totalColors === 0 || (selected.length === totalColors && selected.every(Boolean));
  const canAdd = colorsValid && (!needsText || text.trim().length > 0) && (!needsPartCount || partCount > 0);

  const setColor = (i, c) =>
    setSelected((prev) => {
      const next = [...prev];
      next[i] = c;
      return next;
    });

  const add = () => {
    const safeColors = selected.filter(Boolean).map((c, idx) => ({
      label: totalColors === 2 ? labels[idx] : "צבע",
      name: c.name,
      hex: c.hex,
    }));

    const dynamicPrice = getDynamicPrice(model, text, partCount);
    const customText = needsText ? text.trim() : "";
    const extraMeta = needsPartCount ? { partCount: Number(partCount || 0), quantityLabel: model.partPricing?.label || "מספר חלקים" } : {};

    addToCart(model, safeColors, customText, dynamicPrice, extraMeta);
    setAdded(true);
    setTimeout(() => navigate("/cart"), 400);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(model.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const itemPriceLabel = model.priceText || currentPrice;

  return (
    <div className="min-h-screen pb-24">
      <TopNav back />
      <main className="max-w-md mx-auto px-4 pt-4">
        <img src={img(model.img, true)} alt={model.name} className="aspect-square w-full object-cover rounded-3xl bg-slate-50 mb-4" />
        <h1 className="text-2xl font-bold mb-1">{model.name}</h1>
        <p className="text-lg text-slate-700 mb-1">מחיר: {itemPriceLabel} ש"ח</p>

        {model.specialOffer && model.specialOffer.packSize > 1 && (
          <p className="text-sm text-green-600 font-semibold mb-2">
            מבצע: {model.specialOffer.packSize} ב־{model.specialOffer.packPrice} ₪
          </p>
        )}

        {model.desc && (
          <p className="text-sm text-slate-600 whitespace-pre-line mb-5 mt-2">
            <span className="font-semibold">תיאור: </span>
            {model.desc}
          </p>
        )}

        {isAdmin && (
          <div className="flex flex-wrap gap-2 mb-5 p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
            <Link
              to={`/admin?edit=${model.id}`}
              className="flex items-center gap-1 text-sm bg-white ring-1 ring-slate-200 rounded-lg px-3 py-1.5"
            >
              <Pencil className="w-3.5 h-3.5" /> עריכת דגם
            </Link>
            {model.link && (
              <>
                <a
                  href={model.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-sm bg-white ring-1 ring-slate-200 rounded-lg px-3 py-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> פתח קישור
                </a>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-1 text-sm bg-white ring-1 ring-slate-200 rounded-lg px-3 py-1.5"
                >
                  <Copy className="w-3.5 h-3.5" /> {copied ? "הקישור הועתק" : "העתק קישור"}
                </button>
              </>
            )}
          </div>
        )}

        {totalColors > 0 && Array.from({ length: totalColors }).map((_, i) => (
          <ColorPicker
            key={i}
            label={totalColors === 2 ? labels[i] : "צבע"}
            value={selected[i]}
            onChange={(c) => setColor(i, c)}
          />
        ))}

        {needsText && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">מה יהיה כתוב על הדגם *</label>
            <input
              value={text}
              maxLength={Number(model.textPricing?.maxChars || 20)}
              onChange={(e) => setText(e.target.value)}
              placeholder="הזן טקסט"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-2"
            />
            <p className="text-xs text-slate-500">{text.length} תווים · מחיר נוכחי: ₪{currentPrice}</p>
          </div>
        )}

        {needsPartCount && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">{model.partPricing?.label || "מספר חלקים"} *</label>
            <input
              type="number"
              min={Math.max(1, Number(model.partPricing?.min || 1))}
              value={partCount}
              onChange={(e) => setPartCount(Math.max(1, Number(e.target.value || 1)))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-2"
            />
            <p className="text-xs text-slate-500">מחיר נוכחי: ₪{currentPrice}</p>
          </div>
        )}

        {!canAdd && (
          <p className="text-xs text-slate-400 mb-2">
            {needsText && !text.trim()
              ? "נא להזין טקסט לפני הוספה לעגלה"
              : totalColors > 0
                ? "נא לבחור צבע לפני הוספה לעגלה"
                : "נא להזין פרטים לפני הוספה לעגלה"}
          </p>
        )}

        <button
          disabled={!canAdd}
          onClick={add}
          className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold disabled:opacity-40"
        >
          {added ? "נוסף לעגלה ✓" : "הוסף לעגלה"}
        </button>
      </main>
    </div>
  );
}

































 






























































































































































































































































































