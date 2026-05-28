// src/components/ProtectedRoute.jsx

import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

/* ================== API Base URL ================== */
/**
 * Local:
 * VITE_API_BASE_URL=http://localhost:4000
 *
 * Render:
 * VITE_API_BASE_URL=https://your-backend-name.onrender.com
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com";

const ProtectedRoute = ({ children, role }) => {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        const endpoint =
          role === "admin"
            ? `${API_BASE_URL}/api/admin/me`
            : role === "trainer"
              ? `${API_BASE_URL}/api/trainers/me`
              : `${API_BASE_URL}/api/users/me`;

        const { data } = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (role && data.role !== role) {
          console.warn(`Role mismatch: expected ${role}, got ${data.role}`);
          setAuthorized(false);
        } else {
          setAuthorized(true);
        }
      } catch (err) {
        console.error("Auth check failed:", err.response?.data || err.message);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Checking authentication...
      </div>
    );
  }

  return authorized ? (
    children
  ) : (
    <Navigate to={`/${role || "member"}Login`} replace />
  );
};

export default ProtectedRoute;