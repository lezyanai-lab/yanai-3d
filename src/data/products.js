// המוצרים נערכים ממסך המנהל (הגדרות ← מוצרים) והנתונים נשמרים ב-products.json
import data from "./products.json";

export const PRODUCTS = data.filter((p) => !p.hidden);
export const DEFAULT_LABELS = ["צבע בסיס", "צבע טקסט"];
