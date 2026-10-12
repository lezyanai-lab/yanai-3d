import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Wrench } from "lucide-react";
import { MAINTENANCE } from "./lib/config.js";
import { useAdmin } from "./lib/admin.jsx";
import Home from "./pages/Home.jsx";
import ModelDetail from "./pages/ModelDetail.jsx";
import FAQ from "./pages/FAQ.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Admin from "./pages/Admin.jsx";

function Maintenance() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <Wrench className="w-12 h-12 text-amber-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">האתר בתחזוקה</h1>
      <p className="text-slate-500 mb-8">אנחנו משפצים ומשפרים את האתר. נחזור בקרוב!</p>
      <Link to="/admin" className="text-xs text-slate-300">מנהל 🔐</Link>
    </div>
  );
}

export default function App() {
  const { isAdmin } = useAdmin();
  const { pathname } = useLocation();

  // במצב תחזוקה רק מנהל (או מסך הכניסה של המנהל) רואה את האתר
  if (MAINTENANCE && !isAdmin && pathname !== "/admin") return <Maintenance />;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/model/:id" element={<ModelDetail />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
