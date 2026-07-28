import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 SAFE SESSION RESTORE
  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (token) {
        setAccessToken(token);
      }

      if (storedUser && storedUser !== "undefined") {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Auth restore error:", err);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔐 LOGIN
  const login = (token, userData) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setAccessToken(token);
    setUser(userData);
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.clear();
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ accessToken, user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};