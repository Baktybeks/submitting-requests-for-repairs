// src/types/maintenance.ts

// Экспортируем все типы для опросов (survey)
export * from "./survey";

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  MANAGER = "MANAGER",
  TECHNICIAN = "TECHNICIAN",
  REQUESTER = "REQUESTER",
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Супер админ",
  [UserRole.MANAGER]: "Менеджер",
  [UserRole.TECHNICIAN]: "Техник",
  [UserRole.REQUESTER]: "Заявитель",
};

export const UserRoleColors: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "bg-red-100 text-red-800",
  [UserRole.MANAGER]: "bg-blue-100 text-blue-800",
  [UserRole.TECHNICIAN]: "bg-green-100 text-green-800",
  [UserRole.REQUESTER]: "bg-purple-100 text-purple-800",
};

// Статусы заявок
export enum RequestStatus {
  NEW = "NEW",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CLOSED = "CLOSED",
}

export const RequestStatusLabels: Record<RequestStatus, string> = {
  [RequestStatus.NEW]: "Новая",
  [RequestStatus.IN_PROGRESS]: "В работе",
  [RequestStatus.COMPLETED]: "Завершена",
  [RequestStatus.CLOSED]: "Закрыта",
};

export const RequestStatusColors: Record<RequestStatus, string> = {
  [RequestStatus.NEW]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [RequestStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800 border-blue-200",
  [RequestStatus.COMPLETED]: "bg-green-100 text-green-800 border-green-200",
  [RequestStatus.CLOSED]: "bg-gray-100 text-gray-800 border-gray-200",
};

// Категории заявок
export enum RequestCategory {
  ELECTRICAL = "ELECTRICAL",
  PLUMBING = "PLUMBING",
  HVAC = "HVAC",
  CARPENTRY = "CARPENTRY",
  PAINTING = "PAINTING",
  CLEANING = "CLEANING",
  OTHER = "OTHER",
}

export const RequestCategoryLabels: Record<RequestCategory, string> = {
  [RequestCategory.ELECTRICAL]: "Электрика",
  [RequestCategory.PLUMBING]: "Сантехника",
  [RequestCategory.HVAC]: "Вентиляция/Кондиционирование",
  [RequestCategory.CARPENTRY]: "Столярные работы",
  [RequestCategory.PAINTING]: "Покраска",
  [RequestCategory.CLEANING]: "Уборка",
  [RequestCategory.OTHER]: "Прочее",
};

// Приоритеты заявок
export enum RequestPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export const RequestPriorityLabels: Record<RequestPriority, string> = {
  [RequestPriority.LOW]: "Низкий",
  [RequestPriority.MEDIUM]: "Средний",
  [RequestPriority.HIGH]: "Высокий",
  [RequestPriority.URGENT]: "Срочно",
};

export const RequestPriorityColors: Record<RequestPriority, string> = {
  [RequestPriority.LOW]: "bg-gray-100 text-gray-800 border-gray-200",
  [RequestPriority.MEDIUM]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [RequestPriority.HIGH]: "bg-orange-100 text-orange-800 border-orange-200",
  [RequestPriority.URGENT]: "bg-red-100 text-red-800 border-red-200",
};

// Базовый интерфейс документа
export interface BaseDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
}

// Пользователь
export interface User extends BaseDocument {
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  specialization?: string; // Для техников
  phone?: string;
}

// Заявка на ремонт/обслуживание
export interface MaintenanceRequest extends BaseDocument {
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  location: string;
  requesterId: string;
  assignedTechnicianId?: string | null; // Изменено: добавлен null
  managerId?: string | null; // Изменено: добавлен null
  attachments?: string[]; // URLs файлов
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  notes?: string;
  cost?: number;
}

// Комментарии к заявке
export interface RequestComment extends BaseDocument {
  requestId: string;
  authorId: string;
  text: string;
  isInternal: boolean; // Видно только персоналу
}

// История изменений заявки
export interface RequestHistory extends BaseDocument {
  requestId: string;
  userId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  description: string;
}

// DTO для создания заявки
export interface CreateMaintenanceRequestDto {
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  location: string;
}

// DTO для обновления заявки
export interface UpdateMaintenanceRequestDto {
  title?: string;
  description?: string;
  category?: RequestCategory;
  priority?: RequestPriority;
  location?: string;
  status?: RequestStatus;
  assignedTechnicianId?: string | null; // Изменено: добавлен null
  managerId?: string | null; // Изменено: добавлен null
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  notes?: string;
  cost?: number;
}

// DTO для создания комментария
export interface CreateCommentDto {
  requestId: string;
  text: string;
  isInternal?: boolean;
}

// Расширенная информация о заявке с данными пользователей
export interface MaintenanceRequestWithDetails extends MaintenanceRequest {
  requester: User;
  assignedTechnician?: User | null; // Изменено: добавлен null
  manager?: User | null;
  comments?: RequestComment[];
  history?: RequestHistory[];
}

// Статистика для дашборда
export interface DashboardStats {
  totalRequests: number;
  newRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  urgentRequests: number;
  averageCompletionTime: number; // в часах
  requestsByCategory: Record<RequestCategory, number>;
  requestsByPriority: Record<RequestPriority, number>;
}

// Фильтры для заявок
export interface RequestFilters {
  status?: RequestStatus[];
  category?: RequestCategory[];
  priority?: RequestPriority[];
  assignedTechnicianId?: string;
  requesterId?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

// Утилитарные функции
export const getRoleLabel = (role: UserRole): string => {
  return UserRoleLabels[role] || role;
};

export const getRoleColor = (role: UserRole): string => {
  return UserRoleColors[role] || "bg-gray-100 text-gray-800";
};

export const getStatusLabel = (status: RequestStatus): string => {
  return RequestStatusLabels[status] || status;
};

export const getStatusColor = (status: RequestStatus): string => {
  return (
    RequestStatusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"
  );
};

export const getCategoryLabel = (category: RequestCategory): string => {
  return RequestCategoryLabels[category] || category;
};

export const getPriorityLabel = (priority: RequestPriority): string => {
  return RequestPriorityLabels[priority] || priority;
};

export const getPriorityColor = (priority: RequestPriority): string => {
  return (
    RequestPriorityColors[priority] ||
    "bg-gray-100 text-gray-800 border-gray-200"
  );
};

// Проверка прав доступа
export const canManageRequests = (userRole: UserRole): boolean => {
  return [UserRole.SUPER_ADMIN, UserRole.MANAGER].includes(userRole);
};

export const canAssignTechnicians = (userRole: UserRole): boolean => {
  return [UserRole.SUPER_ADMIN, UserRole.MANAGER].includes(userRole);
};

export const canViewAllRequests = (userRole: UserRole): boolean => {
  return [UserRole.SUPER_ADMIN, UserRole.MANAGER].includes(userRole);
};

export const canCreateRequests = (userRole: UserRole): boolean => {
  return [UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.REQUESTER].includes(
    userRole
  );
};

export const canUpdateRequestStatus = (userRole: UserRole): boolean => {
  return [UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.TECHNICIAN].includes(
    userRole
  );
};

export enum RequestAction {
  ACCEPT = "ACCEPT", // Принять заявку в работу
  REJECT = "REJECT", // Отказаться от заявки
  START = "START", // Начать работу (то же что ACCEPT)
  COMPLETE = "COMPLETE", // Завершить работу
  CLOSE = "CLOSE", // Закрыть заявку
}

export const RequestActionLabels: Record<RequestAction, string> = {
  [RequestAction.ACCEPT]: "Принять в работу",
  [RequestAction.REJECT]: "Отказаться",
  [RequestAction.START]: "Начать работу",
  [RequestAction.COMPLETE]: "Завершить работу",
  [RequestAction.CLOSE]: "Закрыть заявку",
};

// Утилитарные функции для проверки возможных действий
export const getAvailableActionsForTechnician = (
  request: MaintenanceRequest,
  technicianId: string
): RequestAction[] => {
  // Проверяем, что заявка назначена данному технику
  if (request.assignedTechnicianId !== technicianId) {
    return [];
  }

  switch (request.status) {
    case RequestStatus.NEW:
      return [RequestAction.ACCEPT, RequestAction.REJECT];
    case RequestStatus.IN_PROGRESS:
      return [RequestAction.COMPLETE];
    default:
      return [];
  }
};

export const getAvailableActionsForManager = (
  request: MaintenanceRequest
): RequestAction[] => {
  switch (request.status) {
    case RequestStatus.NEW:
      return []; // Менеджер назначает техников, но не меняет статус NEW заявок
    case RequestStatus.IN_PROGRESS:
      return [RequestAction.COMPLETE]; // Может завершить работу за техника
    case RequestStatus.COMPLETED:
      return [RequestAction.CLOSE]; // Может закрыть завершенную заявку
    default:
      return [];
  }
};

export const getAvailableActionsForRequester = (
  request: MaintenanceRequest,
  requesterId: string
): RequestAction[] => {
  // Заявитель может только закрывать завершенные заявки
  if (request.requesterId !== requesterId) {
    return [];
  }

  switch (request.status) {
    case RequestStatus.COMPLETED:
      return [RequestAction.CLOSE];
    default:
      return [];
  }
};

// Функция для получения следующего статуса по действию
export const getNextStatusByAction = (
  action: RequestAction,
  currentStatus: RequestStatus
): RequestStatus | null => {
  switch (action) {
    case RequestAction.ACCEPT:
    case RequestAction.START:
      return currentStatus === RequestStatus.NEW
        ? RequestStatus.IN_PROGRESS
        : null;

    case RequestAction.COMPLETE:
      return currentStatus === RequestStatus.IN_PROGRESS
        ? RequestStatus.COMPLETED
        : null;

    case RequestAction.CLOSE:
      return currentStatus === RequestStatus.COMPLETED
        ? RequestStatus.CLOSED
        : null;

    case RequestAction.REJECT:
      // При отказе статус остается NEW, но убирается назначение
      return RequestStatus.NEW;

    default:
      return null;
  }
};

// Функция для проверки, может ли пользователь выполнить действие
export const canUserPerformAction = (
  userRole: UserRole,
  action: RequestAction,
  request: MaintenanceRequest,
  userId: string
): boolean => {
  switch (userRole) {
    case UserRole.SUPER_ADMIN:
      return true; // Супер админ может все

    case UserRole.MANAGER:
      const managerActions = getAvailableActionsForManager(request);
      return managerActions.includes(action);

    case UserRole.TECHNICIAN:
      const technicianActions = getAvailableActionsForTechnician(
        request,
        userId
      );
      return technicianActions.includes(action);

    case UserRole.REQUESTER:
      const requesterActions = getAvailableActionsForRequester(request, userId);
      return requesterActions.includes(action);

    default:
      return false;
  }
};

// Дополнительные утилиты для UI
export const getActionButtonStyle = (action: RequestAction): string => {
  switch (action) {
    case RequestAction.ACCEPT:
    case RequestAction.START:
      return "bg-green-600 hover:bg-green-700 text-white";

    case RequestAction.REJECT:
      return "bg-red-600 hover:bg-red-700 text-white";

    case RequestAction.COMPLETE:
      return "bg-blue-600 hover:bg-blue-700 text-white";

    case RequestAction.CLOSE:
      return "bg-gray-600 hover:bg-gray-700 text-white";

    default:
      return "bg-indigo-600 hover:bg-indigo-700 text-white";
  }
};

export const getActionIcon = (action: RequestAction): string => {
  switch (action) {
    case RequestAction.ACCEPT:
    case RequestAction.START:
      return "UserCheck";

    case RequestAction.REJECT:
      return "UserX";

    case RequestAction.COMPLETE:
      return "CheckSquare";

    case RequestAction.CLOSE:
      return "X";

    default:
      return "Play";
  }
};
