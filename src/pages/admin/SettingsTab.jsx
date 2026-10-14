import { FILES } from "../../lib/github.js";
import { useRepoJson } from "../../lib/useRepoJson.js";
import { Field, ImageUpload, SaveBar, Spinner, inputCls } from "./ui.jsx";

export default function SettingsTab() {
  const r = useRepoJson(FILES.settings, "עדכון הגדרות האתר ממסך המנהל");
  if (r.loading) return <Spinner />;
  if (!r.data) return <p className="text-sm text-red-600 pt-6">{r.error}</p>;
  const s = r.data;
  const set = (patch) => r.setData((p) => ({ ...p, ...patch }));

  const problem = !/^\d{10,15}$/.test(s.whatsapp)
    ? "מספר וואטסאפ צריך להיות ספרות בלבד עם קידומת מדינה, למשל 972559301212"
    : !/^https?:\/\//.test(s.bitLink)
    ? "קישור ה-Bit צריך להתחיל ב-https://"
    : "";

  return (
    <div className="pb-32">
      <div className={`rounded-2xl p-4 mb-5 ${s.maintenance ? "bg-amber-50 ring-1 ring-amber-200" : "bg-slate-50 ring-1 ring-slate-100"}`}>
        <p className="font-bold mb-1">מצב תחזוקה</p>
        <p className="text-sm text-slate-600 mb-3">
          {s.maintenance
            ? "האתר כרגע סגור ללקוחות. רק אתה, אחרי כניסה כמנהל, רואה אותו."
            : "האתר פתוח ללקוחות. בתחזוקה הם יראו הודעה במקום הקטלוג."}
        </p>
        <button
          onClick={() => set({ maintenance: !s.maintenance })}
          className={`w-full rounded-xl py-2.5 font-bold ${s.maintenance ? "bg-green-600 text-white" : "bg-amber-500 text-white"}`}
        >
          {s.maintenance ? "✅ פתח את האתר מחדש" : "🔧 סגור את האתר לתחזוקה"}
        </button>
        <p className="text-xs text-slate-400 mt-2">אחרי השינוי צריך ללחוץ "שמור שינויים", והוא נכנס לתוקף תוך כדקה-שתיים.</p>
      </div>

      <h2 className="font-bold mb-3">טקסטים בדף הראשי</h2>
      <Field label="הודעה בראש האתר (אופציונלי)" hint="למשל: מבצע סוכות! השאר ריק כדי להסתיר.">
        <input value={s.announcement} onChange={(e) => set({ announcement: e.target.value })} className={inputCls} />
      </Field>
      <Field label="כותרת הבאנר הכחול">
        <input value={s.bannerTitle} onChange={(e) => set({ bannerTitle: e.target.value })} className={inputCls} />
      </Field>
      <Field label="טקסט פתיחה" hint="כל שורה חדשה תוצג בשורה נפרדת.">
        <textarea value={s.intro} onChange={(e) => set({ intro: e.target.value })} rows={3} className={inputCls} />
      </Field>
      <Field label="טקסט בתחתית האתר">
        <input value={s.footerNote} onChange={(e) => set({ footerNote: e.target.value })} className={inputCls} />
      </Field>

      <h2 className="font-bold mb-3 mt-6">יצירת קשר ותשלום</h2>
      <Field label="מספר וואטסאפ להזמנות (עם קידומת מדינה)" hint="למשל 972559301212">
        <input dir="ltr" value={s.whatsapp} onChange={(e) => set({ whatsapp: e.target.value.trim() })} className={`${inputCls} text-left`} />
      </Field>
      <Field label="טלפון שמוצג להזמנות">
        <input dir="ltr" value={s.phoneOrders} onChange={(e) => set({ phoneOrders: e.target.value })} className={`${inputCls} text-left`} />
      </Field>
      <Field label="טלפון שמוצג ל-Bit">
        <input dir="ltr" value={s.phoneBit} onChange={(e) => set({ phoneBit: e.target.value })} className={`${inputCls} text-left`} />
      </Field>
      <Field label="קישור תשלום Bit">
        <input dir="ltr" value={s.bitLink} onChange={(e) => set({ bitLink: e.target.value.trim() })} className={`${inputCls} text-left`} />
      </Field>

      <h2 className="font-bold mb-3 mt-6">תמונות האתר</h2>
      <Field label="לוגו">
        <ImageUpload value={s.logo} prefix="logo" onChange={(v) => set({ logo: v })} />
      </Field>
      <Field label="קוד QR של Bit">
        <ImageUpload value={s.bitQr} prefix="bit-qr" onChange={(v) => set({ bitQr: v })} />
      </Field>
      <Field label="לוגו Bit">
        <ImageUpload value={s.bitLogo} prefix="bit-logo" onChange={(v) => set({ bitLogo: v })} />
      </Field>

      <SaveBar dirty={r.dirty} problem={problem} error={r.error} saved={r.saved} saving={r.saving} notice={r.notice} onSave={() => r.save(s)} />
    </div>
  );
}
