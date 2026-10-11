import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, ShoppingCart, ArrowRight, HelpCircle, X } from "lucide-react";
import { useCart } from "../lib/cart.jsx";

export default function TopNav({ back = false }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { count } = useCart();

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            {back ? (
              <button onClick={() => navigate(-1)} aria-label="חזרה">
                <ArrowRight className="w-5 h-5 text-slate-700" />
              </button>
            ) : (
              <button onClick={() => setOpen(true)} aria-label="תפריט">
                <Menu className="w-5 h-5 text-slate-700" />
              </button>
            )}
          </div>
          <Link to="/cart" className="relative" aria-label="עגלה">
            <ShoppingCart className="w-5 h-5 text-slate-700" />
            {count > 0 && (
              <span className="absolute -top-2 -left-2 bg-slate-900 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {count}
              </span>
            )}
          </Link>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)}>
          <aside
            className="absolute right-0 top-0 h-full w-[280px] bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">YANAI 3D</h2>
              <button onClick={() => setOpen(false)} aria-label="סגור">
                <X className="w-5 h-5" />
              </button>
            </div>
            <Link
              to="/faq"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 py-3 text-slate-800"
            >
              <HelpCircle className="w-5 h-5" /> שאלות נפוצות
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}
