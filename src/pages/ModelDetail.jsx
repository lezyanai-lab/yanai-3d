import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Copy, ExternalLink, Pencil } from "lucide-react";
import TopNav from "../components/TopNav.jsx";
import ColorPicker from "../components/ColorPicker.jsx";
import { PRODUCTS, DEFAULT_LABELS } from "../data/products.js";
import { useCart } from "../lib/cart.jsx";
import { useAdmin } from "../lib/admin.jsx";
import { img } from "../lib/config.js";

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

  const n = model.colors;
  const labels = model.colorLabels?.length === 2 ? model.colorLabels : DEFAULT_LABELS;
  const offer = model.specialOffer && model.specialOffer.packSize > 1 ? model.specialOffer : null;
  const colorsValid = selected.length === n && selected.every(Boolean);
  const canAdd = colorsValid && (n === 1 || text.trim().length > 0);

  const setColor = (i, c) =>
    setSelected((prev) => {
      const next = [...prev];
      next[i] = c;
      return next;
    });

  const add = () => {
    const colors = selected.map((c, i) => ({
      label: n === 2 ? labels[i] : "צבע",
      name: c.name,
      hex: c.hex,
    }));
    addToCart(model, colors, n === 2 ? text.trim() : "");
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
        <p className="text-lg text-slate-700 mb-1">מחיר: {model.priceText || model.price} ש"ח</p>
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

        {n === 1 && <ColorPicker label="צבע" value={selected[0]} onChange={(c) => setColor(0, c)} />}
        {n === 2 && (
          <>
            <ColorPicker label={labels[0]} value={selected[0]} onChange={(c) => setColor(0, c)} />
            <ColorPicker label={labels[1]} value={selected[1]} onChange={(c) => setColor(1, c)} />
            <label className="block text-sm font-semibold text-slate-700 mb-2">מה יהיה כתוב על הדגם *</label>
            <input
              value={text}
              maxLength={20}
              onChange={(e) => setText(e.target.value)}
              placeholder="הזן טקסט"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-4"
            />
          </>
        )}

        {!canAdd && (
          <p className="text-xs text-slate-400 mb-2">
            {n === 2
              ? "נא לבחור שני צבעים ולהזין טקסט לפני הוספה לעגלה"
              : "נא לבחור צבע לפני הוספה לעגלה"}
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
