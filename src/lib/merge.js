// מיזוג תלת-כיווני של שינויי מנהל, כדי שמחיקות ועריכות לא יוחזרו ולא יידרסו.
//   base   = מה שנטען מ-GitHub כשהמסך נפתח (או אחרי השמירה האחרונה)
//   local  = מה שהמנהל ערך עכשיו
//   remote = המצב העדכני ב-GitHub ברגע השמירה (אולי נשמר בינתיים ממכשיר אחר)
// הכלל: כל מה שהמנהל שינה במסך הזה מנצח, וכל מה ששונה ממקום אחר ולא נגענו בו נשמר.

// השוואה שלא תלויה בסדר המפתחות
const stable = (v) =>
  JSON.stringify(v, (_, x) =>
    x && typeof x === "object" && !Array.isArray(x)
      ? Object.keys(x).sort().reduce((o, k) => ((o[k] = x[k]), o), {})
      : x
  );
const same = (a, b) => stable(a) === stable(b);

// נתונים בלי מזהה מקבלים מזהה קבוע לפי המיקום, כך שכל הצדדים מחשבים אותו זהה
export function ensureIds(data) {
  if (!Array.isArray(data)) return data;
  return data.map((x, i) => (x && typeof x === "object" && !x.id ? { ...x, id: `legacy-${i}` } : x));
}

function mergeArray(base, local, remote) {
  const bMap = new Map(base.map((x) => [x.id, x]));
  const lMap = new Map(local.map((x) => [x.id, x]));

  const deleted = new Set(base.filter((x) => !lMap.has(x.id)).map((x) => x.id));
  const edited = new Map(local.filter((x) => bMap.has(x.id) && !same(x, bMap.get(x.id))).map((x) => [x.id, x]));

  // נקודת המוצא: המצב העדכני ב-GitHub, בלי מה שנמחק כאן, ועם העריכות מכאן
  let result = remote.filter((x) => !deleted.has(x.id)).map((x) => edited.get(x.id) ?? x);

  // סדר: אם המנהל שינה סדר במסך הזה, הסדר שלו מנצח. פריטים שנוספו ממקום אחר עולים לראש.
  const baseOrder = base.filter((x) => lMap.has(x.id)).map((x) => x.id);
  const localOrder = local.filter((x) => bMap.has(x.id)).map((x) => x.id);
  if (!same(baseOrder, localOrder)) {
    const pos = new Map(local.map((x, i) => [x.id, i]));
    const known = result.filter((x) => pos.has(x.id)).sort((a, b) => pos.get(a.id) - pos.get(b.id));
    const others = result.filter((x) => !pos.has(x.id));
    result = [...others, ...known];
  }

  // פריטים חדשים שנוספו כאן: אחרי הפריט שקדם להם אצל המנהל (או בראש הרשימה)
  local.forEach((item, i) => {
    if (bMap.has(item.id)) return;
    if (result.some((x) => x.id === item.id)) {
      result = result.map((x) => (x.id === item.id ? item : x));
      return;
    }
    const prev = i > 0 ? local[i - 1].id : null;
    const at = prev ? result.findIndex((x) => x.id === prev) : -1;
    result.splice(at === -1 ? 0 : at + 1, 0, item);
  });

  return result;
}

function mergeObject(base, local, remote) {
  const out = { ...remote };
  for (const k of Object.keys(local)) {
    if (!same(local[k], base?.[k])) out[k] = local[k];
  }
  return out;
}

export function merge3(base, local, remote) {
  if (Array.isArray(local) && Array.isArray(base) && Array.isArray(remote)) return mergeArray(base, local, remote);
  if (local && base && remote && typeof local === "object" && !Array.isArray(local)) return mergeObject(base, local, remote);
  return local;
}
