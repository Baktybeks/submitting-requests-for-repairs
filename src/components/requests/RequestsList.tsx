// src/components/requests/RequestsList.tsx (Рефакторинг)

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRequests } from "@/services/maintenanceService";
import { useAuth } from "@/hooks/useAuth";
import {
  MaintenanceRequest,
  RequestFilters,
  RequestStatus,
  RequestCategory,
  RequestPriority,
  getStatusLabel,
  getStatusColor,
  getCategoryLabel,
  getPriorityLabel,
  getPriorityColor,
} from "@/types";
import { formatLocalDateTime } from "@/utils/dateUtils";
import {
  Filter,
  Search,
  ClipboardList,
  MapPin,
  User,
  Calendar,
  AlertTriangle,
  Eye,
  Edit,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
} from "lucide-react";

interface RequestsListProps {
  initialFilters?: Partial<RequestFilters>;
  onRequestClick?: (request: MaintenanceRequest) => void;
  onRequestEdit?: (request: MaintenanceRequest) => void;
  showFilters?: boolean;
  compact?: boolean;
  maxHeight?: string;
}

interface FilterState extends RequestFilters {
  isFilterOpen: boolean;
}

const INITIAL_FILTER_STATE: FilterState = {
  status: [],
  category: [],
  priority: [],
  searchTerm: "",
  isFilterOpen: false,
};

export function RequestsList({
  initialFilters = {},
  onRequestClick,
  onRequestEdit,
  showFilters = false,
  compact = false,
  maxHeight = "none",
}: RequestsListProps) {
  const { user, canViewAllRequests } = useAuth();

  // Локальное состояние фильтров
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...INITIAL_FILTER_STATE,
    ...initialFilters,
  }));

  // Применение ограничений доступа
  const finalFilters = useMemo(() => {
    const { isFilterOpen, ...baseFilters } = filters;

    if (!canViewAllRequests && user) {
      baseFilters.requesterId = user.$id;
    }

    return baseFilters;
  }, [filters, canViewAllRequests, user]);

  const {
    data: requests = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useRequests(finalFilters);

  // Обработчики фильтров
  const updateFilter = useCallback(
    <K extends keyof RequestFilters>(key: K, value: RequestFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleFilterValue = useCallback(
    <K extends keyof RequestFilters>(
      key: K,
      value: NonNullable<RequestFilters[K]>[0]
    ) => {
      setFilters((prev) => {
        const currentArray = (prev[key] as any[]) || [];
        const newArray = currentArray.includes(value)
          ? currentArray.filter((item) => item !== value)
          : [...currentArray, value];
        return { ...prev, [key]: newArray };
      });
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({
      ...INITIAL_FILTER_STATE,
      isFilterOpen: prev.isFilterOpen,
    }));
  }, []);

  const toggleFilters = useCallback(() => {
    setFilters((prev) => ({ ...prev, isFilterOpen: !prev.isFilterOpen }));
  }, []);

  // Статистика по текущим фильтрам
  const stats = useMemo(() => {
    return {
      total: requests.length,
      new: requests.filter((r) => r.status === RequestStatus.NEW).length,
      inProgress: requests.filter((r) => r.status === RequestStatus.IN_PROGRESS)
        .length,
      completed: requests.filter((r) => r.status === RequestStatus.COMPLETED)
        .length,
    };
  }, [requests]);

  // Проверка наличия активных фильтров
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.searchTerm ||
      filters.status?.length ||
      filters.category?.length ||
      filters.priority?.length ||
      filters.dateFrom ||
      filters.dateTo
    );
  }, [filters]);

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      {/* Заголовок с действиями */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <ClipboardList className="h-5 w-5 mr-2 text-indigo-600" />
            Заявки на ремонт
            {!isLoading && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({stats.total})
              </span>
            )}
          </h2>
          {stats.total > 0 && (
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <span>Новые: {stats.new}</span>
              <span>В работе: {stats.inProgress}</span>
              <span>Завершено: {stats.completed}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showFilters && (
            <button
              onClick={toggleFilters}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                filters.isFilterOpen || hasActiveFilters
                  ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
              {hasActiveFilters && (
                <span className="ml-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  !
                </span>
              )}
              {filters.isFilterOpen ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </button>
          )}

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
            />
            Обновить
          </button>
        </div>
      </div>

      {/* Панель фильтров */}
      {showFilters && filters.isFilterOpen && (
        <FiltersPanel
          filters={filters}
          onUpdateFilter={updateFilter}
          onToggleFilterValue={toggleFilterValue}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* Список заявок */}
      <div
        className="space-y-3"
        style={{
          maxHeight,
          overflowY: maxHeight !== "none" ? "auto" : "visible",
        }}
      >
        {isLoading ? (
          <LoadingState compact={compact} />
        ) : requests.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        ) : (
          requests.map((request) => (
            <RequestCard
              key={request.$id}
              request={request}
              onClick={onRequestClick}
              onEdit={onRequestEdit}
              compact={compact}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Компонент панели фильтров
interface FiltersPanelProps {
  filters: FilterState;
  onUpdateFilter: <K extends keyof RequestFilters>(
    key: K,
    value: RequestFilters[K]
  ) => void;
  onToggleFilterValue: <K extends keyof RequestFilters>(
    key: K,
    value: NonNullable<RequestFilters[K]>[0]
  ) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

function FiltersPanel({
  filters,
  onUpdateFilter,
  onToggleFilterValue,
  onClearFilters,
  hasActiveFilters,
}: FiltersPanelProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Фильтры</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            <X className="h-3 w-3 mr-1" />
            Очистить
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Поиск */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Поиск
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={filters.searchTerm || ""}
              onChange={(e) => onUpdateFilter("searchTerm", e.target.value)}
              placeholder="Название, описание..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Статус */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Статус
          </label>
          <div className="space-y-1">
            {Object.values(RequestStatus).map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.status?.includes(status) || false}
                  onChange={() => onToggleFilterValue("status", status)}
                  className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-xs text-gray-700">
                  {getStatusLabel(status)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Категория */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Категория
          </label>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {Object.values(RequestCategory).map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.category?.includes(category) || false}
                  onChange={() => onToggleFilterValue("category", category)}
                  className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-xs text-gray-700">
                  {getCategoryLabel(category)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Приоритет */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Приоритет
          </label>
          <div className="space-y-1">
            {Object.values(RequestPriority).map((priority) => (
              <label key={priority} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.priority?.includes(priority) || false}
                  onChange={() => onToggleFilterValue("priority", priority)}
                  className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-xs text-gray-700">
                  {getPriorityLabel(priority)}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Фильтры по дате */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Дата от
          </label>
          <input
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) => onUpdateFilter("dateFrom", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Дата до
          </label>
          <input
            type="date"
            value={filters.dateTo || ""}
            onChange={(e) => onUpdateFilter("dateTo", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}

// Компонент карточки заявки
interface RequestCardProps {
  request: MaintenanceRequest;
  onClick?: (request: MaintenanceRequest) => void;
  onEdit?: (request: MaintenanceRequest) => void;
  compact?: boolean;
}

function RequestCard({ request, onClick, onEdit, compact }: RequestCardProps) {
  const handleCardClick = useCallback(() => {
    onClick?.(request);
  }, [onClick, request]);

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit?.(request);
    },
    [onEdit, request]
  );

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
        onClick ? "cursor-pointer" : ""
      } ${compact ? "p-3" : "p-4"}`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Заголовок и метки */}
          <div className="flex items-start justify-between mb-2">
            <h3
              className={`font-medium text-gray-900 truncate pr-4 ${
                compact ? "text-sm" : "text-base"
              }`}
            >
              {request.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                  request.status
                )}`}
              >
                {getStatusLabel(request.status)}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                  request.priority
                )}`}
              >
                {getPriorityLabel(request.priority)}
              </span>
            </div>
          </div>

          {/* Описание */}
          {!compact && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {request.description}
            </p>
          )}

          {/* Мета-информация */}
          <div
            className={`flex flex-wrap items-center gap-4 text-gray-500 ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="truncate max-w-32">{request.location}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatLocalDateTime(request.$createdAt)}
            </div>
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {getCategoryLabel(request.category)}
            </div>
          </div>

          {/* Назначенный техник */}
          {request.assignedTechnicianId && (
            <div
              className={`mt-2 flex items-center text-green-600 ${
                compact ? "text-xs" : "text-sm"
              }`}
            >
              <User className="h-4 w-4 mr-1" />
              Назначен техник
            </div>
          )}
        </div>

        {/* Действия */}
        {(onClick || onEdit) && (
          <div className="ml-4 flex items-center gap-2">
            {onClick && (
              <button
                onClick={handleCardClick}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Просмотр"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={handleEditClick}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Редактировать"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Состояние загрузки
function LoadingState({ compact }: { compact: boolean }) {
  return (
    <div className="space-y-3">
      {[...Array(compact ? 3 : 5)].map((_, i) => (
        <div
          key={i}
          className={`bg-white border border-gray-200 rounded-lg animate-pulse ${
            compact ? "p-3" : "p-4"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`bg-gray-300 rounded ${
                    compact ? "h-4 w-48" : "h-5 w-64"
                  }`}
                ></div>
                <div className="flex gap-2">
                  <div className="bg-gray-300 rounded-full h-5 w-16"></div>
                  <div className="bg-gray-300 rounded-full h-5 w-12"></div>
                </div>
              </div>
              {!compact && (
                <div className="bg-gray-300 rounded h-4 w-full mb-3"></div>
              )}
              <div className="flex gap-4">
                <div className="bg-gray-300 rounded h-3 w-20"></div>
                <div className="bg-gray-300 rounded h-3 w-24"></div>
                <div className="bg-gray-300 rounded h-3 w-16"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Пустое состояние
function EmptyState({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="text-center py-12">
      <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {hasFilters ? "Заявки не найдены" : "Пока нет заявок"}
      </h3>
      <p className="text-gray-600 mb-4">
        {hasFilters
          ? "Попробуйте изменить фильтры поиска"
          : "Заявки появятся здесь после их создания"}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
        >
          Очистить фильтры
        </button>
      )}
    </div>
  );
}

// Состояние ошибки
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Ошибка загрузки заявок
      </h3>
      <p className="text-gray-600 mb-4">
        Не удалось загрузить список заявок. Проверьте соединение с интернетом.
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Повторить
      </button>
    </div>
  );
}
