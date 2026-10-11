import { useState } from "react";
import { ChevronDown } from "lucide-react";
import TopNav from "../components/TopNav.jsx";
import { FAQ as ITEMS } from "../data/faq.js";

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="min-h-screen">
      <TopNav back />
      <main className="max-w-md mx-auto px-4 pt-6 pb-10">
        <h1 className="text-2xl font-bold text-center mb-1">שאלות נפוצות</h1>
        <p className="text-center text-sm text-slate-500 mb-6">תשובות לשאלות הנפוצות ביותר</p>
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl">
          {ITEMS.map((it, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-right font-semibold"
              >
                <span>{it.q}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <p className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">{it.a}</p>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
