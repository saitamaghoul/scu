import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import { RequireAuth } from "./components/RequireAuth";
import { AuthProvider } from "./lib/auth";
import { Home } from "./pages/Home";
import { Jobs } from "./pages/Jobs";
import { Login } from "./pages/Login";
import { Notes } from "./pages/Notes";
import { Signup } from "./pages/Signup";
import { Threads } from "./pages/Threads";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      {
        path: "notes",
        element: (
          <RequireAuth>
            <Notes />
          </RequireAuth>
        ),
      },
      { path: "threads", element: <Threads /> },
      {
        path: "jobs",
        element: (
          <RequireAuth>
            <Jobs />
          </RequireAuth>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
