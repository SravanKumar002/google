/**
 * Toast Context
 * Provides toast notification functionality throughout the app
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import ToastContainer from "../components/Toast";

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", options = {}) => {
    const id = ++toastId;
    const toast = {
      id,
      message,
      type,
      title: options.title,
      duration: options.duration ?? 3000,
    };

    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message, options = {}) => addToast(message, "success", options),
    [addToast]
  );

  const error = useCallback(
    (message, options = {}) => addToast(message, "error", options),
    [addToast]
  );

  const warning = useCallback(
    (message, options = {}) => addToast(message, "warning", options),
    [addToast]
  );

  const info = useCallback(
    (message, options = {}) => addToast(message, "info", options),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ addToast, dismissToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default ToastContext;
