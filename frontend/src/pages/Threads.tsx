import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Container } from "../components/Container";
import { Input } from "../components/Input";
import { TextArea } from "../components/TextArea";
import { Toast } from "../components/Toast";
import { api, type ThreadOut } from "../lib/api";
import { useAuth } from "../lib/auth";

export function Threads() {
  const { token, user } = useAuth();
  const [items, setItems] = useState<ThreadOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const canPost = useMemo(() => title.trim().length > 0 && body.trim().length > 0, [title, body]);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.threads.list();
      setItems(res);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load threads");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function create() {
    if (!token) {
      setError("Please log in to post a thread.");
      return;
    }
    setError(null);
    try {
      const res = await api.threads.create(token, {
        title,
        body,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setItems((prev) => [res, ...prev]);
      setTitle("");
      setBody("");
      setTags("");
    } catch (e: any) {
      setError(e?.message ?? "Failed to create thread");
    }
  }

  async function remove(id: string) {
    if (!token) return;
    setError(null);
    try {
      await api.threads.remove(token, id);
      setItems((prev) => prev.filter((t) => t.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete thread");
    }
  }

  return (
    <Container>
      {error ? <Toast message={error} onClose={() => setError(null)} /> : null}
      <div className="py-8 md:py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-2xl font-extrabold text-white">Threads</div>
            <div className="mt-1 text-sm text-white/60">Public discussion threads visible to everyone.</div>
          </div>
          <Button variant="ghost" onClick={load} disabled={isLoading}>
            Refresh
          </Button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[380px_1fr]">
          <Card className="h-fit">
            <div className="text-sm font-semibold text-white">Post a thread</div>
            <div className="mt-1 text-xs text-white/55">
              {user ? `Posting as ${user.name}` : "Log in to post. You can still browse threads."}
            </div>
            <div className="mt-4 grid gap-3">
              <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <TextArea
                label="Body"
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Ask a question or share something helpful..."
              />
              <Input
                label="Tags"
                hint="Comma-separated, e.g. internship, resume, dsa"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <Button onClick={create} disabled={!canPost}>
                Post
              </Button>
            </div>
          </Card>

          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-white/70">Loading threads...</div>
            ) : items.length === 0 ? (
              <Card>
                <div className="text-sm font-semibold text-white">No threads yet</div>
                <div className="mt-1 text-sm text-white/60">Be the first to start a discussion.</div>
              </Card>
            ) : (
              items.map((t) => (
                <Card key={t.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-lg font-extrabold text-white">{t.title}</div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70">
                          {t.author_name}
                        </span>
                      </div>
                      <div className="mt-2 whitespace-pre-wrap text-sm text-white/75">{t.body}</div>
                      {t.tags?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {t.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/75"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    {user && t.user_id === user.id ? (
                      <Button variant="danger" onClick={() => remove(t.id)}>
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}

