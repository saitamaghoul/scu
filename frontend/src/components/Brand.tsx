export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-400 via-indigo-400 to-emerald-300 shadow-lg shadow-brand-500/20" />
      <div className="leading-tight">
        <div className="text-sm font-semibold text-white">Student Collaboration Hub</div>
        <div className="text-xs text-white/60">Notes • Threads • Job Links</div>
      </div>
    </div>
  );
}

