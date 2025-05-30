// src/types/maintenance.ts

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
  assignedTechnicianId?: string;
  managerId?: string;
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
  assignedTechnicianId?: string;
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
  assignedTechnician?: User;
  manager?: User;
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
