import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Container } from "../components/Container";
import { Input } from "../components/Input";
import { TextArea } from "../components/TextArea";
import { Toast } from "../components/Toast";
import { api, type JobLinkOut } from "../lib/api";
import { useAuth } from "../lib/auth";

export function Jobs() {
  const { token } = useAuth();
  const [items, setItems] = useState<JobLinkOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");

  const canCreate = useMemo(() => title.trim().length > 0 && url.trim().length > 5, [title, url]);

  async function load() {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.jobLinks.list(token);
      setItems(res);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load job links");
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
      const res = await api.jobLinks.create(token, {
        title,
        url,
        company: company || null,
        location: location || null,
        notes: notes || null,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setItems((prev) => [res, ...prev]);
      setTitle("");
      setUrl("");
      setCompany("");
      setLocation("");
      setNotes("");
      setTags("");
    } catch (e: any) {
      setError(e?.message ?? "Failed to create job link");
    }
  }

  async function remove(id: string) {
    if (!token) return;
    setError(null);
    try {
      await api.jobLinks.remove(token, id);
      setItems((prev) => prev.filter((j) => j.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete job link");
    }
  }

  return (
    <Container>
      {error ? <Toast message={error} onClose={() => setError(null)} /> : null}
      <div className="py-8 md:py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-2xl font-extrabold text-white">Job Links</div>
            <div className="mt-1 text-sm text-white/60">Your personal list of job notification links.</div>
          </div>
          <Button variant="ghost" onClick={load} disabled={isLoading}>
            Refresh
          </Button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[380px_1fr]">
          <Card className="h-fit">
            <div className="text-sm font-semibold text-white">Add a link</div>
            <div className="mt-4 grid gap-3">
              <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Off-campus internships" />
              <Input label="URL" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
              <Input label="Company (optional)" value={company} onChange={(e) => setCompany(e.target.value)} />
              <Input label="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />
              <TextArea label="Notes (optional)" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Input label="Tags" hint="Comma-separated" value={tags} onChange={(e) => setTags(e.target.value)} />
              <Button onClick={create} disabled={!canCreate}>
                Add job link
              </Button>
            </div>
          </Card>

          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-white/70">Loading links...</div>
            ) : items.length === 0 ? (
              <Card>
                <div className="text-sm font-semibold text-white">No job links yet</div>
                <div className="mt-1 text-sm text-white/60">Add your first job notification link on the left.</div>
              </Card>
            ) : (
              items.map((j) => (
                <Card key={j.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-extrabold text-white">{j.title}</div>
                      <a
                        href={j.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block break-all text-sm font-semibold text-brand-200 hover:text-brand-100"
                      >
                        {j.url}
                      </a>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/65">
                        {j.company ? (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{j.company}</span>
                        ) : null}
                        {j.location ? (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{j.location}</span>
                        ) : null}
                      </div>
                      {j.notes ? <div className="mt-2 whitespace-pre-wrap text-sm text-white/75">{j.notes}</div> : null}
                      {j.tags?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {j.tags.map((t) => (
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
                    <Button variant="danger" onClick={() => remove(j.id)}>
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

