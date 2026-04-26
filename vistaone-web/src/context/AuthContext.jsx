import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext();

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userProfile")) || null;
    } catch {
      return null;
    }
  });

  const setAuth = useCallback((newToken, userProfile) => {
    setToken(newToken);
    setUser(userProfile);
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
  }, []);

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const hasRole = useCallback(
    (...roles) => {
      if (!user?.roles) return false;
      return roles.some((r) => user.roles.includes(r));
    },
    [user]
  );

  /**
   * Check if the user has a given action on a resource.
   * action: "read" | "write" | "delete"
   */
  const hasPermission = useCallback(
    (resource, action = "read") => {
      if (!user) return false;
      // MASTER has all permissions
      if (user.roles?.includes("MASTER")) return true;
      return user.permissions?.[resource]?.[action] === true;
    },
    [user]
  );

  const isMaster = hasRole("MASTER");
  const isAdmin = hasRole("MASTER", "ADMIN");

  return (
    <AuthContext.Provider
      value={{ token, user, setAuth, clearAuth, hasRole, hasPermission, isMaster, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}
