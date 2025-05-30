// src/components/common/EmptyState.tsx - Пустое состояние

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  };
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  size = "md",
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: "py-8",
      icon: "h-8 w-8",
      title: "text-base",
      description: "text-sm",
    },
    md: {
      container: "py-12",
      icon: "h-12 w-12",
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "py-16",
      icon: "h-16 w-16",
      title: "text-xl",
      description: "text-base",
    },
  };

  return (
    <div className={`text-center ${sizeClasses[size].container}`}>
      {Icon && (
        <Icon
          className={`mx-auto ${sizeClasses[size].icon} text-gray-400 mb-4`}
        />
      )}

      <h3
        className={`font-medium text-gray-900 mb-2 ${sizeClasses[size].title}`}
      >
        {title}
      </h3>

      {description && (
        <p
          className={`text-gray-600 mb-6 max-w-sm mx-auto ${sizeClasses[size].description}`}
        >
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
            action.variant === "secondary"
              ? "text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500"
              : "text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
          }`}
        >
          {action.label}
        </button>
      )}

      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
