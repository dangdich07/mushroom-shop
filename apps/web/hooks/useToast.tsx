"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Toast = { id: string; message: string };

type ToastContextType = {
  show: (message: string, durationMs?: number) => void;
  toasts: Toast[];
  remove: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, durationMs = 2000) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => remove(id), durationMs);
  }, [remove]);

  const value = useMemo(() => ({ show, toasts, remove }), [show, toasts, remove]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastViewport() {
  const { toasts, remove } = useToast();
  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999 }}>
      {toasts.map((t) => (
        <div key={t.id} onClick={() => remove(t.id)} style={{ background: 'rgba(0,0,0,0.85)', color: 'white', padding: '10px 14px', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', maxWidth: 320 }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}





