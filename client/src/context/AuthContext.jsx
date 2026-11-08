import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("overload_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        if (res.data?.success && res.data?.data?.user) {
          setUser(res.data.data.user);
        } else {
          localStorage.removeItem("overload_token");
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
        localStorage.removeItem("overload_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data?.success && res.data?.data) {
      const { token, user: userData } = res.data.data;
      localStorage.setItem("overload_token", token);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.error || "Login failed");
  };

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    if (res.data?.success && res.data?.data) {
      const { token, user: userData } = res.data.data;
      localStorage.setItem("overload_token", token);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.error || "Registration failed");
  };

  const logout = () => {
    localStorage.removeItem("overload_token");
    setUser(null);
    window.location.href = "/login";
  };

  const updateProfile = async (profileData) => {
    const res = await api.put("/profile", profileData);
    if (res.data?.success && res.data?.data?.user) {
      setUser(res.data.data.user);
      return res.data.data.user;
    }
    throw new Error(res.data?.error || "Profile update failed");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
