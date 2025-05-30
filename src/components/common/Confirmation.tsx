// src/components/common/Confirmation.tsx - Модальное окно подтверждения

interface ConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  loading?: boolean;
}

export function Confirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  type = "info",
  loading = false,
}: ConfirmationProps) {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: AlertTriangle,
      iconColor: "text-red-600",
      confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-yellow-600",
      confirmButton: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
    },
    info: {
      icon: MessageSquare,
      iconColor: "text-blue-600",
      confirmButton: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                type === "danger"
                  ? "bg-red-100"
                  : type === "warning"
                  ? "bg-yellow-100"
                  : "bg-blue-100"
              }`}
            >
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>

            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${config.confirmButton}`}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {confirmText}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 sm:flex-none inline-flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
