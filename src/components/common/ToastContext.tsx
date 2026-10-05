'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = ({ type, title, message }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const success = (title: string, message?: string) => showToast({ type: 'success', title, message });
  const error = (title: string, message?: string) => showToast({ type: 'error', title, message });
  const warning = (title: string, message?: string) => showToast({ type: 'warning', title, message });
  const info = (title: string, message?: string) => showToast({ type: 'info', title, message });

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              toast.type === 'success'
                ? 'bg-white border-[#1FA85A]/30 text-[#0B1B3F]'
                : toast.type === 'error'
                ? 'bg-white border-[#E5383B]/30 text-[#0B1B3F]'
                : toast.type === 'warning'
                ? 'bg-white border-[#F5A524]/30 text-[#0B1B3F]'
                : 'bg-white border-[#1F6BFF]/30 text-[#0B1B3F]'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#1FA85A]" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#E5383B]" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#F5A524]" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-[#1F6BFF]" />}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{toast.title}</h4>
              {toast.message && <p className="text-xs text-gray-600 mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
