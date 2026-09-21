import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function ErrorModal({
  title = "Something needs your attention",
  message,
  onClose,
  actionLabel,
  onAction,
}) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="error-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 ring-8 ring-amber-50/60">
          <AlertCircle className="h-8 w-8 text-amber-600" />
        </div>

        <h2 id="error-modal-title" className="mt-6 font-serif text-2xl text-slate-900">
          {title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>

        <div className="mt-7 flex flex-col gap-3">
          {onAction && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onAction();
              }}
              className="w-full rounded-full bg-amber-600 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-amber-700"
            >
              {actionLabel || "Try again"}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="w-full rounded-full bg-slate-900 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-amber-600"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}