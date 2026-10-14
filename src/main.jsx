import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import { CartProvider } from "./lib/cart.jsx";
import { AdminProvider } from "./lib/admin.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <HashRouter>
    <AdminProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AdminProvider>
  </HashRouter>
);

// רישום ה-service worker (נדרש להתקנה כאפליקציה ולעבודה ללא אינטרנט)
// כשיוצאת גרסה חדשה היא נטענת אוטומטית בלי צורך לנקות כלום בטלפון.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadController && !reloaded) {
      reloaded = true;
      window.location.reload();
    }
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: "none" })
      .then((reg) => reg.update())
      .catch((err) => console.warn("SW registration failed", err));
  });
}
