// src/app/(dashboard)/technician/page.tsx

"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useRequests,
  useUpdateRequest,
  useRejectRequestByTechnician,
} from "@/services/maintenanceService";
import { RequestsList } from "@/components/requests/RequestsList";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import {
  MaintenanceRequest,
  RequestStatus,
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
  getCategoryLabel,
} from "@/types";
import { formatLocalDateTime } from "@/utils/dateUtils";
import { toast } from "react-toastify";
import {
  Wrench,
  Clock,
  CheckCircle,
  BarChart3,
  ClipboardList,
  User,
  Settings,
  AlertTriangle,
  Play,
  Pause,
  MapPin,
  Square,
  UserCheck,
  UserX,
  CheckSquare,
} from "lucide-react";

export default function TechnicianPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "assigned" | "all" | "profile"
  >("dashboard");
  const updateRequestMutation = useUpdateRequest();
  const rejectRequestMutation = useRejectRequestByTechnician();

  // Получаем заявки для техника
  const { data: assignedRequests = [], isLoading: assignedLoading } =
    useRequests({
      assignedTechnicianId: user?.$id,
    });

  const { data: allRequests = [], isLoading: allLoading } = useRequests();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleStatusUpdate = async (
    request: MaintenanceRequest,
    newStatus: RequestStatus
  ) => {
    try {
      const updates: any = { status: newStatus };

      if (newStatus === RequestStatus.COMPLETED) {
        updates.actualCompletionDate = new Date().toISOString();
      }

      await updateRequestMutation.mutateAsync({
        id: request.$id,
        data: updates,
        userId: user.$id,
      });

      // Показываем разные сообщения в зависимости от статуса
      if (newStatus === RequestStatus.IN_PROGRESS) {
        toast.success(`✅ Заявка "${request.title}" принята в работу`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else if (newStatus === RequestStatus.COMPLETED) {
        toast.success(`🎉 Заявка "${request.title}" успешно завершена!`, {
          position: "top-right",
          autoClose: 4000,
        });
      } else {
        toast.success(
          `✅ Статус заявки изменен на "${getStatusLabel(newStatus)}"`,
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      }
    } catch (error: any) {
      toast.error(`❌ Ошибка при обновлении статуса: ${error.message}`, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  // Функция для отказа от заявки
  const handleRejectRequest = async (request: MaintenanceRequest) => {
    if (
      !confirm(
        `Вы уверены, что хотите отказаться от заявки "${request.title}"?`
      )
    ) {
      return;
    }

    try {
      await rejectRequestMutation.mutateAsync({
        requestId: request.$id,
        technicianId: user.$id,
      });

      toast.success(
        `✅ Вы отказались от заявки "${request.title}". Заявка будет переназначена.`,
        {
          position: "top-right",
          autoClose: 4000,
        }
      );
    } catch (error: any) {
      toast.error(`❌ Ошибка при отказе от заявки: ${error.message}`, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const handleRequestClick = (request: MaintenanceRequest) => {
    // TODO: Открыть модальное окно с деталями заявки
    console.log("Открыть заявку:", request);
  };

  // Статистика для назначенных заявок
  const assignedStats = {
    total: assignedRequests.length,
    awaitingAcceptance: assignedRequests.filter(
      (r) =>
        r.status === RequestStatus.NEW && r.assignedTechnicianId === user.$id
    ).length,
    inProgress: assignedRequests.filter(
      (r) => r.status === RequestStatus.IN_PROGRESS
    ).length,
    completed: assignedRequests.filter(
      (r) => r.status === RequestStatus.COMPLETED
    ).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Рабочее место техника
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Добро пожаловать, {user.name}!
                {user.specialization && (
                  <span className="ml-2 text-indigo-600">
                    • {user.specialization}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Техник</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <Wrench className="h-6 w-6 text-green-600" />
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
              <div className="text-2xl font-bold text-gray-900">
                {assignedStats.total}
              </div>
              <div className="text-sm text-gray-600">Всего назначено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {assignedStats.awaitingAcceptance}
              </div>
              <div className="text-sm text-gray-600">Ожидают принятия</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {assignedStats.inProgress}
              </div>
              <div className="text-sm text-gray-600">В работе</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {assignedStats.completed}
              </div>
              <div className="text-sm text-gray-600">Завершено</div>
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
              Статистика
            </button>
            <button
              onClick={() => setActiveTab("assigned")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "assigned"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <ClipboardList className="inline h-4 w-4 mr-2" />
              Мои заявки ({assignedStats.total})
              {assignedStats.awaitingAcceptance > 0 && (
                <span className="ml-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center inline-flex">
                  {assignedStats.awaitingAcceptance}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "all"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <ClipboardList className="inline h-4 w-4 mr-2" />
              Все заявки
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "profile"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Settings className="inline h-4 w-4 mr-2" />
              Профиль
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
                Статистика моих заявок
              </h2>
              <DashboardStats filters={{ assignedTechnicianId: user.$id }} />
            </div>
          </div>
        )}

        {activeTab === "assigned" && (
          <div>
            {assignedLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">
                  Загрузка назначенных заявок...
                </span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Назначенные мне заявки
                  </h2>
                  {assignedStats.awaitingAcceptance > 0 && (
                    <div className="bg-orange-100 border border-orange-200 rounded-lg px-4 py-2">
                      <span className="text-orange-800 text-sm font-medium">
                        {assignedStats.awaitingAcceptance} заявок ожидают вашего
                        принятия
                      </span>
                    </div>
                  )}
                </div>

                {assignedRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Нет назначенных заявок
                    </h3>
                    <p className="text-gray-600">
                      На данный момент вам не назначены заявки на выполнение
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {assignedRequests.map((request) => (
                      <TechnicianRequestCard
                        key={request.$id}
                        request={request}
                        onStatusUpdate={handleStatusUpdate}
                        onRejectRequest={handleRejectRequest}
                        onClick={() => handleRequestClick(request)}
                        isUpdating={
                          updateRequestMutation.isPending ||
                          rejectRequestMutation.isPending
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "all" && (
          <div>
            <RequestsList
              onRequestClick={handleRequestClick}
              showFilters={true}
            />
          </div>
        )}

        {activeTab === "profile" && (
          <div className="max-w-2xl">
            <TechnicianProfile user={user} />
          </div>
        )}
      </div>
    </div>
  );
}

// Обновленный компонент карточки заявки для техника
interface TechnicianRequestCardProps {
  request: MaintenanceRequest;
  onStatusUpdate: (request: MaintenanceRequest, status: RequestStatus) => void;
  onRejectRequest: (request: MaintenanceRequest) => void;
  onClick?: () => void;
  isUpdating?: boolean;
}

function TechnicianRequestCard({
  request,
  onStatusUpdate,
  onRejectRequest,
  onClick,
  isUpdating,
}: TechnicianRequestCardProps) {
  // Определяем возможные действия в зависимости от статуса
  const getAvailableActions = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.NEW:
        return [
          {
            label: "Принять в работу",
            icon: UserCheck,
            color: "bg-green-600 hover:bg-green-700",
            action: () => onStatusUpdate(request, RequestStatus.IN_PROGRESS),
          },
          {
            label: "Отказаться",
            icon: UserX,
            color: "bg-red-600 hover:bg-red-700",
            action: () => onRejectRequest(request),
            variant: "secondary" as const,
          },
        ];
      case RequestStatus.IN_PROGRESS:
        return [
          {
            label: "Завершить работу",
            icon: CheckSquare,
            color: "bg-blue-600 hover:bg-blue-700",
            action: () => onStatusUpdate(request, RequestStatus.COMPLETED),
          },
        ];
      default:
        return [];
    }
  };

  const actions = getAvailableActions(request.status);

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
        onClick ? "cursor-pointer" : ""
      } ${
        request.status === RequestStatus.NEW
          ? "border-l-4 border-l-orange-500"
          : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Заголовок и статус */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-900 truncate pr-4">
              {request.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                  request.status
                )}`}
              >
                {getStatusLabel(request.status)}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                  request.priority
                )}`}
              >
                {getPriorityLabel(request.priority)}
              </span>
            </div>
          </div>

          {/* Описание */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {request.description}
          </p>

          {/* Мета-информация */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {request.location}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatLocalDateTime(request.$createdAt)}
            </div>
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {getCategoryLabel(request.category)}
            </div>
          </div>

          {/* Статус для NEW заявок */}
          {request.status === RequestStatus.NEW && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-3">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-sm text-orange-800 font-medium">
                  Заявка ожидает вашего принятия в работу
                </span>
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.action();
                  }}
                  disabled={isUpdating}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    action.variant === "secondary"
                      ? "bg-gray-600 hover:bg-gray-700"
                      : action.color
                  }`}
                >
                  {isUpdating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <action.icon className="h-4 w-4 mr-2" />
                  )}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Компонент профиля техника (без изменений)
interface TechnicianProfileProps {
  user: any;
}

function TechnicianProfile({ user }: TechnicianProfileProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Профиль техника</h3>
        <p className="text-sm text-gray-600 mt-1">
          Информация о вашем профиле и специализации
        </p>
      </div>

      <div className="px-6 py-4 space-y-6">
        {/* Основная информация */}
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <Wrench className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
            <p className="text-sm text-gray-600">Техник</p>
            {user.specialization && (
              <p className="text-sm text-indigo-600 font-medium">
                {user.specialization}
              </p>
            )}
            <div className="flex items-center mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {user.isActive ? "Активный" : "Неактивный"}
              </span>
            </div>
          </div>
        </div>

        {/* Инструкции для техников */}
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Инструкции для техников
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • Новые назначенные заявки требуют вашего принятия в работу
              </li>
              <li>
                • Вы можете отказаться от заявки, если не можете её выполнить
              </li>
              <li>• После принятия переводите заявку в статус "В работе"</li>
              <li>• По завершении работ отмечайте заявку как "Завершена"</li>
              <li>• Добавляйте комментарии о ходе выполнения работ</li>
            </ul>
          </div>
        </div>

        {/* Статусы заявок */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Рабочий процесс
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-md">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Новая (назначена)
                  </p>
                  <p className="text-xs text-orange-600">
                    Требует принятия в работу или отказа
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-xs bg-green-600 text-white px-3 py-1 rounded-md">
                  Принять
                </button>
                <button className="text-xs bg-red-600 text-white px-3 py-1 rounded-md">
                  Отказаться
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <Play className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-800">В работе</p>
                  <p className="text-xs text-blue-600">Работа выполняется</p>
                </div>
              </div>
              <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md">
                Завершить
              </button>
            </div>

            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800">Завершена</p>
                <p className="text-xs text-green-600">
                  Работа выполнена успешно
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Информация об аккаунте */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Информация об аккаунте
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ID пользователя:</span>
              <span className="text-gray-900 font-mono text-xs">
                {user.$id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Дата регистрации:</span>
              <span className="text-gray-900">
                {new Date(user.$createdAt).toLocaleDateString("ru-RU")}
              </span>
            </div>
            {user.specialization && (
              <div className="flex justify-between">
                <span className="text-gray-600">Специализация:</span>
                <span className="text-gray-900">{user.specialization}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
