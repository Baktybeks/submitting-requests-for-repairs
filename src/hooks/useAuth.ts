// src/hooks/useAuth.ts (Исправленная версия)

import { useAuthStore } from "@/store/authStore";
import {
  useCurrentUser,
  useLogin,
  useLogout,
  useRegister,
  usePermissions,
} from "@/services/authService";
import { useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { UserRole } from "@/types";

// Типы для хука
interface AuthHookReturn {
  // Состояние пользователя
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isActive: boolean;

  // Действия аутентификации
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    specialization?: string,
    phone?: string
  ) => Promise<any>;
  clearError: () => void;

  // Статусы операций
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isRegistering: boolean;
  isCheckingAuth: boolean;

  // Проверки ролей
  isSuper: boolean;
  isManager: boolean;
  isTechnician: boolean;
  isRequester: boolean;

  // Проверки прав доступа
  canManageUsers: boolean;
  canManageRequests: boolean;
  canAssignTechnicians: boolean;
  canViewAllRequests: boolean;
  canCreateRequests: boolean;
  canUpdateRequestStatus: boolean;
}

// Функция-помощник для безопасной проверки типа
const isNotActivatedUser = (user: any): user is { notActivated: true } => {
  return (
    user !== null &&
    user !== undefined &&
    typeof user === "object" &&
    "notActivated" in user
  );
};

const isValidUser = (user: any): boolean => {
  return (
    user !== null &&
    user !== undefined &&
    typeof user === "object" &&
    !("notActivated" in user)
  );
};

export function useAuth(): AuthHookReturn {
  const { user, setUser, clearUser } = useAuthStore();

  // React Query хуки
  const {
    data: currentUser,
    isLoading: isCheckingAuth,
    error: authError,
    refetch: refetchCurrentUser, // ИСПРАВЛЕНО: правильное название свойства
  } = useCurrentUser();

  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const registerMutation = useRegister();
  const permissions = usePermissions();

  // ИСПРАВЛЕНО: Безопасная синхронизация состояния Zustand с React Query
  useEffect(() => {
    try {
      // Проверяем, что currentUser определен и является объектом
      if (isValidUser(currentUser)) {
        setUser(currentUser);
      } else if (
        currentUser === null ||
        currentUser === undefined ||
        isNotActivatedUser(currentUser)
      ) {
        clearUser();
      }
    } catch (error) {
      console.error("Ошибка при синхронизации пользователя:", error);
      clearUser();
    }
  }, [currentUser, setUser, clearUser]);

  // Мемоизированные функции для компонентов
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const user = await loginMutation.mutateAsync({ email, password });
        setUser(user);
        return user;
      } catch (error: any) {
        clearUser();

        // Обработка специфичных ошибок входа
        const message = error?.message || "Неизвестная ошибка при входе";

        if (
          message.includes("не активирован") ||
          message.includes("not activated")
        ) {
          // Не показываем toast для неактивированных аккаунтов,
          // это обрабатывается в компоненте
        } else if (
          message.includes("Неверный") ||
          message.includes("Invalid")
        ) {
          toast.error("❌ Неверный email или пароль", {
            position: "top-center",
            autoClose: 4000,
          });
        } else {
          toast.error(`❌ ${message}`, {
            position: "top-center",
            autoClose: 5000,
          });
        }

        throw error;
      }
    },
    [loginMutation, setUser, clearUser]
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
      clearUser();
      toast.success("👋 Вы успешно вышли из системы", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error: any) {
      // Даже при ошибке очищаем локальное состояние
      clearUser();
      console.warn("Ошибка при выходе, но сессия очищена:", error);
      toast.warning("⚠️ Произошла ошибка при выходе, но сессия очищена", {
        position: "top-right",
        autoClose: 4000,
      });
      throw error;
    }
  }, [logoutMutation, clearUser]);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: UserRole,
      specialization?: string,
      phone?: string
    ) => {
      try {
        const result = await registerMutation.mutateAsync({
          name,
          email,
          password,
          role,
          specialization,
          phone,
        });

        // Если первый пользователь (супер-админ), автоматически авторизуем
        if (result.isFirstUser) {
          setUser(result.user);
        }

        return result;
      } catch (error: any) {
        // Детализированная обработка ошибок регистрации
        const message = error?.message || "Неизвестная ошибка при регистрации";

        if (
          message.includes("уже существует") ||
          message.includes("already exists")
        ) {
          toast.error("📧 Пользователь с таким email уже зарегистрирован", {
            position: "top-center",
            autoClose: 5000,
          });
        } else if (message.includes("пароль") || message.includes("password")) {
          toast.error("🔒 Пароль должен содержать минимум 8 символов", {
            position: "top-center",
            autoClose: 5000,
          });
        } else if (message.includes("email") || message.includes("Email")) {
          toast.error("📧 Некорректный формат email адреса", {
            position: "top-center",
            autoClose: 5000,
          });
        } else {
          toast.error(`❌ Ошибка регистрации: ${message}`, {
            position: "top-center",
            autoClose: 5000,
          });
        }

        throw error;
      }
    },
    [registerMutation, setUser]
  );

  const clearError = useCallback(() => {
    // Сбрасываем ошибки мутаций, если нужно
    loginMutation.reset();
    logoutMutation.reset();
    registerMutation.reset();
  }, [loginMutation, logoutMutation, registerMutation]);

  // Обработка ошибок аутентификации
  useEffect(() => {
    if (authError && !isCheckingAuth) {
      console.error("Ошибка аутентификации:", authError);

      // Показываем toast только при серьезных ошибках
      if (authError.message && !authError.message.includes("401")) {
        toast.error("🔐 Проблема с аутентификацией. Попробуйте войти заново", {
          position: "top-center",
          autoClose: 5000,
        });
      }
    }
  }, [authError, isCheckingAuth]);

  // Вычисляемые свойства состояния
  const isAuthenticated = !!user;
  const isActive = user?.isActive === true;
  const loading =
    isCheckingAuth ||
    loginMutation.isPending ||
    logoutMutation.isPending ||
    registerMutation.isPending;

  // Объединенные ошибки
  const error =
    authError?.message ||
    loginMutation.error?.message ||
    logoutMutation.error?.message ||
    registerMutation.error?.message ||
    null;

  // Проверки ролей
  const isSuper = user?.role === UserRole.SUPER_ADMIN;
  const isManager = user?.role === UserRole.MANAGER;
  const isTechnician = user?.role === UserRole.TECHNICIAN;
  const isRequester = user?.role === UserRole.REQUESTER;

  return {
    // Состояние пользователя
    user,
    loading,
    error,
    isAuthenticated,
    isActive,

    // Действия аутентификации
    login,
    logout,
    register,
    clearError,

    // Статусы операций
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRegistering: registerMutation.isPending,
    isCheckingAuth,

    // Проверки ролей
    isSuper,
    isManager,
    isTechnician,
    isRequester,

    // Проверки прав доступа (из usePermissions)
    canManageUsers: permissions.canManageUsers,
    canManageRequests: permissions.canManageRequests,
    canAssignTechnicians: permissions.canAssignTechnicians,
    canViewAllRequests: permissions.canViewAllRequests,
    canCreateRequests: permissions.canCreateRequests,
    canUpdateRequestStatus: permissions.canUpdateRequestStatus,
  };
}

// Дополнительные хуки для удобства

// Хук для проверки конкретной роли
export function useRole(requiredRole: UserRole): boolean {
  const { user } = useAuth();
  return user?.role === requiredRole;
}

// Хук для проверки нескольких ролей
export function useRoles(allowedRoles: UserRole[]): boolean {
  const { user } = useAuth();
  return user ? allowedRoles.includes(user.role) : false;
}

// Хук для защищенных действий
export function useProtectedAction(
  requiredPermission: keyof ReturnType<typeof usePermissions>
) {
  const permissions = usePermissions();

  return useCallback(
    (action: () => void | Promise<void>) => {
      if (permissions[requiredPermission]) {
        return action();
      } else {
        toast.error("❌ У вас нет прав для выполнения этого действия", {
          position: "top-center",
          autoClose: 4000,
        });
      }
    },
    [permissions, requiredPermission]
  );
}

// ИСПРАВЛЕНО: Хук для автообновления токена
export function useAuthRefresh() {
  const { data: currentUser, refetch: refetchCurrentUser } = useCurrentUser(); // ИСПРАВЛЕНО

  useEffect(() => {
    // Проверяем сессию каждые 15 минут
    const interval = setInterval(() => {
      refetchCurrentUser();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refetchCurrentUser]); // ИСПРАВЛЕНО
}

// Хук для отслеживания времени неактивности
export function useIdleTimer(
  onIdle: () => void,
  timeoutMs: number = 30 * 60 * 1000
) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(onIdle, timeoutMs);
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    // Устанавливаем начальный таймер
    resetTimer();

    // Добавляем слушатели событий
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [isAuthenticated, onIdle, timeoutMs]);
}

// ИСПРАВЛЕНО: Хук для уведомлений о статусе аутентификации
export function useAuthNotifications() {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Проверяем, что мы в браузере
    if (typeof window === "undefined") return;

    if (isAuthenticated && user) {
      // Уведомление при успешном входе (только при первой загрузке)
      const hasShownWelcome = sessionStorage.getItem("auth_welcome_shown");
      if (!hasShownWelcome) {
        toast.success(`Добро пожаловать, ${user.name}!`, {
          position: "top-right",
          autoClose: 3000,
        });
        sessionStorage.setItem("auth_welcome_shown", "true");
      }
    } else {
      // Очищаем флаг при выходе
      sessionStorage.removeItem("auth_welcome_shown");
    }
  }, [isAuthenticated, user]);
}
