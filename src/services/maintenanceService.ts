// src/services/maintenanceService.ts

import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import {
  MaintenanceRequest,
  MaintenanceRequestWithDetails,
  CreateMaintenanceRequestDto,
  UpdateMaintenanceRequestDto,
  RequestComment,
  CreateCommentDto,
  RequestHistory,
  RequestFilters,
  DashboardStats,
  RequestStatus,
  RequestCategory,
  RequestPriority,
  User,
} from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const maintenanceApi = {
  // === ЗАЯВКИ ===

  // Получить все заявки с фильтрацией
  getRequests: async (
    filters?: RequestFilters
  ): Promise<MaintenanceRequest[]> => {
    try {
      const queries: string[] = [Query.orderDesc("$createdAt")];

      if (filters?.status?.length) {
        queries.push(Query.equal("status", filters.status));
      }
      if (filters?.category?.length) {
        queries.push(Query.equal("category", filters.category));
      }
      if (filters?.priority?.length) {
        queries.push(Query.equal("priority", filters.priority));
      }
      if (filters?.assignedTechnicianId) {
        queries.push(
          Query.equal("assignedTechnicianId", filters.assignedTechnicianId)
        );
      }
      if (filters?.requesterId) {
        queries.push(Query.equal("requesterId", filters.requesterId));
      }
      if (filters?.dateFrom) {
        queries.push(Query.greaterThanEqual("$createdAt", filters.dateFrom));
      }
      if (filters?.dateTo) {
        queries.push(Query.lessThanEqual("$createdAt", filters.dateTo));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.maintenanceRequests,
        queries
      );

      let requests = response.documents as unknown as MaintenanceRequest[];

      // Фильтрация по поисковому запросу (клиентская сторона)
      if (filters?.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        requests = requests.filter(
          (request) =>
            request.title.toLowerCase().includes(searchLower) ||
            request.description.toLowerCase().includes(searchLower) ||
            request.location.toLowerCase().includes(searchLower)
        );
      }

      return requests;
    } catch (error) {
      console.error("Ошибка при получении заявок:", error);
      return [];
    }
  },

  // Получить заявку по ID с дополнительной информацией
  getRequestById: async (
    id: string
  ): Promise<MaintenanceRequestWithDetails | null> => {
    try {
      const request = (await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.maintenanceRequests,
        id
      )) as unknown as MaintenanceRequest;

      // Получаем информацию о пользователях
      const requester = (await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        request.requesterId
      )) as unknown as User;

      let assignedTechnician = null;
      if (request.assignedTechnicianId) {
        assignedTechnician = (await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.users,
          request.assignedTechnicianId
        )) as unknown as User;
      }

      let manager = null;
      if (request.managerId) {
        manager = (await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.users,
          request.managerId
        )) as unknown as User;
      }

      // Получаем комментарии
      const commentsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.requestComments,
        [Query.equal("requestId", id), Query.orderAsc("$createdAt")]
      );

      // Получаем историю
      const historyResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.requestHistory,
        [Query.equal("requestId", id), Query.orderDesc("$createdAt")]
      );

      return {
        ...request,
        requester,
        assignedTechnician,
        manager,
        comments: commentsResponse.documents as unknown as RequestComment[],
        history: historyResponse.documents as unknown as RequestHistory[],
      };
    } catch (error) {
      console.error("Ошибка при получении заявки:", error);
      return null;
    }
  },

  // Создать новую заявку
  createRequest: async (
    data: CreateMaintenanceRequestDto,
    requesterId: string
  ): Promise<MaintenanceRequest> => {
    try {
      const requestData = {
        ...data,
        requesterId,
        status: RequestStatus.NEW,
        createdAt: new Date().toISOString(),
      };

      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.maintenanceRequests,
        ID.unique(),
        requestData
      );

      // Создаем запись в истории
      await maintenanceApi.addHistoryEntry(
        response.$id,
        requesterId,
        "CREATE",
        "",
        "",
        "Заявка создана"
      );

      return response as unknown as MaintenanceRequest;
    } catch (error) {
      console.error("Ошибка при создании заявки:", error);
      throw error;
    }
  },

  // Обновить заявку
  updateRequest: async (
    id: string,
    data: UpdateMaintenanceRequestDto,
    userId: string
  ): Promise<MaintenanceRequest> => {
    try {
      // Получаем текущую заявку для сравнения изменений
      const currentRequest = (await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.maintenanceRequests,
        id
      )) as unknown as MaintenanceRequest;

      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.maintenanceRequests,
        id,
        data
      );

      // Создаем записи в истории для изменённых полей
      for (const [key, newValue] of Object.entries(data)) {
        if (
          newValue !== undefined &&
          currentRequest[key as keyof MaintenanceRequest] !== newValue
        ) {
          const oldValue = currentRequest[key as keyof MaintenanceRequest];
          await maintenanceApi.addHistoryEntry(
            id,
            userId,
            "UPDATE",
            String(oldValue || ""),
            String(newValue),
            `Изменено поле "${key}"`
          );
        }
      }

      return response as unknown as MaintenanceRequest;
    } catch (error) {
      console.error("Ошибка при обновлении заявки:", error);
      throw error;
    }
  },

  // Удалить заявку
  deleteRequest: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.maintenanceRequests,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении заявки:", error);
      throw error;
    }
  },

  // === КОММЕНТАРИИ ===

  // Добавить комментарий к заявке
  addComment: async (
    data: CreateCommentDto,
    authorId: string
  ): Promise<RequestComment> => {
    try {
      const commentData = {
        ...data,
        authorId,
        createdAt: new Date().toISOString(),
      };

      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.requestComments,
        ID.unique(),
        commentData
      );

      // Добавляем запись в историю
      await maintenanceApi.addHistoryEntry(
        data.requestId,
        authorId,
        "COMMENT",
        "",
        data.text.substring(0, 100),
        "Добавлен комментарий"
      );

      return response as unknown as RequestComment;
    } catch (error) {
      console.error("Ошибка при добавлении комментария:", error);
      throw error;
    }
  },

  // Получить комментарии заявки
  getCommentsByRequestId: async (
    requestId: string
  ): Promise<RequestComment[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.requestComments,
        [Query.equal("requestId", requestId), Query.orderAsc("$createdAt")]
      );

      return response.documents as unknown as RequestComment[];
    } catch (error) {
      console.error("Ошибка при получении комментариев:", error);
      return [];
    }
  },

  // === ИСТОРИЯ ===

  // Добавить запись в историю
  addHistoryEntry: async (
    requestId: string,
    userId: string,
    action: string,
    oldValue: string,
    newValue: string,
    description: string
  ): Promise<RequestHistory> => {
    try {
      const historyData = {
        requestId,
        userId,
        action,
        oldValue,
        newValue,
        description,
        createdAt: new Date().toISOString(),
      };

      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.requestHistory,
        ID.unique(),
        historyData
      );

      return response as unknown as RequestHistory;
    } catch (error) {
      console.error("Ошибка при добавлении записи в историю:", error);
      throw error;
    }
  },

  // Получить историю заявки
  getHistoryByRequestId: async (
    requestId: string
  ): Promise<RequestHistory[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.requestHistory,
        [Query.equal("requestId", requestId), Query.orderDesc("$createdAt")]
      );

      return response.documents as unknown as RequestHistory[];
    } catch (error) {
      console.error("Ошибка при получении истории:", error);
      return [];
    }
  },

  // === СТАТИСТИКА ===

  // Получить статистику для дашборда
  getDashboardStats: async (filters?: {
    assignedTechnicianId?: string;
    requesterId?: string;
  }): Promise<DashboardStats> => {
    try {
      const queries: string[] = [];

      if (filters?.assignedTechnicianId) {
        queries.push(
          Query.equal("assignedTechnicianId", filters.assignedTechnicianId)
        );
      }
      if (filters?.requesterId) {
        queries.push(Query.equal("requesterId", filters.requesterId));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.maintenanceRequests,
        queries
      );

      const requests = response.documents as unknown as MaintenanceRequest[];

      const stats: DashboardStats = {
        totalRequests: requests.length,
        newRequests: requests.filter((r) => r.status === RequestStatus.NEW)
          .length,
        inProgressRequests: requests.filter(
          (r) => r.status === RequestStatus.IN_PROGRESS
        ).length,
        completedRequests: requests.filter(
          (r) => r.status === RequestStatus.COMPLETED
        ).length,
        urgentRequests: requests.filter(
          (r) => r.priority === RequestPriority.URGENT
        ).length,
        averageCompletionTime: 0, // Будет рассчитано позже
        requestsByCategory: {
          [RequestCategory.ELECTRICAL]: 0,
          [RequestCategory.PLUMBING]: 0,
          [RequestCategory.HVAC]: 0,
          [RequestCategory.CARPENTRY]: 0,
          [RequestCategory.PAINTING]: 0,
          [RequestCategory.CLEANING]: 0,
          [RequestCategory.OTHER]: 0,
        },
        requestsByPriority: {
          [RequestPriority.LOW]: 0,
          [RequestPriority.MEDIUM]: 0,
          [RequestPriority.HIGH]: 0,
          [RequestPriority.URGENT]: 0,
        },
      };

      // Подсчитываем статистику по категориям и приоритетам
      requests.forEach((request) => {
        stats.requestsByCategory[request.category]++;
        stats.requestsByPriority[request.priority]++;
      });

      // Рассчитываем среднее время выполнения для завершённых заявок
      const completedWithDates = requests.filter(
        (r) =>
          r.status === RequestStatus.COMPLETED &&
          r.actualCompletionDate &&
          r.$createdAt
      );

      if (completedWithDates.length > 0) {
        const totalHours = completedWithDates.reduce((sum, request) => {
          const created = new Date(request.$createdAt).getTime();
          const completed = new Date(request.actualCompletionDate!).getTime();
          return sum + (completed - created) / (1000 * 60 * 60); // в часах
        }, 0);

        stats.averageCompletionTime = totalHours / completedWithDates.length;
      }

      return stats;
    } catch (error) {
      console.error("Ошибка при получении статистики:", error);
      return {
        totalRequests: 0,
        newRequests: 0,
        inProgressRequests: 0,
        completedRequests: 0,
        urgentRequests: 0,
        averageCompletionTime: 0,
        requestsByCategory: {
          [RequestCategory.ELECTRICAL]: 0,
          [RequestCategory.PLUMBING]: 0,
          [RequestCategory.HVAC]: 0,
          [RequestCategory.CARPENTRY]: 0,
          [RequestCategory.PAINTING]: 0,
          [RequestCategory.CLEANING]: 0,
          [RequestCategory.OTHER]: 0,
        },
        requestsByPriority: {
          [RequestPriority.LOW]: 0,
          [RequestPriority.MEDIUM]: 0,
          [RequestPriority.HIGH]: 0,
          [RequestPriority.URGENT]: 0,
        },
      };
    }
  },
};

// React Query ключи
export const maintenanceKeys = {
  all: ["maintenance"] as const,
  requests: () => [...maintenanceKeys.all, "requests"] as const,
  request: (id: string) => [...maintenanceKeys.requests(), id] as const,
  requestsWithFilters: (filters?: RequestFilters) =>
    [...maintenanceKeys.requests(), filters] as const,
  comments: (requestId: string) =>
    [...maintenanceKeys.all, "comments", requestId] as const,
  history: (requestId: string) =>
    [...maintenanceKeys.all, "history", requestId] as const,
  stats: (filters?: { assignedTechnicianId?: string; requesterId?: string }) =>
    [...maintenanceKeys.all, "stats", filters] as const,
};

// React Query хуки

// Получение заявок с фильтрацией
export const useRequests = (filters?: RequestFilters) => {
  return useQuery({
    queryKey: maintenanceKeys.requestsWithFilters(filters),
    queryFn: () => maintenanceApi.getRequests(filters),
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

// Получение конкретной заявки
export const useRequest = (id: string) => {
  return useQuery({
    queryKey: maintenanceKeys.request(id),
    queryFn: () => maintenanceApi.getRequestById(id),
    staleTime: 1000 * 60 * 2, // 2 минуты
  });
};

// Создание заявки
export const useCreateRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      requesterId,
    }: {
      data: CreateMaintenanceRequestDto;
      requesterId: string;
    }) => maintenanceApi.createRequest(data, requesterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.requests() });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.stats() });
    },
  });
};

// Обновление заявки
export const useUpdateRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      userId,
    }: {
      id: string;
      data: UpdateMaintenanceRequestDto;
      userId: string;
    }) => maintenanceApi.updateRequest(id, data, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.requests() });
      queryClient.invalidateQueries({
        queryKey: maintenanceKeys.request(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.stats() });
    },
  });
};

// Удаление заявки
export const useDeleteRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => maintenanceApi.deleteRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.requests() });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.stats() });
    },
  });
};

// Добавление комментария
export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      authorId,
    }: {
      data: CreateCommentDto;
      authorId: string;
    }) => maintenanceApi.addComment(data, authorId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: maintenanceKeys.comments(variables.data.requestId),
      });
      queryClient.invalidateQueries({
        queryKey: maintenanceKeys.request(variables.data.requestId),
      });
    },
  });
};

// Получение комментариев
export const useComments = (requestId: string) => {
  return useQuery({
    queryKey: maintenanceKeys.comments(requestId),
    queryFn: () => maintenanceApi.getCommentsByRequestId(requestId),
    staleTime: 1000 * 60 * 2, // 2 минуты
  });
};

// Получение истории
export const useHistory = (requestId: string) => {
  return useQuery({
    queryKey: maintenanceKeys.history(requestId),
    queryFn: () => maintenanceApi.getHistoryByRequestId(requestId),
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

// Получение статистики
export const useDashboardStats = (filters?: {
  assignedTechnicianId?: string;
  requesterId?: string;
}) => {
  return useQuery({
    queryKey: maintenanceKeys.stats(filters),
    queryFn: () => maintenanceApi.getDashboardStats(filters),
    staleTime: 1000 * 60 * 10, // 10 минут
  });
};
