// src/components/common/Alert.tsx - Компонент уведомлений

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  }>;
}

export function Alert({
  type,
  title,
  message,
  dismissible = false,
  onDismiss,
  actions,
}: AlertProps) {
  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-400",
      titleColor: "text-green-800",
      textColor: "text-green-700",
    },
    error: {
      icon: AlertTriangle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-400",
      titleColor: "text-red-800",
      textColor: "text-red-700",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-400",
      titleColor: "text-yellow-800",
      textColor: "text-yellow-700",
    },
    info: {
      icon: MessageSquare,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-400",
      titleColor: "text-blue-800",
      textColor: "text-blue-700",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-md p-4 ${config.bgColor} ${config.borderColor} border`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>

        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.titleColor} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${config.textColor}`}>{message}</p>

          {actions && actions.length > 0 && (
            <div className="mt-3 flex space-x-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`text-sm font-medium underline hover:no-underline ${
                    action.variant === "secondary"
                      ? config.textColor
                      : config.titleColor
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 ${config.textColor} hover:${config.bgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${config.bgColor} focus:ring-${config.iconColor}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
