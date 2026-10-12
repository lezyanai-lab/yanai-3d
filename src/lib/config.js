// ההגדרות נערכות ממסך המנהל (הגדרות ← הגדרות אתר) ונשמרות ב-settings.json
import settings from "../data/settings.json";

export const SETTINGS = settings;
export const WHATSAPP = settings.whatsapp;
export const WHATSAPP_LINK = `https://wa.me/${settings.whatsapp}`;
export const WHATSAPP_DEEP = `whatsapp://send?phone=${settings.whatsapp}`;
export const BIT_LINK = settings.bitLink;
export const PHONE_ORDERS = settings.phoneOrders;
export const PHONE_BIT = settings.phoneBit;
export const MAINTENANCE = !!settings.maintenance;

export const img = (name) =>
  /^(https?:)?\/\//.test(name) ? name : `${import.meta.env.BASE_URL}images/${name}`;
