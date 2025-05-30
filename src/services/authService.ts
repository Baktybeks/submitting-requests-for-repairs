// src/services/authService.ts (Рефакторинг)

import { ID, Query, AppwriteException } from "appwrite";
import { account, databases, appwriteHelpers } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { User, UserRole } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Типы для API
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  specialization?: string;
  phone?: string;
}

interface NotActivatedUser {
  notActivated: true;
  message: string;
}

// API функции
export const authApi = {
  // Получить текущего пользователя
  getCurrentUser: async (): Promise<User | NotActivatedUser | null> => {
    try {
      // Проверяем сессию в Appwrite
      const appwriteUser = await account.get();

      if (!appwriteUser) {
        return null;
      }

      // Получаем профиль пользователя из базы данных
      const userProfile = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        appwriteUser.$id
      );

      const user = userProfile as unknown as User;

      // Проверяем активацию аккаунта
      if (!user.isActive) {
        return {
          notActivated: true,
          message: "Ваш аккаунт еще не активирован администратором",
        };
      }

      return user;
    } catch (error: any) {
      // Если ошибка 401 - пользователь не авторизован
      if (error.code === 401) {
        return null;
      }
      console.error("Ошибка при получении текущего пользователя:", error);
      throw appwriteHelpers.handleAppwriteError(error);
    }
  },

  // Авторизация
  login: async ({ email, password }: LoginCredentials): Promise<User> => {
    try {
      // Создаем сессию в Appwrite
      await account.createEmailPasswordSession(email, password);

      // Получаем профиль пользователя
      const currentUser = await authApi.getCurrentUser();

      if (!currentUser) {
        throw new Error("Не удалось получить данные пользователя после входа");
      }

      if ("notActivated" in currentUser) {
        // Завершаем сессию при неактивированном аккаунте
        await account.deleteSession("current");
        throw new Error(currentUser.message);
      }

      return currentUser;
    } catch (error: any) {
      console.error("Ошибка при входе:", error);

      // Более понятные сообщения об ошибках
      if (error.code === 401) {
        throw new Error("Неверный email или пароль");
      }

      if (error.message?.includes("не активирован")) {
        throw new Error(error.message);
      }

      throw appwriteHelpers.handleAppwriteError(error);
    }
  },

  // Выход из системы
  logout: async (): Promise<void> => {
    try {
      await account.deleteSession("current");
    } catch (error: any) {
      console.error("Ошибка при выходе:", error);
      // При ошибке выхода не блокируем очистку локального состояния
      throw appwriteHelpers.handleAppwriteError(error);
    }
  },

  // Регистрация
  register: async (
    data: RegisterData
  ): Promise<{ user: User; isFirstUser: boolean }> => {
    try {
      const { name, email, password, role, specialization, phone } = data;

      // Проверяем, первый ли это пользователь
      const adminCheck = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [Query.equal("role", UserRole.SUPER_ADMIN)]
      );

      const isFirstUser = adminCheck.total === 0;
      const finalRole = isFirstUser ? UserRole.SUPER_ADMIN : role;
      const isAutoActivated = isFirstUser;

      // Создаем аккаунт в Appwrite Auth
      const appwriteUser = await account.create(
        ID.unique(),
        email,
        password,
        name
      );

      // Создаем профиль пользователя в базе данных
      const userProfile = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        appwriteUser.$id,
        {
          name,
          email,
          role: finalRole,
          isActive: isAutoActivated,
          specialization: specialization || null,
          phone: phone || null,
          createdAt: new Date().toISOString(),
        }
      );

      const user = userProfile as unknown as User;

      // Если первый пользователь, сразу создаем сессию
      if (isFirstUser) {
        await account.createEmailPasswordSession(email, password);
      }

      return { user, isFirstUser };
    } catch (error: any) {
      console.error("Ошибка при регистрации:", error);

      // Более понятные сообщения об ошибках
      if (error.code === 409) {
        throw new Error("Пользователь с таким email уже существует");
      }

      if (error.message?.includes("Password")) {
        throw new Error("Пароль должен содержать минимум 8 символов");
      }

      throw appwriteHelpers.handleAppwriteError(error);
    }
  },

  // Получить всех пользователей (только для админов)
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [Query.orderDesc("$createdAt")]
      );

      return response.documents as unknown as User[];
    } catch (error: any) {
      console.error("Ошибка при получении пользователей:", error);
      throw appwriteHelpers.handleAppwriteError(error);
    }
  },

  // Получить неактивных пользователей
  getPendingUsers: async (): Promise<User[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [Query.equal("isActive", false), Query.orderDesc("$createdAt")]
      );

      return response.documents as unknown as User[];
    } catch (error: any) {
      console.error("Ошибка при получении неактивных пользователей:", error);
      throw appwriteHelpers.handleAppwriteError(error);
    }
  },

  // Получить активных техников
  getActiveTechnicians: async (): Promise<User[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [
          Query.equal("role", UserRole.TECHNICIAN),
          Query.equal("isActive", true),
          Query.orderAsc("name"),
        ]
      );

      return response.documents as unknown as User[];
    } catch (error: any) {
      console.error("Ошибка при получении техников:", error);
      throw appwriteHelpers.handleAppwriteError(error);
    }
  },

  // Активировать пользователя
  activateUser: async (userId: string): Promise<User> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        userId,
        { isActive: true }
      );

      return response as unknown as User;
    } catch (error: any) {
      console.error("Ошибка при активации пользователя:", error);
      throw appwriteHelpers.handleAppwriteError(error);
    }
  },

  // Деактивировать пользователя
  deactivateUser: async (userId: string): Promise<User> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        userId,
        { isActive: false }
      );

      return response as unknown as User;
    } catch (error: any) {
      console.error("Ошибка при деактивации пользователя:", error);
      throw appwriteHelpers.handleAppwriteError(error);
    }
  },

  // Создать пользователя (для админов)
  createUser: async (data: RegisterData): Promise<User> => {
    try {
      const { name, email, password, role, specialization, phone } = data;

      // Создаем аккаунт в Appwrite Auth
      const appwriteUser = await account.create(
        ID.unique(),
        email,
        password,
        name
      );

      // Создаем профиль пользователя в базе данных
      const userProfile = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        appwriteUser.$id,
        {
          name,
          email,
          role,
          isActive: true, // Пользователи, созданные админом, сразу активны
          specialization: specialization || null,
          phone: phone || null,
          createdAt: new Date().toISOString(),
        }
      );

      return userProfile as unknown as User;
    } catch (error: any) {
      console.error("Ошибка при создании пользователя:", error);
      throw appwriteHelpers.handleAppwriteError(error);
    }
  },

  // Обновить профиль пользователя
  updateUserProfile: async (
    userId: string,
    updates: Partial<User>
  ): Promise<User> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        userId,
        updates
      );

      return response as unknown as User;
    } catch (error: any) {
      console.error("Ошибка при обновлении профиля:", error);
      throw appwriteHelpers.handleAppwriteError(error);
    }
  },

  // Удалить пользователя
  deleteUser: async (userId: string): Promise<void> => {
    try {
      // Удаляем профиль из базы данных
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        userId
      );

      // TODO: Удаление аккаунта из Appwrite Auth требует серверной части
      // На данный момент только деактивируем профиль
    } catch (error: any) {
      console.error("Ошибка при удалении пользователя:", error);
      throw appwriteHelpers.handleAppwriteError(error);
    }
  },
};

// React Query ключи
export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "current"] as const,
  users: () => [...authKeys.all, "users"] as const,
  pendingUsers: () => [...authKeys.all, "pending"] as const,
  technicians: () => [...authKeys.all, "technicians"] as const,
  user: (id: string) => [...authKeys.users(), id] as const,
};

// React Query хуки

// Получение текущего пользователя
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authApi.getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 минут
    retry: (failureCount, error: any) => {
      // Не повторяем запрос при 401 ошибке
      if (error?.code === 401) return false;
      return failureCount < 2;
    },
  });
};

// Авторизация
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      // Обновляем кеш текущего пользователя
      queryClient.setQueryData(authKeys.currentUser(), user);
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: () => {
      // Очищаем кеш при ошибке
      queryClient.setQueryData(authKeys.currentUser(), null);
    },
  });
};

// Выход из системы
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Очищаем весь кеш пользователя
      queryClient.setQueryData(authKeys.currentUser(), null);
      queryClient.removeQueries({ queryKey: authKeys.all });
      // Сбрасываем кеш всех данных
      queryClient.clear();
    },
    onError: () => {
      // Очищаем кеш даже при ошибке (пользователь хочет выйти)
      queryClient.setQueryData(authKeys.currentUser(), null);
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
};

// Регистрация
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (result) => {
      // Если первый пользователь, обновляем кеш
      if (result.isFirstUser) {
        queryClient.setQueryData(authKeys.currentUser(), result.user);
      }
      // Инвалидируем списки пользователей
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
      queryClient.invalidateQueries({ queryKey: authKeys.pendingUsers() });
    },
  });
};

// Получение всех пользователей
export const useAllUsers = () => {
  return useQuery({
    queryKey: authKeys.users(),
    queryFn: authApi.getAllUsers,
    staleTime: 1000 * 60 * 2, // 2 минуты
  });
};

// Получение неактивных пользователей
export const usePendingUsers = () => {
  return useQuery({
    queryKey: authKeys.pendingUsers(),
    queryFn: authApi.getPendingUsers,
    staleTime: 1000 * 60 * 1, // 1 минута
  });
};

// Получение активных техников
export const useActiveTechnicians = () => {
  return useQuery({
    queryKey: authKeys.technicians(),
    queryFn: authApi.getActiveTechnicians,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

// Активация пользователя
export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.activateUser,
    onSuccess: () => {
      // Инвалидируем списки пользователей
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
      queryClient.invalidateQueries({ queryKey: authKeys.pendingUsers() });
      queryClient.invalidateQueries({ queryKey: authKeys.technicians() });
    },
  });
};

// Деактивация пользователя
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.deactivateUser,
    onSuccess: () => {
      // Инвалидируем списки пользователей
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
      queryClient.invalidateQueries({ queryKey: authKeys.pendingUsers() });
      queryClient.invalidateQueries({ queryKey: authKeys.technicians() });
    },
  });
};

// Создание пользователя
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.createUser,
    onSuccess: () => {
      // Инвалидируем списки пользователей
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
      queryClient.invalidateQueries({ queryKey: authKeys.technicians() });
    },
  });
};

// Обновление профиля пользователя
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<User>;
    }) => authApi.updateUserProfile(userId, updates),
    onSuccess: (updatedUser) => {
      // Обновляем кеш конкретного пользователя
      queryClient.setQueryData(authKeys.user(updatedUser.$id), updatedUser);

      // Если это текущий пользователь, обновляем его тоже
      const currentUser = queryClient.getQueryData(
        authKeys.currentUser()
      ) as User | null;
      if (currentUser && currentUser.$id === updatedUser.$id) {
        queryClient.setQueryData(authKeys.currentUser(), updatedUser);
      }

      // Инвалидируем списки
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
      queryClient.invalidateQueries({ queryKey: authKeys.technicians() });
    },
  });
};

// Удаление пользователя
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.deleteUser,
    onSuccess: () => {
      // Инвалидируем все списки пользователей
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
      queryClient.invalidateQueries({ queryKey: authKeys.pendingUsers() });
      queryClient.invalidateQueries({ queryKey: authKeys.technicians() });
    },
  });
};

// Проверка прав доступа (хуки)

export const usePermissions = () => {
  const { data: user } = useCurrentUser();

  // Приводим к типу User, если пользователь существует
  const activatedUser = user as User | null;

  return {
    canManageUsers:
      activatedUser?.role === UserRole.SUPER_ADMIN ||
      activatedUser?.role === UserRole.MANAGER,
    canManageRequests:
      activatedUser?.role === UserRole.SUPER_ADMIN ||
      activatedUser?.role === UserRole.MANAGER,
    canAssignTechnicians:
      activatedUser?.role === UserRole.SUPER_ADMIN ||
      activatedUser?.role === UserRole.MANAGER,
    canViewAllRequests:
      activatedUser?.role === UserRole.SUPER_ADMIN ||
      activatedUser?.role === UserRole.MANAGER,
    canCreateRequests:
      activatedUser?.role === UserRole.SUPER_ADMIN ||
      activatedUser?.role === UserRole.MANAGER ||
      activatedUser?.role === UserRole.REQUESTER,
    canUpdateRequestStatus:
      activatedUser?.role === UserRole.SUPER_ADMIN ||
      activatedUser?.role === UserRole.MANAGER ||
      activatedUser?.role === UserRole.TECHNICIAN,
    isSuper: activatedUser?.role === UserRole.SUPER_ADMIN,
    isManager: activatedUser?.role === UserRole.MANAGER,
    isTechnician: activatedUser?.role === UserRole.TECHNICIAN,
    isRequester: activatedUser?.role === UserRole.REQUESTER,
  };
};
