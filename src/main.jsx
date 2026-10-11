import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import { CartProvider } from "./lib/cart.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <HashRouter>
    <CartProvider>
      <App />
    </CartProvider>
  </HashRouter>
);

// רישום ה-service worker (נדרש להתקנה כאפליקציה ולעבודה ללא אינטרנט)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch((err) => console.warn("SW registration failed", err));
  });
}
