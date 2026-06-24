"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastType = "success" | "error" | "info";

type ShowToastInput = {
  type: ToastType;
  title: string;
  description?: string;
};

type Toast = ShowToastInput & {
  id: number;
};

type ToastContextValue = {
  showToast: (toast: ShowToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toastStyles: Record<
  ToastType,
  { accent: string; label: string; dot: string }
> = {
  success: {
    accent: "border-emerald-500/25",
    label: "text-emerald-300/90",
    dot: "bg-emerald-400/80",
  },
  error: {
    accent: "border-red-500/25",
    label: "text-red-300/90",
    dot: "bg-red-400/80",
  },
  info: {
    accent: "border-neutral-700",
    label: "text-neutral-300",
    dot: "bg-neutral-400",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }, []);

  const showToast = useCallback(
    (toast: ShowToastInput) => {
      const id = Date.now() + Math.random();

      setToasts((currentToasts) => [...currentToasts, { ...toast, id }]);
      window.setTimeout(() => dismissToast(id), 3000);
    },
    [dismissToast],
  );

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <div className="fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:bottom-6 sm:right-6 sm:w-full">
        {toasts.map((toast) => {
          const styles = toastStyles[toast.type];

          return (
            <div
              key={toast.id}
              className={`rounded-xl border ${styles.accent} bg-[#0b0b0b]/95 p-4 text-white shadow-2xl shadow-black/40 backdrop-blur`}
              role="status"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${styles.dot}`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-medium uppercase tracking-wide ${styles.label}`}>
                    {toast.type}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-50">
                    {toast.title}
                  </p>
                  {toast.description && (
                    <p className="mt-1 text-sm leading-5 text-neutral-400">
                      {toast.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="rounded-lg px-2 py-1 text-sm font-medium text-neutral-500 transition hover:bg-neutral-900 hover:text-white"
                  aria-label="Dismiss notification"
                >
                  x
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
