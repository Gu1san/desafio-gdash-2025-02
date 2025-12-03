export function api(token?: string) {
  return async (url: string, options: RequestInit = {}) => {
    const res = await fetch(import.meta.env.VITE_API_URL + url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  };
}
