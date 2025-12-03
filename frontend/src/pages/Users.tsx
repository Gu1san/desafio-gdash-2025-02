import { useEffect, useState } from "react";
import api from "../services/api";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await api.get("/users");
    setUsers(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Remover?")) return;
    await api.delete(`/users/${id}`);
    load();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Usuários</h1>
      {loading ? (
        "Carregando..."
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button onClick={() => remove(u._id)} className="mr-2">
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
