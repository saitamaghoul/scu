import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Container } from "../components/Container";
import { Input } from "../components/Input";
import { TextArea } from "../components/TextArea";
import { Toast } from "../components/Toast";
import { api, type NoteOut } from "../lib/api";
import { useAuth } from "../lib/auth";

export function Notes() {
  const { token } = useAuth();
  const [items, setItems] = useState<NoteOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const canCreate = useMemo(() => title.trim().length > 0 && content.trim().length > 0, [title, content]);

  async function load() {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.notes.list(token);
      setItems(res);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function create() {
    if (!token) return;
    setError(null);
    try {
      const res = await api.notes.create(token, {
        title,
        content,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setItems((prev) => [res, ...prev]);
      setTitle("");
      setContent("");
      setTags("");
    } catch (e: any) {
      setError(e?.message ?? "Failed to create note");
    }
  }

  async function remove(id: string) {
    if (!token) return;
    setError(null);
    try {
      await api.notes.remove(token, id);
      setItems((prev) => prev.filter((n) => n.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete note");
    }
  }

  return (
    <Container>
      {error ? <Toast message={error} onClose={() => setError(null)} /> : null}
      <div className="py-8 md:py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-2xl font-extrabold text-white">Your Notes</div>
            <div className="mt-1 text-sm text-white/60">Private notes saved to your account.</div>
          </div>
          <Button variant="ghost" onClick={load} disabled={isLoading}>
            Refresh
          </Button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[380px_1fr]">
          <Card className="h-fit">
            <div className="text-sm font-semibold text-white">Create note</div>
            <div className="mt-4 grid gap-3">
              <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <TextArea
                label="Content"
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your notes..."
              />
              <Input
                label="Tags"
                hint="Comma-separated, e.g. math, dsa, os"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <Button onClick={create} disabled={!canCreate}>
                Add note
              </Button>
            </div>
          </Card>

          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-white/70">Loading notes...</div>
            ) : items.length === 0 ? (
              <Card>
                <div className="text-sm font-semibold text-white">No notes yet</div>
                <div className="mt-1 text-sm text-white/60">Create your first note on the left.</div>
              </Card>
            ) : (
              items.map((n) => (
                <Card key={n.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-extrabold text-white">{n.title}</div>
                      <div className="mt-2 whitespace-pre-wrap text-sm text-white/75">{n.content}</div>
                      {n.tags?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {n.tags.map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/75"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <Button variant="danger" onClick={() => remove(n.id)}>
                      Delete
                    </Button>
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

