// src/app/(dashboard)/requester/page.tsx

"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RequestsList } from "@/components/requests/RequestsList";
import { CreateRequestForm } from "@/components/requests/CreateRequestForm";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { MaintenanceRequest } from "@/types";
import {
  Plus,
  ClipboardList,
  BarChart3,
  User,
  Phone,
  Mail,
  Settings,
} from "lucide-react";

export default function RequesterPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "requests" | "create" | "profile"
  >("dashboard");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleRequestCreated = () => {
    setActiveTab("requests");
  };

  const handleRequestClick = (request: MaintenanceRequest) => {
    // TODO: Открыть модальное окно с деталями заявки
    console.log("Открыть заявку:", request);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Личный кабинет заявителя
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Добро пожаловать, {user.name}!
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
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
              Обзор
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
              Мои заявки
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "create"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Plus className="inline h-4 w-4 mr-2" />
              Новая заявка
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
              <DashboardStats filters={{ requesterId: user.$id }} />
            </div>
          </div>
        )}

        {activeTab === "requests" && (
          <div>
            <RequestsList
              initialFilters={{ requesterId: user.$id }}
              onRequestClick={handleRequestClick}
              showFilters={true}
            />
          </div>
        )}

        {activeTab === "create" && (
          <div>
            <CreateRequestForm onSuccess={handleRequestCreated} />
          </div>
        )}

        {activeTab === "profile" && (
          <div className="max-w-2xl">
            <ProfileSection user={user} />
          </div>
        )}
      </div>
    </div>
  );
}

// Компонент профиля пользователя
interface ProfileSectionProps {
  user: any; // TODO: заменить на правильный тип User
}

function ProfileSection({ user }: ProfileSectionProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Информация профиля
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Основная информация о вашем аккаунте
        </p>
      </div>

      <div className="px-6 py-4 space-y-6">
        {/* Основная информация */}
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
              <p className="text-sm text-gray-600">Заявитель</p>
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
        </div>

        {/* Контактная информация */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Контактная информация
          </h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-900">{user.phone}</span>
              </div>
            )}
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
            <div className="flex justify-between">
              <span className="text-gray-600">Последнее обновление:</span>
              <span className="text-gray-900">
                {new Date(user.$updatedAt).toLocaleDateString("ru-RU")}
              </span>
            </div>
          </div>
        </div>

        {/* Инструкции */}
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Как создать заявку на ремонт?
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>1. Перейдите во вкладку "Новая заявка"</li>
              <li>2. Заполните все обязательные поля</li>
              <li>3. Выберите подходящую категорию и приоритет</li>
              <li>4. Укажите точное местоположение проблемы</li>
              <li>5. Нажмите "Создать заявку"</li>
            </ul>
          </div>
        </div>

        {/* Контакты поддержки */}
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              Нужна помощь?
            </h4>
            <p className="text-sm text-gray-600">
              Если у вас возникли вопросы по работе с системой, обратитесь к
              администратору или менеджеру службы технического обслуживания.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
