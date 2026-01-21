const KEY = "scu.auth";

export type StoredAuth = {
  token: string;
};

export function loadAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAuth(auth: StoredAuth | null): void {
  if (!auth) {
    localStorage.removeItem(KEY);
    return;
  }
  localStorage.setItem(KEY, JSON.stringify(auth));
}

