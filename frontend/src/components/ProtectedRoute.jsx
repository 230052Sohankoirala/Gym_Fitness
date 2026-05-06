// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children, role }) => {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return setAuthorized(false);

        // 💡 Pick endpoint dynamically
        const endpoint =
          role === "admin"
            ? "http://localhost:4000/api/admin/me"
            : role === "trainer"
            ? "http://localhost:4000/api/trainers/me"
            : "http://localhost:4000/api/users/me";

        const { data } = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Role check
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

  return authorized ? children : <Navigate to={`/${role || "member"}Login`} replace />;
};

export default ProtectedRoute;
