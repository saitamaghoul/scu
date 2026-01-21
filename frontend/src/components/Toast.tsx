import { useEffect } from "react";

export function Toast({
  message,
  kind = "error",
  onClose,
}: {
  message: string;
  kind?: "error" | "info";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed right-4 top-4 z-50 w-[min(420px,calc(100vw-2rem))]">
      <div
        className={`rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
          kind === "error"
            ? "border-red-500/30 bg-red-950/40 text-red-100"
            : "border-white/10 bg-black/40 text-white"
        }`}
      >
        <div className="text-sm font-semibold">{kind === "error" ? "Something went wrong" : "Info"}</div>
        <div className="mt-1 text-sm opacity-90">{message}</div>
        <div className="mt-3 flex justify-end">
          <button
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
            onClick={onClose}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

