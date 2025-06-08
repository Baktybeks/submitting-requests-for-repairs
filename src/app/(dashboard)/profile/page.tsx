// src/app/(dashboard)/profile/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateUserProfile } from "@/services/authService";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { UserRole } from "@/types";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  Shield,
  Wrench,
  Settings,
  Save,
  Camera,
  Lock,
  Edit3,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  specialization: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const updateProfileMutation = useUpdateUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    specialization: user?.specialization || "",
  });

  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});

  // Синхронизация данных пользователя с формой
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        specialization: user.specialization || "",
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Имя обязательно";
    } else if (formData.name.length < 2) {
      newErrors.name = "Имя должно содержать минимум 2 символа";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email обязателен";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Некорректный формат email";
    }

    if (formData.phone && !/^[\+\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Некорректный формат телефона";
    }

    if (user.role === UserRole.TECHNICIAN && !formData.specialization.trim()) {
      newErrors.specialization = "Специализация обязательна для техников";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Очищаем ошибку для поля при изменении
    if (errors[name as keyof ProfileFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.warning("⚠️ Проверьте правильность заполнения формы");
      return;
    }

    try {
      const updates: any = {};

      // Добавляем только измененные поля
      if (formData.name !== user.name) updates.name = formData.name;
      if (formData.email !== user.email) updates.email = formData.email;
      if (formData.phone !== (user.phone || "")) updates.phone = formData.phone;
      if (
        user.role === UserRole.TECHNICIAN &&
        formData.specialization !== (user.specialization || "")
      ) {
        updates.specialization = formData.specialization;
      }

      if (Object.keys(updates).length === 0) {
        toast.info("ℹ️ Нет изменений для сохранения");
        setIsEditing(false);
        return;
      }

      await updateProfileMutation.mutateAsync({
        userId: user.$id,
        updates,
      });

      setIsEditing(false);
      toast.success("✅ Профиль успешно обновлен!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error: any) {
      toast.error(`❌ Ошибка при обновлении профиля: ${error.message}`, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      specialization: user.specialization || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        return Shield;
      case UserRole.MANAGER:
        return User;
      case UserRole.TECHNICIAN:
        return Wrench;
      case UserRole.REQUESTER:
        return User;
      default:
        return User;
    }
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        return "Супер администратор";
      case UserRole.MANAGER:
        return "Менеджер";
      case UserRole.TECHNICIAN:
        return "Техник";
      case UserRole.REQUESTER:
        return "Заявитель";
      default:
        return user.role;
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        return "bg-red-100 text-red-800";
      case UserRole.MANAGER:
        return "bg-blue-100 text-blue-800";
      case UserRole.TECHNICIAN:
        return "bg-green-100 text-green-800";
      case UserRole.REQUESTER:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Settings className="h-6 w-6 mr-3 text-indigo-600" />
                Профиль пользователя
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Управление личной информацией и настройками аккаунта
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Редактировать
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    disabled={updateProfileMutation.isPending}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updateProfileMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Сохранить
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - Информация о профиле */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
                <div className="flex flex-col items-center text-white">
                  <div className="relative mb-4">
                    <div className="h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <RoleIcon className="h-10 w-10" />
                    </div>
                    <button className="absolute bottom-0 right-0 h-6 w-6 bg-white rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                      <Camera className="h-3 w-3" />
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-sm opacity-90">{user.email}</p>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Роль в системе
                    </label>
                    <span
                      className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor()}`}
                    >
                      <RoleIcon className="h-4 w-4 mr-2" />
                      {getRoleLabel()}
                    </span>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Статус аккаунта
                    </label>
                    <div className="mt-1 flex items-center">
                      {user.isActive ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm text-green-700">
                            Активен
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-sm text-yellow-700">
                            Неактивен
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-600 space-y-2">
                      <div>
                        <span className="font-medium">ID:</span>
                        <span className="ml-2 font-mono text-xs break-all">
                          {user.$id}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Дата регистрации:</span>
                        <span className="ml-2">
                          {new Date(user.$createdAt).toLocaleDateString(
                            "ru-RU"
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">
                          Последнее обновление:
                        </span>
                        <span className="ml-2">
                          {new Date(user.$updatedAt).toLocaleDateString(
                            "ru-RU"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Безопасность */}
            <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-gray-600" />
                  Безопасность
                </h3>
              </div>
              <div className="px-6 py-4">
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Изменить пароль
                      </p>
                      <p className="text-xs text-gray-500">
                        Обновите пароль для безопасности
                      </p>
                    </div>
                    <Edit3 className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Правая колонка - Форма редактирования */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Основная информация
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {isEditing
                    ? "Внесите изменения в свой профиль"
                    : "Просмотр информации профиля"}
                </p>
              </div>

              <div className="px-6 py-6">
                <div className="space-y-6">
                  {/* Имя */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <User className="inline h-4 w-4 mr-1" />
                      Полное имя *
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.name
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-300 focus:border-indigo-500"
                          }`}
                          placeholder="Введите ваше полное имя"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.name}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        {user.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email адрес *
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.email
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-300 focus:border-indigo-500"
                          }`}
                          placeholder="email@example.com"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.email}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        {user.email}
                      </p>
                    )}
                  </div>

                  {/* Телефон */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <Phone className="inline h-4 w-4 mr-1" />
                      Номер телефона
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.phone
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-300 focus:border-indigo-500"
                          }`}
                          placeholder="+7 (999) 123-45-67"
                        />
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.phone}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        {user.phone || "Не указан"}
                      </p>
                    )}
                  </div>

                  {/* Специализация для техников */}
                  {user.role === UserRole.TECHNICIAN && (
                    <div>
                      <label
                        htmlFor="specialization"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        <Wrench className="inline h-4 w-4 mr-1" />
                        Специализация *
                      </label>
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            id="specialization"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleInputChange}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              errors.specialization
                                ? "border-red-300 focus:border-red-500"
                                : "border-gray-300 focus:border-indigo-500"
                            }`}
                            placeholder="Например: Электрик, сантехник, маляр..."
                          />
                          {errors.specialization && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.specialization}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                          {user.specialization || "Не указана"}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                            <span className="text-blue-600 text-sm">ℹ️</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            Информация о изменениях
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <ul className="space-y-1">
                              <li>
                                • Изменения будут сохранены в вашем профиле
                              </li>
                              <li>
                                • Роль в системе может изменить только
                                администратор
                              </li>
                              <li>
                                • При изменении email может потребоваться
                                подтверждение
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
