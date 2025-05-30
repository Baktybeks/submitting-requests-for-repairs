// src/app/(dashboard)/admin/page.tsx

"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  useAllUsers, 
  usePendingUsers, 
  useActivateUser, 
  useDeactivateUser,
  useCreateUser 
} from "@/services/authService";
import { useRequests } from "@/services/maintenanceService";
import { RequestsList } from "@/components/requests/RequestsList";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { 
  User, 
  UserRole, 
  getRoleLabel, 
  getRoleColor,
  MaintenanceRequest 
} from "@/types";
import { formatLocalDateTime } from "@/utils/dateUtils";
import { toast } from "react-toastify";
import { 
  Shield, 
  Users, 
  ClipboardList, 
  BarChart3, 
  Settings,
  UserCheck,
  UserX,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Filter
} from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "requests" | "pending" | "settings">("dashboard");

  const { data: allUsers = [], isLoading: usersLoading, refetch: refetchUsers } = useAllUsers();
  const { data: pendingUsers = [], isLoading: pendingLoading } = usePendingUsers();
  const { data: allRequests = [], isLoading: requestsLoading } = useRequests();
  
  const activateUserMutation = useActivateUser();
  const deactivateUserMutation = useDeactivateUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleActivateUser = async (userId: string, userName: string) => {
    try {
      await activateUserMutation.mutateAsync(userId);
      toast.success(`✅ Пользователь ${userName} активирован`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error: any) {
      toast.error(`❌ Ошибка при активации: ${error.message}`, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const handleDeactivateUser = async (userId: string, userName: string) => {
    if (!confirm(`Вы уверены, что хотите деактивировать пользователя ${userName}?`)) {
      return;
    }

    try {
      await deactivateUserMutation.mutateAsync(userId);
      toast.success(`✅ Пользователь ${userName} деактивирован`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error: any) {
      toast.error(`❌ Ошибка при деактивации: ${error.message}`, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const handleRequestClick = (request: MaintenanceRequest) => {
    // TODO: Открыть модальное окно с деталями заявки
    console.log("Открыть заявку:", request);
  };

  // Статистика системы
  const systemStats = {
    totalUsers: allUsers.length,
    activeUsers: allUsers.filter(u => u.isActive).length,
    pendingUsers: pendingUsers.length,
    totalRequests: allRequests.length,
    usersByRole: {
      [UserRole.SUPER_ADMIN]: allUsers.filter(u => u.role === UserRole.SUPER_ADMIN).length,
      [UserRole.MANAGER]: allUsers.filter(u => u.role === UserRole.MANAGER).length,
      [UserRole.TECHNICIAN]: allUsers.filter(u => u.role === UserRole.TECHNICIAN).length,
      [UserRole.REQUESTER]: allUsers.filter(u => u.role === UserRole.REQUESTER).length,
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="h-7 w-7 mr-3 text-red-600" />
                Панель администратора
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Добро пожаловать, {user.name}! Полное управление системой
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Супер администратор</p>
              </div>
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Быстрая статистика */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</div>
              <div className="text-sm text-gray-600">Всего пользователей</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemStats.activeUsers}</div>
              <div className="text-sm text-gray-600">Активных</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{systemStats.pendingUsers}</div>
              <div className="text-sm text-gray-600">Ожидают активации</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{systemStats.totalRequests}</div>
              <div className="text-sm text-gray-600">Всего заявок</div>
            </div>
          </div>
        </div>
      </div>

      {/* Навигационные вкладки */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "dashboard"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <BarChart3 className="inline h-4 w-4 mr-2" />
              Аналитика
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "users"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Users className="inline h-4 w-4 mr-2" />
              Пользователи ({systemStats.totalUsers})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "pending"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Clock className="inline h-4 w-4 mr-2" />
              Активация ({systemStats.pendingUsers})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "requests"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <ClipboardList className="inline h-4 w-4 mr-2" />
              Заявки ({systemStats.totalRequests})
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "settings"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Settings className="inline h-4 w-4 mr-2" />
              Настройки
            </button>
          </nav>
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Общая статистика системы
              </h2>
              <DashboardStats />
            </div>

            {/* Статистика по ролям */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Распределение пользователей по ролям
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(systemStats.usersByRole).map(([role, count]) => (
                  <div key={role} className="bg-white p-4 rounded-lg shadow border">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${getRoleColor(role as UserRole)}`}>
                      {getRoleLabel(role as UserRole)}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-500">пользователей</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <UsersList
            users={allUsers}
            isLoading={usersLoading}
            onActivate={handleActivateUser}
            onDeactivate={handleDeactivateUser}
            isUpdating={activateUserMutation.isPending || deactivateUserMutation.isPending}
          />
        )}

        {activeTab === "pending" && (
          <PendingUsersList
            users={pendingUsers}
            isLoading={pendingLoading}
            onActivate={handleActivateUser}
            isUpdating={activateUserMutation.isPending}
          />
        )}

        {activeTab === "requests" && (
          <RequestsList
            onRequestClick={handleRequestClick}
            showFilters={true}
          />
        )}

        {activeTab === "settings" && (
          <SystemSettings />
        )}
      </div>
    </div>
  );
}

// Компонент списка всех пользователей
interface UsersListProps {
  users: User[];
  isLoading: boolean;
  onActivate: (userId: string, userName: string) => void;
  onDeactivate: (userId: string, userName: string) => void;
  isUpdating: boolean;
}

function UsersList({ users, isLoading, onActivate, onDeactivate, isUpdating }: UsersListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Загрузка пользователей...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Все пользователи системы
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Управление всеми зарегистрированными пользователями
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.$id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                      {user.isActive ? (
                        <CheckCircle className="ml-2 h-4 w-4 text-green-500" title="Активен" />
                      ) : (
                        <Clock className="ml-2 h-4 w-4 text-yellow-500" title="Неактивен" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    {user.specialization && (
                      <div className="text-xs text-indigo-600">{user.specialization}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {formatLocalDateTime(user.$createdAt)}
                  </span>
                  {user.role !== UserRole.SUPER_ADMIN && (
                    <div className="flex space-x-2">
                      {user.isActive ? (
                        <button
                          onClick={() => onDeactivate(user.$id, user.name)}
                          disabled={isUpdating}
                          className="inline-flex items-center px-2.5 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                        >
                          <UserX className="h-3 w-3 mr-1" />
                          Деактивировать
                        </button>
                      ) : (
                        <button
                          onClick={() => onActivate(user.$id, user.name)}
                          disabled={isUpdating}
                          className="inline-flex items-center px-2.5 py-1.5 border border-green-300 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50"
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          Активировать
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Компонент списка пользователей ожидающих активации
interface PendingUsersListProps {
  users: User[];
  isLoading: boolean;
  onActivate: (userId: string, userName: string) => void;
  isUpdating: boolean;
}

function PendingUsersList({ users, isLoading, onActivate, isUpdating }: PendingUsersListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Загрузка...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <UserCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Нет пользователей для активации
        </h3>
        <p className="text-gray-600">
          Все зарегистрированные пользователи уже активированы
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Пользователи ожидающие активации
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Новые пользователи, которым требуется активация для доступа к системе
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.$id}>
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.specialization && (
                        <div className="text-xs text-indigo-600">{user.specialization}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        Зарегистрирован: {formatLocalDateTime(user.$createdAt)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onActivate(user.$id, user.name)}
                    disabled={isUpdating}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <UserCheck className="h-4 w-4 mr-2" />
                    )}
                    Активировать
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Компонент настроек системы
function SystemSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Настройки системы
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Конфигурация и управление системой заявок
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Общие настройки */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Общие настройки
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Автоматическое назначение</h4>
                <p className="text-sm text-gray-500">Автоматически назначать заявки доступным техникам</p>
              </div>
              <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Email уведомления</h4>
                <p className="text-sm text-gray-500">Отправлять уведомления на email при изменении статуса</p>
              </div>
              <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Статистика системы */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Информация о системе
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Версия системы:</span>
              <span className="ml-2 font-medium">1.0.0</span>
            </div>
            <div>
              <span className="text-gray-500">Последнее обновление:</span>
              <span className="ml-2 font-medium">{new Date().toLocaleDateString("ru-RU")}</span>
            </div>
            <div>
              <span className="text-gray-500">База данных:</span>
              <span className="ml-2 font-medium">Appwrite</span>
            </div>
            <div>
              <span className="text-gray-500">Окружение:</span>
              <span className="ml-2 font-medium">Production</span>
            </div>
          </div>
        </div>

        {/* Действия администратора */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Действия администратора
          </h3>
          <div className="space-y-3">
            <button className="w-full sm:w-auto inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <UserPlus className="h-4 w-4 mr-2" />
              Создать пользователя
            </button>
            
            <button className="w-full sm:w-auto inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ml-0 sm:ml-3">
              <Settings className="h-4 w-4 mr-2" />
              Экспорт данных
            </button>
          </div>
        </div>

        {/* Предупреждение */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Внимание
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Изменения в настройках системы могут повлиять на работу всех пользователей. 
                Убедитесь в правильности настроек перед сохранением.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
})