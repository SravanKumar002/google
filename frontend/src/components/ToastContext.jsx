import { createContext, useContext, useState, useCallback } from "react";
import Toast from "./Toast";

/**
 * Toast Context
 * Provides toast notification functionality throughout the app
 */
const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Convenience methods
  const success = useCallback(
    (message, duration) => addToast(message, "success", duration),
    [addToast]
  );
  const error = useCallback(
    (message, duration) => addToast(message, "error", duration),
    [addToast]
  );
  const warning = useCallback(
    (message, duration) => addToast(message, "warning", duration),
    [addToast]
  );
  const info = useCallback(
    (message, duration) => addToast(message, "info", duration),
    [addToast]
  );

  // showToast method (message, type)
  const showToast = useCallback(
    (message, type = "info") => addToast(message, type),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
        showToast,
      }}
    >
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
