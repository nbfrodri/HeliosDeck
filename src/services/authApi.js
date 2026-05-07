const BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://dummyjson.com';

async function parseError(res, fallback) {
  try {
    const body = await res.json();
    return new Error(body.message ?? fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function login({ username, password, expiresInMins = 30 }) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, expiresInMins }),
  });
  if (!res.ok) throw await parseError(res, `Login failed (${res.status})`);
  return res.json();
}

export async function me(accessToken) {
  const res = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw await parseError(res, `Auth check failed (${res.status})`);
  return res.json();
}

export async function refresh({ refreshToken, expiresInMins = 30 }) {
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken, expiresInMins }),
  });
  if (!res.ok) throw await parseError(res, `Token refresh failed (${res.status})`);
  return res.json();
}
