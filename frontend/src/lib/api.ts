export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL?.toString?.() || "http://127.0.0.1:8000";

async function request<T>(
  path: string,
  opts: {
    method?: string;
    token?: string | null;
    body?: unknown;
  } = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      detail = data?.detail ?? detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

export type TokenResponse = { access_token: string; token_type: "bearer" };
export type UserPublic = { id: string; name: string; email: string; created_at: string };

export type NoteOut = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type ThreadOut = {
  id: string;
  user_id: string;
  author_name: string;
  title: string;
  body: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type JobLinkOut = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  company: string | null;
  location: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export const api = {
  auth: {
    signup: (body: { name: string; email: string; password: string }) =>
      request<TokenResponse>("/auth/signup", { method: "POST", body }),
    login: (body: { email: string; password: string }) =>
      request<TokenResponse>("/auth/login", { method: "POST", body }),
  },
  users: {
    me: (token: string) => request<UserPublic>("/users/me", { token }),
  },
  notes: {
    list: (token: string) => request<NoteOut[]>("/notes", { token }),
    create: (token: string, body: { title: string; content: string; tags: string[] }) =>
      request<NoteOut>("/notes", { method: "POST", token, body }),
    update: (
      token: string,
      id: string,
      body: { title?: string; content?: string; tags?: string[] },
    ) => request<NoteOut>(`/notes/${id}`, { method: "PUT", token, body }),
    remove: (token: string, id: string) => request<{ message: string }>(`/notes/${id}`, { method: "DELETE", token }),
  },
  threads: {
    list: () => request<ThreadOut[]>("/threads"),
    create: (token: string, body: { title: string; body: string; tags: string[] }) =>
      request<ThreadOut>("/threads", { method: "POST", token, body }),
    update: (
      token: string,
      id: string,
      body: { title?: string; body?: string; tags?: string[] },
    ) => request<ThreadOut>(`/threads/${id}`, { method: "PUT", token, body }),
    remove: (token: string, id: string) =>
      request<{ message: string }>(`/threads/${id}`, { method: "DELETE", token }),
  },
  jobLinks: {
    list: (token: string) => request<JobLinkOut[]>("/job-links", { token }),
    create: (
      token: string,
      body: { title: string; url: string; company?: string | null; location?: string | null; notes?: string | null; tags: string[] },
    ) => request<JobLinkOut>("/job-links", { method: "POST", token, body }),
    update: (
      token: string,
      id: string,
      body: { title?: string; url?: string; company?: string | null; location?: string | null; notes?: string | null; tags?: string[] },
    ) => request<JobLinkOut>(`/job-links/${id}`, { method: "PUT", token, body }),
    remove: (token: string, id: string) =>
      request<{ message: string }>(`/job-links/${id}`, { method: "DELETE", token }),
  },
};

