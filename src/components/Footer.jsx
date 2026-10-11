import { WHATSAPP_LINK, WHATSAPP_DEEP, BIT_LINK, PHONE_ORDERS, PHONE_BIT, img } from "../lib/config.js";

const QR = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
  WHATSAPP_LINK
)}&size=240x240&margin=0`;

export default function Footer() {
  const onWhatsApp = (e) => {
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      e.preventDefault();
      window.location.href = WHATSAPP_DEEP;
      setTimeout(() => window.open(WHATSAPP_LINK, "_blank"), 1500);
    }
  };

  return (
    <footer className="mt-10 border-t border-slate-100 pt-6 pb-10 px-4 text-center">
      <h3 className="text-lg font-bold mb-1">יצירת קשר</h3>
      <p className="text-sm text-slate-500 mb-5">להזמנות ותשלומים</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <a href={WHATSAPP_LINK} onClick={onWhatsApp} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#25D366">
            <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.8-.4-1.700-.8-2.600-1.800-.7-.7-1.100-1.400-1.200-1.700-.1-.2 0-.4.1-.5l.4-.4c.1-.1.1-.3.2-.4.1-.1 0-.3 0-.4l-.8-1.800c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.200s.9 2.500 1 2.700c.1.200 1.800 2.800 4.400 3.900 1.700.7 2.300.6 3.100.5.5-.1 1.500-.6 1.700-1.200.2-.6.2-1.100.1-1.200-.1-.2-.3-.3-.5-.4z" />
          </svg>
          <img src={QR} alt="QR וואטסאפ" className="w-28 h-28" />
          <span dir="ltr" className="text-sm text-slate-700">{PHONE_ORDERS}</span>
        </a>

        <a href={BIT_LINK} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2">
          <img src={img("bit-logo.png")} alt="Bit" className="w-8 h-8 rounded-lg" />
          <img src={img("bit-qr.jpeg")} alt="QR ביט" className="w-28 h-28 object-contain" />
          <span dir="ltr" className="text-sm text-slate-700">{PHONE_BIT}</span>
        </a>
      </div>

      <p className="text-xs text-slate-400">Yanai 3D Models · הדפסות תלת-ממד בהתאמה אישית</p>
    </footer>
  );
}
