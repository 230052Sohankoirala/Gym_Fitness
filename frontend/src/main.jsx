
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./index.css";

// Read from Vite env (put this in client/.env.local)
const CLIENT_ID ="63749958607-rqv8cfhdce39jalbdrfdna1uthr5de04.apps.googleusercontent.com";

// Optional: hard-fail early if the env isn't set, to avoid confusing 403s
if (!CLIENT_ID) {
  
  console.error(
    "VITE_GOOGLE_CLIENT_ID is missing. Add it to your client .env.local and restart Vite."
  );
}
// In your main.jsx
console.log("Google Client ID:", CLIENT_ID ? "✅ Loaded" : "❌ Missing");
console.log("Current origin:", window.location.origin);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>

        <App />
 
    </GoogleOAuthProvider>
  </StrictMode>
);
