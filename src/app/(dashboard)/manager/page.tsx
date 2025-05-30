// src/app/(dashboard)/manager/page.tsx

"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRequests, useUpdateRequest } from "@/services/maintenanceService";
import { useActiveTechnicians } from "@/services/authService";
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
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  User,
  UserCheck,
  AlertTriangle,
  Calendar,
  MapPin,
  Wrench,
  Eye,
  Edit,
  UserPlus,
  Filter,
} from "lucide-react";

export default function ManagerPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "requests" | "assign" | "team" | "profile"
  >("dashboard");
  const [selectedRequest, setSelectedRequest] =
    useState<MaintenanceRequest | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const {
    data: allRequests = [],
    isLoading: requestsLoading,
    refetch: refetchRequests,
  } = useRequests();
  const { data: technicians = [], isLoading: techniciansLoading } =
    useActiveTechnicians();
  const updateRequestMutation = useUpdateRequest();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleAssignTechnician = async (
    request: MaintenanceRequest,
    technicianId: string
  ) => {
    try {
      await updateRequestMutation.mutateAsync({
        id: request.$id,
        data: {
          assignedTechnicianId: technicianId,
          managerId: user.$id,
          status: RequestStatus.IN_PROGRESS,
        },
        userId: user.$id,
      });

      const technician = technicians.find((t) => t.$id === technicianId);
      toast.success(`✅ Заявка назначена технику ${technician?.name}`, {
        position: "top-right",
        autoClose: 3000,
      });

      setShowAssignModal(false);
      setSelectedRequest(null);
    } catch (error: any) {
      toast.error(`❌ Ошибка при назначении техника: ${error.message}`, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

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

      toast.success(
        `✅ Статус заявки изменен на "${getStatusLabel(newStatus)}"`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } catch (error: any) {
      toast.error(`❌ Ошибка при обновлении статуса: ${error.message}`, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const handleRequestClick = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    // TODO: Открыть модальное окно с деталями заявки
    console.log("Открыть заявку:", request);
  };

  const handleRequestEdit = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setShowAssignModal(true);
  };

  // Статистика заявок
  const requestStats = {
    total: allRequests.length,
    new: allRequests.filter((r) => r.status === RequestStatus.NEW).length,
    inProgress: allRequests.filter(
      (r) => r.status === RequestStatus.IN_PROGRESS
    ).length,
    completed: allRequests.filter((r) => r.status === RequestStatus.COMPLETED)
      .length,
    unassigned: allRequests.filter((r) => !r.assignedTechnicianId).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Панель управления менеджера
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Добро пожаловать, {user.name}! Управляйте заявками и назначайте
                исполнителей
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Менеджер</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Быстрая статистика */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {requestStats.total}
              </div>
              <div className="text-sm text-gray-600">Всего заявок</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {requestStats.new}
              </div>
              <div className="text-sm text-gray-600">Новые</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {requestStats.inProgress}
              </div>
              <div className="text-sm text-gray-600">В работе</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {requestStats.completed}
              </div>
              <div className="text-sm text-gray-600">Завершено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {requestStats.unassigned}
              </div>
              <div className="text-sm text-gray-600">Не назначены</div>
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
              onClick={() => setActiveTab("requests")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "requests"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <ClipboardList className="inline h-4 w-4 mr-2" />
              Все заявки ({requestStats.total})
            </button>
            <button
              onClick={() => setActiveTab("assign")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "assign"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <UserPlus className="inline h-4 w-4 mr-2" />
              Назначение ({requestStats.unassigned})
            </button>
            <button
              onClick={() => setActiveTab("team")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "team"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Users className="inline h-4 w-4 mr-2" />
              Команда ({technicians.length})
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
                Общая статистика заявок
              </h2>
              <DashboardStats />
            </div>
          </div>
        )}

        {activeTab === "requests" && (
          <RequestsList
            onRequestClick={handleRequestClick}
            onRequestEdit={handleRequestEdit}
            showFilters={true}
          />
        )}

        {activeTab === "assign" && (
          <AssignmentPanel
            requests={allRequests.filter((r) => !r.assignedTechnicianId)}
            technicians={technicians}
            onAssign={handleAssignTechnician}
            isLoading={requestsLoading || techniciansLoading}
            isUpdating={updateRequestMutation.isPending}
          />
        )}

        {activeTab === "team" && (
          <TeamPanel
            technicians={technicians}
            requests={allRequests}
            isLoading={techniciansLoading}
          />
        )}

        {activeTab === "profile" && (
          <div className="max-w-2xl">
            <ManagerProfile user={user} />
          </div>
        )}
      </div>

      {/* Модальное окно назначения техника */}
      {showAssignModal && selectedRequest && (
        <AssignTechnicianModal
          request={selectedRequest}
          technicians={technicians}
          onAssign={(technicianId) =>
            handleAssignTechnician(selectedRequest, technicianId)
          }
          onClose={() => {
            setShowAssignModal(false);
            setSelectedRequest(null);
          }}
          isUpdating={updateRequestMutation.isPending}
        />
      )}
    </div>
  );
}

// Компонент панели назначений
interface AssignmentPanelProps {
  requests: MaintenanceRequest[];
  technicians: any[];
  onAssign: (request: MaintenanceRequest, technicianId: string) => void;
  isLoading: boolean;
  isUpdating: boolean;
}

function AssignmentPanel({
  requests,
  technicians,
  onAssign,
  isLoading,
  isUpdating,
}: AssignmentPanelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Загрузка...</span>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <UserCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Все заявки назначены
        </h3>
        <p className="text-gray-600">
          На данный момент нет заявок, ожидающих назначения исполнителя
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Заявки для назначения исполнителя
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Назначьте подходящих техников для выполнения этих заявок
        </p>
      </div>

      <div className="grid gap-6">
        {requests.map((request) => (
          <AssignmentCard
            key={request.$id}
            request={request}
            technicians={technicians}
            onAssign={(technicianId) => onAssign(request, technicianId)}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </div>
  );
}

// Компонент карточки назначения
interface AssignmentCardProps {
  request: MaintenanceRequest;
  technicians: any[];
  onAssign: (technicianId: string) => void;
  isUpdating: boolean;
}

function AssignmentCard({
  request,
  technicians,
  onAssign,
  isUpdating,
}: AssignmentCardProps) {
  const [selectedTechnician, setSelectedTechnician] = useState("");

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Информация о заявке */}
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">
              {request.title}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                  request.priority
                )}`}
              >
                {getPriorityLabel(request.priority)}
              </span>
              <span className="text-xs text-gray-500">
                {getCategoryLabel(request.category)}
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {request.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {request.location}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatLocalDateTime(request.$createdAt)}
            </div>
          </div>
        </div>

        {/* Назначение техника */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Назначить технику
          </label>
          <select
            value={selectedTechnician}
            onChange={(e) => setSelectedTechnician(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Выберите техника</option>
            {technicians.map((technician) => (
              <option key={technician.$id} value={technician.$id}>
                {technician.name}
                {technician.specialization && ` (${technician.specialization})`}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              if (selectedTechnician) {
                onAssign(selectedTechnician);
                setSelectedTechnician("");
              }
            }}
            disabled={!selectedTechnician || isUpdating}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Назначение...
              </div>
            ) : (
              "Назначить"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Остальные компоненты будут в следующей части...

// Компонент панели команды (заглушка)
function TeamPanel({ technicians, requests, isLoading }: any) {
  if (isLoading) {
    return <div className="text-center py-12">Загрузка команды...</div>;
  }

  return (
    <div className="text-center py-12">
      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Управление командой
      </h3>
      <p className="text-gray-600">Здесь будет информация о команде техников</p>
    </div>
  );
}

// Компонент профиля менеджера (заглушка)
function ManagerProfile({ user }: any) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Профиль менеджера
      </h3>
      <p className="text-gray-600">Профиль пользователя {user.name}</p>
    </div>
  );
}

// Компонент модального окна назначения (заглушка)
function AssignTechnicianModal({
  request,
  technicians,
  onAssign,
  onClose,
  isUpdating,
}: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Назначить техника
        </h3>
        <p className="text-gray-600 mb-4">Заявка: {request.title}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
