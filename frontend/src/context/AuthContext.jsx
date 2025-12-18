import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    role: null,
  });

  /* ---------------- Load Auth from Storage ---------------- */
  useEffect(() => {
    // Try both storages for compatibility
    const rawUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const role =
      localStorage.getItem("role") || sessionStorage.getItem("role");

    if (rawUser && token) {
      try {
        setAuthState({
          user: JSON.parse(rawUser),
          token,
          role: role || "member",
        });
      } catch {
        // Clear if corrupted
        localStorage.clear();
        sessionStorage.clear();
      }
    }
  }, []);

  /* ---------------- Login ---------------- */
  const login = (token, userData, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;

    // 🧹 First, clear legacy keys to prevent duplicates
    ["auth_token", "auth_user", "isAdmin"].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });

    // ✅ Store unified keys
    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(userData));
    storage.setItem("role", userData?.role || "member");

    setAuthState({
      token,
      user: userData,
      role: userData?.role || "member",
    });
  };

  /* ---------------- Logout ---------------- */
  const logout = () => {
    // Remove from both storages
    ["token", "user", "role", "auth_token", "auth_user", "isAdmin"].forEach(
      (key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      }
    );

    setAuthState({ user: null, token: null, role: null });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        isAuthenticated: !!authState.token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
