const BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://dummyjson.com';

const SELECT_FIELDS = ['firstName', 'lastName', 'username', 'email', 'role', 'image'];

export async function listUsers(accessToken, { limit = 30 } = {}) {
  const url = new URL(`${BASE}/users`);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('select', SELECT_FIELDS.join(','));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Users API failed (${res.status})`);
  return res.json();
}
