// src/components/common/ErrorBoundary.tsx - Система обработки ошибок

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, MessageSquare } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary поймал ошибку:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Отправляем ошибку в систему мониторинга
    this.props.onError?.(error, errorInfo);

    // В продакшене можно отправить в сервис мониторинга
    if (process.env.NODE_ENV === "production") {
      // Например, в Sentry
      // Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>

              <h1 className="mt-4 text-xl font-semibold text-gray-900">
                Произошла ошибка
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                Извините, произошла неожиданная ошибка. Мы уже работаем над её
                исправлением.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4 w-full">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Детали ошибки (только для разработки)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-left overflow-auto max-h-40">
                    <div className="font-semibold text-red-600 mb-2">
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="mt-2 text-gray-600">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Попробовать снова
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <Home className="h-4 w-4 mr-2" />
                  На главную
                </button>
              </div>

              <button
                onClick={this.handleReload}
                className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Перезагрузить страницу
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
