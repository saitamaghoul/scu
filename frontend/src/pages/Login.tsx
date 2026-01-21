import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Container } from "../components/Container";
import { Input } from "../components/Input";
import { Toast } from "../components/Toast";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

export function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => email.trim().length > 3 && password.length >= 8, [email, password]);

  useEffect(() => {
    if (user) navigate("/notes");
  }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await api.auth.login({ email, password });
      await login(res.access_token);
      navigate("/notes");
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Container>
      {error ? <Toast message={error} onClose={() => setError(null)} /> : null}
      <div className="mx-auto max-w-lg py-10 md:py-16">
        <Card>
          <div className="text-xl font-extrabold text-white">Log in</div>
          <div className="mt-1 text-sm text-white/60">Welcome back — continue where you left off.</div>

          <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
            <Input
              label="Email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <div className="mt-4 text-sm text-white/60">
            New here?{" "}
            <Link className="font-semibold text-brand-200 hover:text-brand-100" to="/signup">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </Container>
  );
}

