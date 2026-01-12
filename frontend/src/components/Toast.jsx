/**
 * Toast Notification Component
 * Shows temporary notifications for user actions
 */

import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

// Toast types with corresponding styles and icons
const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconColor: "text-green-500",
    textColor: "text-green-800",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-500",
    textColor: "text-red-800",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    iconColor: "text-yellow-500",
    textColor: "text-yellow-800",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-500",
    textColor: "text-blue-800",
  },
};

// Individual Toast Item
const ToastItem = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const config = toastConfig[toast.type] || toastConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    if (toast.duration !== Infinity) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onDismiss(toast.id), 300);
      }, toast.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
        ${config.bgColor} ${config.borderColor}
        transform transition-all duration-300 ease-in-out
        ${
          isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
        }
      `}
    >
      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`font-medium ${config.textColor}`}>{toast.title}</p>
        )}
        <p className={`text-sm ${config.textColor}`}>{toast.message}</p>
      </div>
      <button
        onClick={handleDismiss}
        className={`p-1 rounded-full hover:bg-white/50 ${config.iconColor}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast Container - renders at top-right of screen
const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
