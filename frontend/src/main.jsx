import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./index.css";

const CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "63749958607-rqv8cfhdce39jalbdrfdna1uthr5de04.apps.googleusercontent.com";

if (!CLIENT_ID) {
  console.error("Google Client ID is missing.");
}

console.log("Google Client ID:", CLIENT_ID ? "✅ Loaded" : "❌ Missing");
console.log("Current origin:", window.location.origin);

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);