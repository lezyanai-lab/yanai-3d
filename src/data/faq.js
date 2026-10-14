// השאלות הנפוצות נערכות ממסך המנהל ונשמרות ב-faq.json
import data from "../../content/faq.json";

export const FAQ = data.filter((f) => f.active !== false);
