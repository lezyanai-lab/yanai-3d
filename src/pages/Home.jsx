import { useState } from "react";
import { Link } from "react-router-dom";
import TopNav from "../components/TopNav.jsx";
import Footer from "../components/Footer.jsx";
import InstallPrompt from "../components/InstallPrompt.jsx";
import { PRODUCTS } from "../data/products.js";
import { COLORS } from "../lib/colors.js";
import { img, SETTINGS } from "../lib/config.js";

const SORTS = [
  ["none", "ללא מיון"],
  ["az", "א'-ת'"],
  ["za", "ת'-א'"],
  ["cheap", "מהזול ליקר"],
  ["exp", "מהיקר לזול"],
  ["new", "מהחדש לישן"],
  ["old", "מהישן לחדש"],
];

function sortProducts(list, mode) {
  const a = [...list];
  switch (mode) {
    case "az": return a.sort((x, y) => x.name.localeCompare(y.name, "he"));
    case "za": return a.sort((x, y) => y.name.localeCompare(x.name, "he"));
    case "cheap": return a.sort((x, y) => x.price - y.price);
    case "exp": return a.sort((x, y) => y.price - x.price);
    case "old": return a.reverse();
    default: return a; // none / new = סדר המקור (חדש לישן)
  }
}

export default function Home() {
  const [sort, setSort] = useState("none");
  const list = sortProducts(PRODUCTS, sort);

  return (
    <div className="min-h-screen">
      <TopNav />
      {SETTINGS.announcement?.trim() && (
        <div className="bg-amber-100 text-amber-900 text-center text-sm font-semibold py-2 px-4">
          {SETTINGS.announcement}
        </div>
      )}
      <main className="max-w-md mx-auto px-4 pt-4">
        <InstallPrompt />
        <div className="flex items-start gap-4 mb-4">
          <img
            src={img(SETTINGS.logo)}
            alt="YANAI 3D"
            className="w-36 h-36 rounded-full bg-slate-50 ring-1 ring-slate-100 object-cover shrink-0"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold mb-2">ניתן להשיג בצבעים:</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              {COLORS.map((c) => (
                <div
                  key={c.name}
                  className={`flex items-center gap-1 text-xs ${c.inStock ? "text-slate-700" : "text-slate-300"}`}
                >
                  <span className="relative w-3 h-3 rounded-full border border-slate-200" style={{ background: c.hex }}>
                    {!c.inStock && <span className="absolute -left-1 top-1 w-5 h-0.5 bg-red-400 rotate-45" />}
                  </span>
                  {c.name}
                  {!c.inStock && " (אזל)"}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-blue-700 text-white text-center rounded-xl py-3 font-bold mb-3">
          {SETTINGS.bannerTitle}
        </div>
        <p className="text-center text-sm text-slate-600 mb-5 leading-relaxed">
          {SETTINGS.intro.split("\n").map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </p>

        {/* בכיוון RTL, justify-start = צד ימין */}
        <div className="flex items-center justify-start gap-2 mb-3">
          <label className="text-sm text-slate-500">מיון</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1 text-sm bg-white"
          >
            {SORTS.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {list.map((p) => (
            <Link
              key={p.id}
              to={`/model/${p.id}`}
              className="block rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-100 active:scale-95 transition"
            >
              <img src={img(p.img)} alt={p.name} loading="lazy" className="aspect-square w-full object-cover bg-slate-50" />
              <p className="p-2 text-sm font-semibold text-center">{p.name}</p>
            </Link>
          ))}
        </div>
        {list.length === 0 && <p className="text-center text-slate-400 py-10">אין דגמים עדיין</p>}

        <Footer />
        <p className="text-center text-[10px] text-slate-300 mt-6">גרסה {__BUILD__}</p>
      </main>
    </div>
  );
}
