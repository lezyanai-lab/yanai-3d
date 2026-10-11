import { createContext, useContext, useState } from "react";
import { decryptToken } from "./crypto.js";

const AdminContext = createContext(null);
const KEY = "yanai3d_admin_token";

// הקובץ נוצר ע"י make-admin.mjs. אם הוא עדיין לא קיים, האתר ממשיך לעבוד כרגיל.
const mods = import.meta.glob("../data/admin.json", { eager: true });
const BLOB = mods["../data/admin.json"]?.default;
export const ADMIN_CONFIGURED = !!BLOB?.data;

export function AdminProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(KEY) || "";
    } catch {
      return "";
    }
  });

  // מחזיר "ok" | "wrong" | "missing"
  const login = async (email, password) => {
    if (!ADMIN_CONFIGURED) return "missing";
    try {
      const t = await decryptToken(BLOB, email, password);
      try {
        localStorage.setItem(KEY, t);
      } catch {}
      setToken(t);
      return "ok";
    } catch {
      return "wrong";
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setToken("");
  };

  return (
    <AdminContext.Provider value={{ isAdmin: !!token, token, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
