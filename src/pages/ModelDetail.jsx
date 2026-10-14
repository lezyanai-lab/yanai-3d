import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Copy, ExternalLink, Pencil } from "lucide-react";
import TopNav from "../components/TopNav.jsx";
import ColorPicker from "../components/ColorPicker.jsx";
import { PRODUCTS } from "../data/products.js";
import { useCart } from "../lib/cart.jsx";
import { useAdmin } from "../lib/admin.jsx";
import { img } from "../lib/config.js";
import { textFieldOf, pricingOf, unitPrice, isQuote, countChars, colorCount, colorLabelsOf, rateText } from "../lib/product.js";

export default function ModelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAdmin } = useAdmin();
  const model = PRODUCTS.find((p) => p.id === id);

  const [selected, setSelected] = useState([]);
  const [text, setText] = useState("");
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const n = colorCount(model);
  const labels = colorLabelsOf(model);
  const tf = textFieldOf(model);
  const pr = pricingOf(model);
  const quote = isQuote(model);
  const offer = model.specialOffer && model.specialOffer.packSize > 1 ? model.specialOffer : null;
  const colorsValid = selected.length >= n && selected.slice(0, n).every(Boolean);
  const textOk = !tf || !tf.required || text.trim().length > 0;
  const canAdd = colorsValid && textOk;
  const chars = countChars(text);
  const price = unitPrice(model, text);

  const setColor = (i, c) =>
    setSelected((prev) => {
      const next = [...prev];
      next[i] = c;
      return next;
    });

  const add = () => {
    const colors = selected.slice(0, n).map((c, i) => ({
      label: labels[i],
      name: c.name,
      hex: c.hex,
    }));
    addToCart(model, colors, tf ? text.trim() : "");
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

  return (
    <div className="min-h-screen pb-24">
      <TopNav back />
      <main className="max-w-md mx-auto px-4 pt-4">
        <img src={img(model.img)} alt={model.name} className="aspect-square w-full object-cover rounded-3xl bg-slate-50 mb-4" />
        <h1 className="text-2xl font-bold mb-1">{model.name}</h1>
        <p className="text-lg text-slate-700 mb-1">
          {quote
            ? "המחיר ייקבע בפרטי לפי החלק"
            : pr.type === "perChar"
            ? `מחיר לאות: ${rateText(model)}`
            : `מחיר: ${model.priceText || model.price} ש"ח`}
        </p>
        {offer && (
          <p className="text-sm text-green-600 font-semibold mb-2">
            מבצע: {offer.packSize} ב־{offer.packPrice} ₪
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

        {Array.from({ length: n }).map((_, i) => (
          <ColorPicker key={i} label={labels[i]} value={selected[i]} onChange={(c) => setColor(i, c)} />
        ))}
        {tf && (
          <>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {tf.label}{tf.required ? " *" : ""}
            </label>
            <input
              value={text}
              maxLength={tf.maxChars}
              onChange={(e) => setText(e.target.value)}
              placeholder={tf.placeholder}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-2"
            />
            {pr.type === "perChar" && (
              <p className="text-sm text-slate-700 mb-4">
                {chars} תווים · סה"כ ליחידה: <span className="font-bold">₪{price}</span>
              </p>
            )}
          </>
        )}

        {!canAdd && (
          <p className="text-xs text-slate-400 mb-2">
            {!colorsValid && textOk ? "נא לבחור צבע לפני הוספה לעגלה" : !colorsValid ? "נא לבחור צבעים ולמלא את השדה לפני הוספה לעגלה" : "נא למלא את השדה לפני הוספה לעגלה"}
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
