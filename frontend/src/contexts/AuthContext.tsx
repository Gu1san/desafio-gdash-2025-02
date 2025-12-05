import { useState, createContext, useContext, type ReactNode } from "react";
import api from "../services/api";
import Cookies from "js-cookie";

type AuthContextType = {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });

  async function login(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    const token = res.data.access_token;
    if (!token) throw new Error("Token não recebido");
    Cookies.set("token", token);
    localStorage.setItem("token", token);
    // opcional: obter profile
    const profile = await api
      .get("/users/me")
      .then((r) => r.data)
      .catch(() => null);
    setUser(profile);
    if (profile) localStorage.setItem("user", JSON.stringify(profile));
  }

  function logout() {
    Cookies.remove("token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
