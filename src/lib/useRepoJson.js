import { useCallback, useEffect, useRef, useState } from "react";
import { useAdmin } from "./admin.jsx";
import { getJson, saveJson } from "./github.js";
import { merge3 } from "./merge.js";

const MAX_TRIES = 4;

// טוען קובץ JSON מה-repo ושומר חזרה בבטחה:
//  - לפני כל שמירה נטען המצב העדכני ב-GitHub וממוזגים אליו רק מה שהמנהל שינה במסך הזה
//    (מחיקה נשארת מחוקה, ושינוי ממכשיר אחר לא נדרס)
//  - כשהמסך חוזר לפוקוס (למשל חזרה מהטלפון) ואין שינויים שלא נשמרו, הנתונים נטענים מחדש
export function useRepoJson(path, message) {
  const { token } = useAdmin();
  const [data, setDataRaw] = useState(null);
  const [original, setOriginal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const baseRef = useRef(null); // המצב האחרון שנטען/נשמר מהשרת
  const dirtyRef = useRef(false);
  const busyRef = useRef(false);

  const apply = useCallback((d) => {
    baseRef.current = d;
    setDataRaw(d);
    setOriginal(JSON.stringify(d));
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getJson(token, path)
      .then((r) => alive && apply(r.data))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [token, path, apply]);

  const dirty = data !== null && JSON.stringify(data) !== original;
  dirtyRef.current = dirty;
  busyRef.current = saving;

  // רענון שקט כשחוזרים למסך, רק אם אין שינויים שלא נשמרו
  useEffect(() => {
    const onShow = () => {
      if (document.visibilityState !== "visible" || dirtyRef.current || busyRef.current) return;
      getJson(token, path)
        .then((r) => {
          if (dirtyRef.current || busyRef.current) return;
          if (JSON.stringify(r.data) !== JSON.stringify(baseRef.current)) apply(r.data);
        })
        .catch(() => {});
    };
    document.addEventListener("visibilitychange", onShow);
    return () => document.removeEventListener("visibilitychange", onShow);
  }, [token, path, apply]);

  const setData = useCallback((updater) => {
    setSaved(false);
    setNotice("");
    setDataRaw((prev) => (typeof updater === "function" ? updater(prev) : updater));
  }, []);

  const save = async (cleaned = data) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      let remote = await getJson(token, path);
      let merged = merge3(baseRef.current, cleaned, remote.data);
      let mergedOthers = JSON.stringify(merged) !== JSON.stringify(cleaned);
      for (let attempt = 1; ; attempt++) {
        try {
          await saveJson(token, path, merged, remote.sha, message);
          break;
        } catch (e) {
          if (e.code !== "conflict" || attempt >= MAX_TRIES) throw e;
          remote = await getJson(token, path); // נשמר ממקום אחר באותו רגע: ממזגים מחדש ומנסים שוב
          merged = merge3(baseRef.current, cleaned, remote.data);
          mergedOthers = JSON.stringify(merged) !== JSON.stringify(cleaned);
        }
      }
      apply(merged);
      setSaved(true);
      if (mergedOthers) setNotice("בזמן העריכה נשמרו גם שינויים ממכשיר אחר, והם שולבו ברשימה.");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return { data, setData, loading, saving, error, saved, notice, dirty, save };
}
