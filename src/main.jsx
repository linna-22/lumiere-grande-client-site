import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import {
  PublicHotelSettingsProvider,
} from "./context/PublicHotelSettingsContext";

// Laravel OAuth callback
// Backend redirects to:
// http://localhost:5173/auth/callback?token=...&user_id=...
//
// Because this app uses HashRouter, convert it to:
// http://localhost:5173/#/oauth/callback?token=...&user_id=...

const path = window.location.pathname;

if (path === "/auth/callback") {
  const query = window.location.search;

  window.location.replace(
    `/#/oauth/callback${query}`
  );
}

createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <PublicHotelSettingsProvider>
      <App />
    </PublicHotelSettingsProvider>
  </StrictMode>
);
