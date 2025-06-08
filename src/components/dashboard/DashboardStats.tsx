// src/components/dashboard/DashboardStats.tsx

"use client";

import React from "react";
import { useDashboardStats } from "@/services/maintenanceService";
import { useAuth } from "@/hooks/useAuth";
import {
  RequestCategory,
  RequestPriority,
  getCategoryLabel,
  getPriorityLabel,
} from "@/types";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Wrench,
  Calendar,
} from "lucide-react";

interface DashboardStatsProps {
  filters?: { assignedTechnicianId?: string; requesterId?: string };
}

export function DashboardStats({ filters }: DashboardStatsProps) {
  const { user, canViewAllRequests } = useAuth();

  // Если пользователь не может видеть все заявки, показываем только его статистику
  const statsFilters = canViewAllRequests
    ? filters
    : { ...filters, requesterId: user?.$id };

  const { data: stats, isLoading, error } = useDashboardStats(statsFilters);

  if (isLoading) {
    return <DashboardStatsLoading />;
  }

  if (error || !stats) {
    return <DashboardStatsError />;
  }

  return (
    <div className="space-y-6">
      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Всего заявок"
          value={stats.totalRequests}
          icon={ClipboardList}
          color="bg-blue-500"
          description="За все время"
        />
        <StatCard
          title="Новые заявки"
          value={stats.newRequests}
          icon={Clock}
          color="bg-yellow-500"
          description="Ожидают назначения"
        />
        <StatCard
          title="В работе"
          value={stats.inProgressRequests}
          icon={Wrench}
          color="bg-indigo-500"
          description="Выполняются сейчас"
        />
        <StatCard
          title="Завершенные"
          value={stats.completedRequests}
          icon={CheckCircle}
          color="bg-green-500"
          description="Успешно выполнены"
        />
      </div>

      {/* Дополнительные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Срочные заявки"
          value={stats.urgentRequests}
          icon={AlertTriangle}
          color="bg-red-500"
          description="Требуют немедленного внимания"
          variant="compact"
        />
        <StatCard
          title="Среднее время выполнения"
          value={`${Math.round(stats.averageCompletionTime)} ч`}
          icon={TrendingUp}
          color="bg-purple-500"
          description="Для завершенных заявок"
          variant="compact"
        />
        <StatCard
          title="Процент завершения"
          value={`${Math.round(
            (stats.completedRequests / Math.max(stats.totalRequests, 1)) * 100
          )}%`}
          icon={Calendar}
          color="bg-teal-500"
          description="Отношение завершенных к общему числу"
          variant="compact"
        />
      </div>

      {/* Краткая сводка */}
      {stats.totalRequests > 0 && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Краткая сводка</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="opacity-90">Активность:</p>
              <p className="font-medium">
                {stats.newRequests + stats.inProgressRequests} активных заявок
                из {stats.totalRequests}
              </p>
            </div>
            <div>
              <p className="opacity-90">Эффективность:</p>
              <p className="font-medium">
                {stats.totalRequests > 0
                  ? `${Math.round(
                      (stats.completedRequests / stats.totalRequests) * 100
                    )}% выполнено`
                  : "Нет данных"}
              </p>
            </div>
            <div>
              <p className="opacity-90">Средний срок:</p>
              <p className="font-medium">
                {stats.averageCompletionTime > 0
                  ? `${Math.round(stats.averageCompletionTime)} часов`
                  : "Нет данных"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент карточки статистики
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description?: string;
  variant?: "default" | "compact";
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  description,
  variant = "default",
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${color} rounded-md p-3`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500 truncate">
              {title}
            </p>
            <p
              className={`${
                variant === "compact" ? "text-xl" : "text-2xl"
              } font-semibold text-gray-900`}
            >
              {value}
            </p>
            {description && (
              <p className="text-xs text-gray-400 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент прогресс-бара для категорий
interface CategoryBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function CategoryBar({ label, count, total, color }: CategoryBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between items-center text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-500">{count}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {percentage.toFixed(1)}% от общего числа
      </div>
    </div>
  );
}

// Компонент загрузки
function DashboardStatsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="flex items-center">
                <div className="bg-gray-300 rounded-md p-3 w-12 h-12"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j}>
                    <div className="flex justify-between mb-1">
                      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-300 rounded w-8"></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-300 h-2 rounded-full w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Компонент ошибки
function DashboardStatsError() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Ошибка загрузки статистики
      </h3>
      <p className="text-gray-600">
        Не удалось загрузить данные статистики. Попробуйте обновить страницу.
      </p>
    </div>
  );
}
