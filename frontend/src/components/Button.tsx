import React from "react";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-400/60 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-gradient-to-br from-brand-500 via-indigo-500 to-emerald-400 text-slate-950 shadow-lg shadow-brand-500/20 hover:brightness-110"
      : variant === "danger"
        ? "bg-red-500/15 text-red-200 hover:bg-red-500/25 border border-red-500/30"
        : "bg-white/5 text-white hover:bg-white/10 border border-white/10";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

