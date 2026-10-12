// השאלות הנפוצות נערכות ממסך המנהל ונשמרות ב-faq.json
import data from "./faq.json";

export const FAQ = data.filter((f) => f.active !== false);
