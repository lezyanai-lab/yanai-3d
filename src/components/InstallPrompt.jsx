import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;

const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem("yanai3d_install_dismissed") === "1";
    } catch {
      return false;
    }
  });
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hidden || installed || isStandalone()) return null;

  const ios = isIOS();
  if (!deferred && !ios) return null; // דפדפן שלא תומך / עדיין לא מוכן

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem("yanai3d_install_dismissed", "1");
    } catch {}
  };

  const install = async () => {
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  return (
    <div className="relative bg-slate-50 ring-1 ring-slate-200 rounded-2xl p-3 mb-5 text-sm">
      <button onClick={dismiss} aria-label="סגור" className="absolute top-2 left-2 text-slate-400">
        <X className="w-4 h-4" />
      </button>
      {deferred ? (
        <button
          onClick={install}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl py-2.5 font-bold"
        >
          <Download className="w-4 h-4" /> התקן את האפליקציה
        </button>
      ) : (
        <p className="pl-6 leading-relaxed text-slate-700">
          להתקנה באייפון: לחץ על <Share className="inline w-4 h-4 mx-0.5" /> (שיתוף) ואז על{" "}
          <b>"הוסף למסך הבית"</b>.
        </p>
      )}
    </div>
  );
}
