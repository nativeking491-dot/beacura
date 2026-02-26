import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = "info", duration = 3500) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        setToasts(prev => [...prev, { id, message, type, duration }]);
        setTimeout(() => dismissToast(id), duration);
    }, [dismissToast]);

    return (
        <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
            {children}
            {/* Toast container — fixed bottom-center */}
            <div style={{
                position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
                zIndex: 9999, display: "flex", flexDirection: "column", gap: "8px",
                alignItems: "center", pointerEvents: "none", maxWidth: "420px", width: "90vw",
            }}>
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

/* ─── Individual Toast ─── */

const ICONS: Record<ToastType, string> = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
};

const COLORS: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
    success: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", text: "#065f46", icon: "#10b981" },
    error: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", text: "#991b1b", icon: "#ef4444" },
    warning: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", text: "#92400e", icon: "#f59e0b" },
    info: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", text: "#1e40af", icon: "#3b82f6" },
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: () => void }> = ({ toast, onDismiss }) => {
    const c = COLORS[toast.type];
    return (
        <div
            onClick={onDismiss}
            style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 18px", borderRadius: "14px",
                background: c.bg, border: `1px solid ${c.border}`,
                backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                color: c.text, fontSize: "14px", fontWeight: 600,
                pointerEvents: "auto", cursor: "pointer",
                animation: "toast-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
                width: "100%",
            }}
        >
            <span style={{
                width: "24px", height: "24px", borderRadius: "8px",
                background: c.icon, color: "white", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 800, flexShrink: 0,
            }}>
                {ICONS[toast.type]}
            </span>
            <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
        </div>
    );
};
