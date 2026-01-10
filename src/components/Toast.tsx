"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-4 w-80 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="pointer-events-auto"
                        >
                            <div className={cn(
                                "glass p-4 border flex items-start gap-3 shadow-2xl relative overflow-hidden group",
                                toast.type === "success" && "border-emerald-500/20 bg-emerald-500/5",
                                toast.type === "error" && "border-fall/20 bg-fall/5",
                                toast.type === "warning" && "border-amber-500/20 bg-amber-500/5",
                                toast.type === "info" && "border-blue-500/20 bg-blue-500/5"
                            )}>
                                {/* Type Icon */}
                                <div className={cn(
                                    "p-2 rounded-lg shrink-0",
                                    toast.type === "success" && "bg-emerald-500/10 text-emerald-500",
                                    toast.type === "error" && "bg-fall/10 text-fall",
                                    toast.type === "warning" && "bg-amber-500/10 text-amber-500",
                                    toast.type === "info" && "bg-blue-500/10 text-blue-500"
                                )}>
                                    {toast.type === "success" && <CheckCircle size={18} />}
                                    {toast.type === "error" && <AlertCircle size={18} />}
                                    {toast.type === "warning" && <AlertCircle size={18} />}
                                    {toast.type === "info" && <Info size={18} />}
                                </div>

                                <div className="flex-1 pt-1">
                                    <p className="text-sm font-bold text-white leading-relaxed">{toast.message}</p>
                                </div>

                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="p-1 hover:bg-white/5 rounded-md text-slate-500 hover:text-white transition-all"
                                >
                                    <X size={14} />
                                </button>

                                {/* Animated Progress Bar */}
                                <motion.div
                                    initial={{ width: "100%" }}
                                    animate={{ width: "0%" }}
                                    transition={{ duration: 4, ease: "linear" }}
                                    className={cn(
                                        "absolute bottom-0 left-0 h-0.5 opacity-30",
                                        toast.type === "success" && "bg-emerald-500",
                                        toast.type === "error" && "bg-fall",
                                        toast.type === "warning" && "bg-amber-500",
                                        toast.type === "info" && "bg-blue-500"
                                    )}
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
};
