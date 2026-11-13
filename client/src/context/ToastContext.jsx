import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = {
      id,
      type: toast.type || "info",
      title: toast.title,
      message: toast.message || "",
      duration: toast.duration || 3500,
    };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, newToast.duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, title) => addToast({ type: "success", message, title }),
    error: (message, title) => addToast({ type: "error", message, title }),
    info: (message, title) => addToast({ type: "info", message, title }),
    warning: (message, title) => addToast({ type: "warning", message, title }),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto rounded-xl p-3.5 shadow-2xl backdrop-blur-xl border flex items-start gap-3 animate-in slide-in-from-top-3 fade-in duration-200 transition-all bg-zinc-950/95 border-zinc-800 text-zinc-100"
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {t.type === "error" && <AlertCircle className="h-4 w-4 text-red-400" />}
              {t.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-400" />}
              {t.type === "info" && <Info className="h-4 w-4 text-orange-400" />}
            </div>

            <div className="flex-1 min-w-0">
              {t.title && <h5 className="text-xs font-bold leading-tight">{t.title}</h5>}
              <p className="text-xs text-zinc-300 leading-snug">{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
}
