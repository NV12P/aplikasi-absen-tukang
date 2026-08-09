"use client";

import { useEffect, useState, useCallback, createContext, useContext } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Single Toast Item ────────────────────────────────────────────────────────

function ToastMessage({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enter = requestAnimationFrame(() => setVisible(true));

    // Auto-dismiss setelah 3.5 detik
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(item.id), 300); // tunggu exit animation
    }, 3500);

    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(timer);
    };
  }, [item.id, onRemove]);

  const configs: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
    success: {
      bg: "bg-green-50 border-green-200 text-green-800",
      icon: (
        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      bg: "bg-red-50 border-red-200 text-red-800",
      icon: (
        <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    info: {
      bg: "bg-blue-50 border-blue-200 text-blue-800",
      icon: (
        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const { bg, icon } = configs[item.type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-md text-sm font-medium
        transition-all duration-300 max-w-sm w-full
        ${bg}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `}
    >
      {icon}
      <span className="flex-1">{item.message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(item.id), 300); }}
        className="opacity-60 hover:opacity-100 transition-opacity ml-1"
        aria-label="Tutup notifikasi"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((message: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, message }]); // max 5
  }, []);

  const ctx: ToastContextValue = {
    toast: add,
    success: (msg) => add(msg, "success"),
    error: (msg) => add(msg, "error"),
    info: (msg) => add(msg, "info"),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast container — pojok kanan bawah */}
      <div
        aria-label="Notifikasi"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastMessage item={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam ToastProvider");
  return ctx;
}
