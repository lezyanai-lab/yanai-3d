import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import TopNav from "../components/TopNav.jsx";
import { useCart, itemTotal } from "../lib/cart.jsx";
import { img } from "../lib/config.js";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, hasQuote } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <TopNav back />
        <div className="max-w-md mx-auto px-4 pt-24 text-center">
          <ShoppingCart className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="mb-4 text-slate-600">העגלה ריקה</p>
          <Link to="/" className="bg-slate-900 text-white rounded-xl px-5 py-2 inline-block">חזרה לקטלוג</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-36">
      <TopNav back />
      <main className="max-w-md mx-auto px-4 pt-4">
        <h1 className="text-xl font-bold mb-4">עגלת הקניות</h1>
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.key} className="flex gap-3 p-3 rounded-2xl ring-1 ring-slate-100 shadow-sm">
              <img src={img(it.img)} alt="" className="w-20 h-20 rounded-xl object-cover bg-slate-50" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{it.modelName}</p>
                <p className="text-xs text-slate-500">{it.quote ? "המחיר ייקבע בפרטי" : `₪${it.price} ליחידה`}</p>
                {it.specialOffer?.packSize > 1 && (
                  <p className="text-xs text-green-600">
                    מבצע: {it.specialOffer.packSize} ב־{it.specialOffer.packPrice} ₪
                  </p>
                )}
                {it.colors.map((c, i) => (
                  <p key={i} className="flex items-center gap-1 text-xs text-slate-600">
                    <span className="w-3 h-3 rounded-full border border-slate-200" style={{ background: c.hex }} />
                    {c.label}: {c.name}
                  </p>
                ))}
                {it.customText && (
                  <p className="text-xs text-slate-600">
                    {it.textLabel || "טקסט"}: {it.customText}{!it.quote && it.chars ? ` (${it.chars} תווים)` : ""}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(it.key, -1)} className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm w-5 text-center">{it.quantity}</span>
                    <button onClick={() => updateQuantity(it.key, 1)} className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">{it.quote ? "ייקבע בפרטי" : `₪${itemTotal(it)}`}</span>
                    <button onClick={() => removeFromCart(it.key)} aria-label="הסר">
                      <Trash2 className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100">
        <div className="max-w-md mx-auto p-4">
          <div className="flex justify-between font-bold mb-3">
            <span>סה"כ להזמנה</span>
            <span>₪{total}{hasQuote ? " + פריטים שייקבעו בפרטי" : ""}</span>
          </div>
          <Link to="/checkout" className="block text-center bg-slate-900 text-white rounded-xl py-3 font-bold">
            המשך להזמנה
          </Link>
        </div>
      </div>
    </div>
  );
}
