import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";

import {
  loginRequest,
  fetchUserProfile,
  saveToken,
  clearToken,
  saveUser,
  loadUser,
  clearUser,
  getToken,
} from "@/services/authService";

type AuthContextType = {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(loadUser());
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!localStorage.getItem("token");

  // Recarrega usuário se houver token válido
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const profile = await fetchUserProfile();
        setUser(profile);
      } catch {
        clearToken();
        clearUser();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    const { access_token } = await loginRequest(email, password);

    if (!access_token) throw new Error("Token não recebido");

    // salva token
    saveToken(access_token);

    try {
      const profile = await fetchUserProfile();
      setUser(profile);
      saveUser(profile);
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
    }
  }

  function logout() {
    clearToken();
    clearUser();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
