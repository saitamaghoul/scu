import { Link, NavLink, useNavigate } from "react-router-dom";
import { BrandMark } from "./Brand";
import { Button } from "./Button";
import { Container } from "./Container";
import { useAuth } from "../lib/auth";

function NavItem({ to, children }: { to: string; children: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-xl px-3 py-2 text-sm font-semibold transition ${
          isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <Container>
        <div className="flex items-center justify-between gap-4 py-4">
          <Link to="/" className="shrink-0">
            <BrandMark />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavItem to="/notes">Notes</NavItem>
            <NavItem to="/threads">Threads</NavItem>
            <NavItem to="/jobs">Job Links</NavItem>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden text-right md:block">
                  <div className="text-sm font-semibold text-white">{user.name}</div>
                  <div className="text-xs text-white/55">{user.email}</div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  Log in
                </Button>
                <Button onClick={() => navigate("/signup")}>Sign up</Button>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

