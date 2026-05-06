// src/pages/PaymentSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PAID_SESSIONS_KEY = "paid_sessions_map_v1";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("sessionId");

    if (sessionId) {
      try {
        const raw = localStorage.getItem(PAID_SESSIONS_KEY);
        const map = raw ? JSON.parse(raw) : {};
        map[sessionId] = true;
        localStorage.setItem(PAID_SESSIONS_KEY, JSON.stringify(map));
      } catch {
        // ignore
      }
    }

    // Redirect back to classes (change path if your route differs)
    navigate("/member/classes", { replace: true });
  }, [navigate]);

  return null;
}
