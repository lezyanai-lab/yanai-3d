import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav.jsx";
import { useCart, itemTotal } from "../lib/cart.jsx";
import { WHATSAPP_LINK } from "../lib/config.js";

function buildMessage({ name, phone, notes, items }) {
  const lines = ["שלום ינאי!", "", `שם מלא: ${name}`, `טלפון: ${phone}`, "", "ברצוני להזמין:", ""];
  items.forEach((it) => {
    lines.push(`שם הדגם: ${it.modelName}`);
    lines.push(it.quote ? "מחיר: ייקבע בפרטי" : `מחיר: ${it.price} ₪`);
    if (it.colors.length === 2) {
      lines.push(`צבע בסיס: ${it.colors[0].name}`);
      lines.push(`צבע טקסט: ${it.colors[1].name}`);
    } else if (it.colors.length === 1) {
      lines.push(`צבע: ${it.colors[0]?.name ?? ""}`);
    }
    if (it.customText) {
      lines.push(`${it.textLabel || "טקסט"}: ${it.customText}`);
      if (!it.quote && it.chars) lines.push(`מספר תווים: ${it.chars}`);
    }
    if (it.quantity > 1) lines.push(`כמות: ${it.quantity}`);
    if (it.specialOffer?.packSize > 1) lines.push(`מבצע: ${it.specialOffer.packSize} ב־${it.specialOffer.packPrice} ₪`);
    lines.push("");
  });
  lines.push("הערות:");
  lines.push(notes || "");
  return lines.join("\n");
}

export default function Checkout() {
  const { items, total, hasQuote, clearCart } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);

  const valid = name.trim() && phone.trim() && items.length > 0;

  const submit = () => {
    if (!valid) return;
    const msg = buildMessage({ name: name.trim(), phone: phone.trim(), notes: notes.trim(), items });
    window.open(`${WHATSAPP_LINK}?text=${encodeURIComponent(msg)}`, "_blank");
    clearCart();
    setDone(true);
    setTimeout(() => navigate("/"), 2500);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <p className="text-xl font-bold">✅ ההזמנה נשלחה בהצלחה!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <TopNav back />
      <main className="max-w-md mx-auto px-4 pt-4">
        <h1 className="text-xl font-bold mb-4">פרטי הזמנה</h1>

        <label className="block text-sm font-semibold mb-1">שם מלא *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3" />

        <label className="block text-sm font-semibold mb-1">מספר טלפון *</label>
        <input dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 text-right" />

        <label className="block text-sm font-semibold mb-1">הערות (אופציונלי)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-5" />

        <h2 className="font-bold mb-2">סיכום הזמנה</h2>
        <div className="rounded-2xl ring-1 ring-slate-100 p-3 mb-4 space-y-1 text-sm">
          {items.map((it) => (
            <div key={it.key} className="flex justify-between">
              <span>{it.modelName} × {it.quantity}</span>
              <span>₪{itemTotal(it)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold border-t border-slate-100 pt-2 mt-2">
            <span>סה"כ</span>
            <span>₪{total}{hasQuote ? " + פריטים שייקבעו בפרטי" : ""}</span>
          </div>
        </div>

        <button
          disabled={!valid}
          onClick={submit}
          className="w-full bg-[#25D366] text-white rounded-xl py-3 font-bold disabled:opacity-40"
        >
          שלח הזמנה
        </button>
      </main>
    </div>
  );
}
