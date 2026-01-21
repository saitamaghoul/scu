import { Outlet } from "react-router-dom";
import { TopNav } from "./components/TopNav";

export default function App() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <Outlet />
      <div className="py-10 text-center text-xs text-white/45">
        Student Collaboration Hub • Built with Vite + React + FastAPI + MongoDB
      </div>
    </div>
  );
}
