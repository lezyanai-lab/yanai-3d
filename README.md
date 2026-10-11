# Yanai 3D Models

קטלוג הדפסות תלת-ממד (עברית, RTL). React + Vite + Tailwind, מתארח ב-GitHub Pages.
האתר הוא PWA: אפשר להתקין אותו כאפליקציה בטלפון, והוא נפתח גם בלי אינטרנט (אחרי ביקור ראשון).

## הרצה ראשונה

1. התקן Node.js 18 ומעלה.
2. `npm install`
3. `node download.mjs` — מוריד את התמונות (ל-`public/images`) ואת קבצי ה-3MF (ל-`backup-3mf`). בדוק שאין שורות FAIL.
4. (אופציונלי) אייקון מהלוגו האמיתי: `npm install --no-save sharp` ואז `node make-icons.mjs`.
   בלי זה האתר משתמש באייקון זמני כהה עם "3D".
5. `npm run dev` — בדיקה מקומית.

## עלייה ל-GitHub Pages

1. פתח repo ציבורי ב-GitHub והעלה את כל הפרויקט (תיקיית `backup-3mf` מוחרגת ב-`.gitignore`).
2. Settings → Pages → Source: **GitHub Actions**.
3. אחרי ה-push לענף `main` האתר עולה לבד (כתובת כמו `https://USERNAME.github.io/REPO/`).

## התקנה בטלפון

- **אנדרואיד (Chrome):** באתר יופיע כפתור "התקן את האפליקציה", או תפריט ⋮ ← "התקן אפליקציה".
- **אייפון (Safari בלבד):** שיתוף ← "הוסף למסך הבית".

## עדכונים

- מוצרים: `src/data/products.js`
- צבעים ומלאי (`inStock`): `src/lib/colors.js`
- שאלות נפוצות: `src/data/faq.js`
- וואטסאפ, Bit ומצב תחזוקה: `src/lib/config.js`
- אחרי שינוי גדול כדאי להגדיל את `CACHE` ב-`public/sw.js` (למשל `yanai3d-v2`)
