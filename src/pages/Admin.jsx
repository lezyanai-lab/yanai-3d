import { useState } from "react";
import TopNav from "../components/TopNav.jsx";
import { useAdmin } from "../lib/admin.jsx";
import { useSearchParams } from "react-router-dom";
import { LogOut } from "lucide-react";
import ProductsTab from "./admin/ProductsTab.jsx";
import ColorsTab from "./admin/ColorsTab.jsx";
import FaqTab from "./admin/FaqTab.jsx";
import SettingsTab from "./admin/SettingsTab.jsx";
import BackupTab from "./admin/BackupTab.jsx";

function Login() {
  const { login } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await login(email, password);
    setBusy(false);
    if (r === "wrong") setError("אימייל או סיסמה שגויים");
    if (r === "missing") setError("כניסת המנהל עדיין לא הוגדרה באתר");
  };

  return (
    <form onSubmit={submit} className="max-w-md mx-auto px-4 pt-6">
      <h1 className="text-xl font-bold mb-4">כניסת מנהל</h1>

      <label className="block text-sm font-semibold mb-1">אימייל</label>
      <input
        type="email"
        dir="ltr"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 text-left"
        autoComplete="username"
      />

      <label className="block text-sm font-semibold mb-1">סיסמה</label>
      <input
        type="password"
        dir="ltr"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 text-left"
        autoComplete="current-password"
      />

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <button
        disabled={busy || !email.trim() || !password}
        className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold disabled:opacity-40"
      >
        {busy ? "בודק..." : "התחבר"}
      </button>
    </form>
  );
}

const TABS = [
  ["products", "מוצרים"],
  ["colors", "צבעים"],
  ["faq", "שאלות נפוצות"],
  ["settings", "הגדרות אתר"],
  ["backup", "גיבוי"],
];

function Panel() {
  const { logout } = useAdmin();
  const [params] = useSearchParams();
  const editId = params.get("edit") || "";
  const [tab, setTab] = useState("products");

  // כל הלשוניות נשארות טעונות כדי ששינויים שלא נשמרו לא יאבדו במעבר ביניהן
  const show = (k) => (tab === k ? "" : "hidden");

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold">מצב מנהל</h1>
        <button onClick={logout} className="flex items-center gap-1 text-xs text-slate-500">
          <LogOut className="w-3.5 h-3.5" /> התנתק
        </button>
      </div>
      <div className="flex gap-1 overflow-x-auto mb-4 border-b border-slate-100">
        {TABS.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px ${
              tab === k ? "border-slate-900 font-bold text-slate-900" : "border-transparent text-slate-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={show("products")}><ProductsTab openId={editId} /></div>
      <div className={show("colors")}><ColorsTab /></div>
      <div className={show("faq")}><FaqTab /></div>
      <div className={show("settings")}><SettingsTab /></div>
      <div className={show("backup")}><BackupTab /></div>
    </div>
  );
}

export default function Admin() {
  const { isAdmin } = useAdmin();
  return (
    <div className="min-h-screen">
      <TopNav back />
      {isAdmin ? <Panel /> : <Login />}
    </div>
  );
}
