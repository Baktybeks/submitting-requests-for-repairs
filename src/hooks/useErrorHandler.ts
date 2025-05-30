// src/hooks/useErrorHandler.ts - Хук для обработки ошибок

import { useCallback } from "react";
import { toast } from "react-toastify";

interface ErrorHandlerOptions {
  showToast?: boolean;
  toastPosition?:
    | "top-center"
    | "top-right"
    | "top-left"
    | "bottom-center"
    | "bottom-right"
    | "bottom-left";
  logError?: boolean;
  onError?: (error: Error) => void;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    showToast = true,
    toastPosition = "top-center",
    logError = true,
    onError,
  } = options;

  const handleError = useCallback(
    (error: Error | unknown, context?: string) => {
      const err = error instanceof Error ? error : new Error(String(error));

      if (logError) {
        console.error(`Ошибка${context ? ` в ${context}` : ""}:`, err);
      }

      if (showToast) {
        const message = err.message || "Произошла неожиданная ошибка";
        toast.error(`❌ ${message}`, {
          position: toastPosition,
          autoClose: 5000,
        });
      }

      onError?.(err);
    },
    [showToast, toastPosition, logError, onError]
  );

  const handleAsyncError = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      context?: string
    ): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (error) {
        handleError(error, context);
        return null;
      }
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
  };
}
