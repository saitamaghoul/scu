import React from "react";

export function Input({
  label,
  hint,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm font-medium text-white/80">{label}</div> : null}
      <input
        className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/25 ${className}`}
        {...props}
      />
      {hint ? <div className="mt-1 text-xs text-white/50">{hint}</div> : null}
    </label>
  );
}

