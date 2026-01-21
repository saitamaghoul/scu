import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Container } from "../components/Container";
import { useAuth } from "../lib/auth";

export function Home() {
  const { user } = useAuth();

  return (
    <Container>
      <div className="py-10 md:py-16">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80">
              Built for collaboration
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Fast • Simple • Modern
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              Share notes, discuss threads, and track job links — in one place.
            </h1>
            <p className="mt-4 text-white/70">
              Student Collaboration Hub helps you store your notes, post discussion threads, and keep curated job
              notification links.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {user ? (
                <>
                  <Link to="/notes">
                    <Button>Go to Notes</Button>
                  </Link>
                  <Link to="/threads">
                    <Button variant="ghost">Browse Threads</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup">
                    <Button>Create account</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="ghost">Log in</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <Card className="p-6">
            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand-500/20 via-indigo-500/10 to-emerald-500/10 p-5">
                <div className="text-sm font-semibold text-white">Notes</div>
                <div className="mt-1 text-sm text-white/65">Save study notes with tags and quick editing.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/15 via-white/5 to-white/0 p-5">
                <div className="text-sm font-semibold text-white">Threads</div>
                <div className="mt-1 text-sm text-white/65">Post questions and share ideas with everyone.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/15 via-white/5 to-white/0 p-5">
                <div className="text-sm font-semibold text-white">Job Links</div>
                <div className="mt-1 text-sm text-white/65">Keep a personal list of job notification links.</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}

