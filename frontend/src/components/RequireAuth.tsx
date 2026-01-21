import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function RequireAuth({ children }: { children: React.ReactElement }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return <div className="mx-auto max-w-6xl px-4 py-10 text-white/70">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

