import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "./admin.jsx";
import { getJson, saveJson } from "./github.js";

// טוען קובץ JSON מה-repo, עוקב אחרי שינויים ושומר חזרה
export function useRepoJson(path, message) {
  const { token } = useAdmin();
  const [data, setDataRaw] = useState(null);
  const [original, setOriginal] = useState("");
  const [sha, setSha] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getJson(token, path)
      .then((r) => {
        if (!alive) return;
        setSha(r.sha);
        setDataRaw(r.data);
        setOriginal(JSON.stringify(r.data));
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [token, path]);

  const setData = useCallback((updater) => {
    setSaved(false);
    setDataRaw((prev) => (typeof updater === "function" ? updater(prev) : updater));
  }, []);

  const dirty = data !== null && JSON.stringify(data) !== original;

  const save = async (cleaned = data) => {
    setSaving(true);
    setError("");
    try {
      const newSha = await saveJson(token, path, cleaned, sha, message);
      setSha(newSha);
      setDataRaw(cleaned);
      setOriginal(JSON.stringify(cleaned));
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return { data, setData, loading, saving, error, saved, dirty, save };
}
