// src/app/(dashboard)/profile/settings/page.tsx

"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { toast } from "react-toastify";
import {
  Settings,
  Bell,
  Moon,
  Globe,
  Shield,
  Download,
  Trash2,
  AlertTriangle,
  Save,
  ArrowLeft,
  Lock,
  Mail,
  Smartphone,
  Eye,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface NotificationSettings {
  emailNotifications: boolean;
  requestUpdates: boolean;
  systemUpdates: boolean;
  weeklyReports: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

interface PrivacySettings {
  profileVisibility: "public" | "team" | "private";
  showEmail: boolean;
  showPhone: boolean;
  allowDirectMessages: boolean;
  activityTracking: boolean;
}

interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  language: "ru" | "en";
  timezone: string;
  dateFormat: "DD.MM.YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  timeFormat: "24h" | "12h";
}

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Состояния настроек
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    requestUpdates: true,
    systemUpdates: false,
    weeklyReports: true,
    pushNotifications: false,
    smsNotifications: false,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "team",
    showEmail: false,
    showPhone: false,
    allowDirectMessages: true,
    activityTracking: true,
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: "system",
    language: "ru",
    timezone: "Europe/Moscow",
    dateFormat: "DD.MM.YYYY",
    timeFormat: "24h",
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleAppearanceChange = (
    key: keyof AppearanceSettings,
    value: any
  ) => {
    setAppearance((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      // Здесь будет логика сохранения настроек
      // await saveUserSettings({ notifications, privacy, appearance });

      toast.success("✅ Настройки успешно сохранены!", {
        position: "top-right",
        autoClose: 3000,
      });
      setHasChanges(false);
    } catch (error: any) {
      toast.error(`❌ Ошибка при сохранении настроек: ${error.message}`, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const handleExportData = () => {
    // Логика экспорта данных пользователя
    toast.info("📦 Экспорт данных начат. Вы получите файл на email.", {
      position: "top-right",
      autoClose: 5000,
    });
  };

  const handleDeleteAccount = () => {
    const confirmed = confirm(
      "Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо!"
    );

    if (confirmed) {
      toast.error(
        "🚫 Удаление аккаунта недоступно. Обратитесь к администратору.",
        {
          position: "top-center",
          autoClose: 5000,
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link
                href="/profile"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Settings className="h-6 w-6 mr-3 text-indigo-600" />
                  Настройки профиля
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Управление уведомлениями, приватностью и внешним видом
                </p>
              </div>
            </div>
            {hasChanges && (
              <button
                onClick={handleSaveSettings}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Сохранить изменения
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Безопасность */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-gray-600" />
                Безопасность
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Управление паролем и настройками безопасности
              </p>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Lock className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Изменить пароль
                        </p>
                        <p className="text-xs text-gray-500">
                          Обновите пароль для повышения безопасности
                        </p>
                      </div>
                    </div>
                    <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                  </div>
                </button>

                <div className="px-4 py-3 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Последний вход
                        </p>
                        <p className="text-xs text-gray-500">
                          Сегодня в 14:30 с IP 192.168.1.1
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Уведомления */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-gray-600" />
                Уведомления
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Настройте способы получения уведомлений
              </p>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Email уведомления
                      </p>
                      <p className="text-xs text-gray-500">
                        Получать уведомления на email
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleNotificationChange("emailNotifications")
                    }
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      notifications.emailNotifications
                        ? "bg-indigo-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.emailNotifications
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Обновления заявок
                      </p>
                      <p className="text-xs text-gray-500">
                        Уведомления об изменении статуса заявок
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange("requestUpdates")}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      notifications.requestUpdates
                        ? "bg-indigo-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.requestUpdates
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Smartphone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Push уведомления
                      </p>
                      <p className="text-xs text-gray-500">
                        Уведомления в браузере
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleNotificationChange("pushNotifications")
                    }
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      notifications.pushNotifications
                        ? "bg-indigo-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.pushNotifications
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Еженедельные отчеты
                      </p>
                      <p className="text-xs text-gray-500">
                        Сводка активности за неделю
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange("weeklyReports")}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      notifications.weeklyReports
                        ? "bg-indigo-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.weeklyReports
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Приватность */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-gray-600" />
                Приватность
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Управление видимостью вашего профиля
              </p>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Видимость профиля
                  </label>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) =>
                      handlePrivacyChange("profileVisibility", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="public">Публичный</option>
                    <option value="team">Только команда</option>
                    <option value="private">Приватный</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Показывать email в профиле
                    </p>
                    <p className="text-xs text-gray-500">
                      Другие пользователи смогут видеть ваш email
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handlePrivacyChange("showEmail", !privacy.showEmail)
                    }
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      privacy.showEmail ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        privacy.showEmail ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Разрешить прямые сообщения
                    </p>
                    <p className="text-xs text-gray-500">
                      Пользователи могут отправлять вам личные сообщения
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handlePrivacyChange(
                        "allowDirectMessages",
                        !privacy.allowDirectMessages
                      )
                    }
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      privacy.allowDirectMessages
                        ? "bg-indigo-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        privacy.allowDirectMessages
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Внешний вид */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Moon className="h-5 w-5 mr-2 text-gray-600" />
                Внешний вид
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Настройка темы, языка и форматов
              </p>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тема оформления
                  </label>
                  <select
                    value={appearance.theme}
                    onChange={(e) =>
                      handleAppearanceChange("theme", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="light">Светлая</option>
                    <option value="dark">Темная</option>
                    <option value="system">Системная</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Язык интерфейса
                  </label>
                  <select
                    value={appearance.language}
                    onChange={(e) =>
                      handleAppearanceChange("language", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Формат даты
                  </label>
                  <select
                    value={appearance.dateFormat}
                    onChange={(e) =>
                      handleAppearanceChange("dateFormat", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="DD.MM.YYYY">ДД.ММ.ГГГГ</option>
                    <option value="MM/DD/YYYY">ММ/ДД/ГГГГ</option>
                    <option value="YYYY-MM-DD">ГГГГ-ММ-ДД</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Формат времени
                  </label>
                  <select
                    value={appearance.timeFormat}
                    onChange={(e) =>
                      handleAppearanceChange("timeFormat", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="24h">24-часовой</option>
                    <option value="12h">12-часовой</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Экспорт данных и удаление аккаунта */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Download className="h-5 w-5 mr-2 text-gray-600" />
                Данные аккаунта
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Экспорт данных и управление аккаунтом
              </p>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <button
                  onClick={handleExportData}
                  className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Download className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Экспортировать данные
                        </p>
                        <p className="text-xs text-gray-500">
                          Скачать копию всех ваших данных
                        </p>
                      </div>
                    </div>
                    <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                  </div>
                </button>

                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-red-800 mb-2">
                          Опасная зона
                        </h4>
                        <p className="text-sm text-red-700 mb-3">
                          Удаление аккаунта необратимо. Все ваши данные будут
                          удалены без возможности восстановления.
                        </p>
                        <button
                          onClick={handleDeleteAccount}
                          className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить аккаунт
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно изменения пароля */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
