import { COLORS } from "../lib/colors.js";

export default function ColorPicker({ label, value, onChange }) {
  return (
    <div className="mb-4">
      {label && <p className="text-sm font-semibold text-slate-700 mb-2">{label} *</p>}
      <div className="grid grid-cols-2 gap-2">
        {COLORS.map((c) => {
          const selected = value?.name === c.name;
          return (
            <button
              key={c.name}
              type="button"
              disabled={!c.inStock}
              onClick={() => onChange(c)}
              className={`relative flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                selected ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200"
              } ${!c.inStock ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <span
                className="w-5 h-5 rounded-full border border-slate-200"
                style={{ background: c.hex }}
              />
              <span>
                {c.name}
                {!c.inStock && " — אזל"}
              </span>
              {!c.inStock && (
                <span className="absolute right-2 w-6 h-0.5 bg-red-400 rotate-45" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
