import { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext(null);

const AUTO_DISMISS_MS = 5000;

/**
 * Einfaches Toast-System, App-weit (im Gegensatz zu Komponenten-lokalem
 * State), damit ein Toast auch nach einer Navigation (z. B. Löschen ->
 * zurück zur Startseite) sichtbar bleibt.
 */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null); // { message, actionLabel, onAction }
  const timeoutRef = useRef(null);

  const showToast = useCallback(({ message, actionLabel, onAction }) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ message, actionLabel, onAction });
    timeoutRef.current = setTimeout(() => setToast(null), AUTO_DISMISS_MS);
  }, []);

  const dismissToast = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast(null);
  }, []);

  function handleAction() {
    toast?.onAction?.();
    dismissToast();
  }

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {toast && (
        <div className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-[var(--radius-chip)] bg-ink px-4 py-3 text-sm text-cream shadow-lg">
            <span>{toast.message}</span>
            {toast.actionLabel && (
              <button
                type="button"
                onClick={handleAction}
                className="font-semibold text-honey underline underline-offset-2"
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast() muss innerhalb von <ToastProvider> aufgerufen werden.");
  return ctx;
}
