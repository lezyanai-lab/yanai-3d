// Service worker: האתר נפתח מהר וגם בלי אינטרנט (אחרי ביקור ראשון).
// כשמעלים גרסה חדשה אפשר להגדיל את המספר כדי לנקות מטמון ישן.
const CACHE = "yanai3d-v3";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// שומרים במטמון רק תשובות תקינות. תשובת 404 (למשל תמונה שהועלתה לפני שהפריסה הסתיימה)
// אסור שתישמר, אחרת התמונה לא תופיע גם אחרי שהיא באוויר.
const putIfOk = (req, res) => {
  if (res && res.ok && res.type === "basic") {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
  }
  return res;
};

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // לא נוגעים בבקשות חיצוניות (QR, פונטים, GitHub)

  // תמונות ואייקונים: מהמטמון מיד, ומתעדכנים ברקע
  if (/\/(images|icons)\//.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const net = fetch(req).then((res) => putIfOk(req, res));
        if (hit) {
          net.catch(() => {});
          return hit;
        }
        return net;
      })
    );
    return;
  }

  // שאר הקבצים (דף, JS, CSS): קודם רשת, ואם אין אינטרנט — מהמטמון
  e.respondWith(
    fetch(req)
      .then((res) => putIfOk(req, res))
      .catch(() => caches.match(req).then((hit) => hit || caches.match("./")))
  );
});
