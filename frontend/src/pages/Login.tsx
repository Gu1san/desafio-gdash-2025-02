import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const nav = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await auth.login(email, password);
      nav("/");
    } catch (err) {
      alert("Erro no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="p-6 rounded shadow-lg w-96 bg-white"
      >
        <h2 className="text-xl mb-4">Login</h2>
        <input
          className="w-full p-2 mb-3 border"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 mb-3 border"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button disabled={loading} className="w-full p-2 bg-sky-600 text-white">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
