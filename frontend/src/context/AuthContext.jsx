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
      } catch (error) {
        console.error("Failed to parse stored user:", error);

        [
          "token",
          "user",
          "role",
          "auth_token",
          "auth_user",
          "isAdmin",
        ].forEach((key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });

        setAuthState({
          user: null,
          token: null,
          role: null,
        });
      }
    }
  }, []);

  /* ---------------- Login ---------------- */
  const login = (token, userData, rememberMe = false) => {
    const role = userData?.role || "member";

    /**
     * Important:
     * Clear auth values from BOTH localStorage and sessionStorage first.
     * This prevents old Remember Me tokens from staying in localStorage.
     */
    [
      "token",
      "user",
      "role",
      "auth_token",
      "auth_user",
      "isAdmin",
    ].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(userData));
    storage.setItem("role", role);

    setAuthState({
      token,
      user: userData,
      role,
    });
  };

  /* ---------------- Logout ---------------- */
  const logout = () => {
    [
      "token",
      "user",
      "role",
      "auth_token",
      "auth_user",
      "isAdmin",
    ].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    setAuthState({
      user: null,
      token: null,
      role: null,
    });
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