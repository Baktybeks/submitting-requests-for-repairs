// src/components/requests/CreateRequestForm.tsx

"use client";

import React, { useState } from "react";
import { useCreateRequest } from "@/services/maintenanceService";
import { useAuth } from "@/hooks/useAuth";
import {
  RequestCategory,
  RequestPriority,
  CreateMaintenanceRequestDto,
  getCategoryLabel,
  getPriorityLabel,
} from "@/types";
import { toast } from "react-toastify";
import { Wrench, AlertTriangle, MapPin, FileText } from "lucide-react";

interface CreateRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateRequestForm({
  onSuccess,
  onCancel,
}: CreateRequestFormProps) {
  const { user } = useAuth();
  const createRequestMutation = useCreateRequest();

  const [formData, setFormData] = useState<CreateMaintenanceRequestDto>({
    title: "",
    description: "",
    category: RequestCategory.OTHER,
    priority: RequestPriority.MEDIUM,
    location: "",
  });

  const [errors, setErrors] = useState<Partial<CreateMaintenanceRequestDto>>(
    {}
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateMaintenanceRequestDto> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Заголовок обязателен";
    } else if (formData.title.length < 5) {
      newErrors.title = "Заголовок должен содержать минимум 5 символов";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Описание обязательно";
    } else if (formData.description.length < 10) {
      newErrors.description = "Описание должно содержать минимум 10 символов";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Местоположение обязательно";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("❌ Ошибка: пользователь не авторизован");
      return;
    }

    if (!validateForm()) {
      toast.warning("⚠️ Проверьте правильность заполнения формы");
      return;
    }

    try {
      await createRequestMutation.mutateAsync({
        data: formData,
        requesterId: user.$id,
      });

      toast.success("✅ Заявка успешно создана!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Сброс формы
      setFormData({
        title: "",
        description: "",
        category: RequestCategory.OTHER,
        priority: RequestPriority.MEDIUM,
        location: "",
      });
      setErrors({});

      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error?.message || "Произошла ошибка при создании заявки";
      toast.error(`❌ ${errorMessage}`, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Очищаем ошибку для поля при изменении
    if (errors[name as keyof CreateMaintenanceRequestDto]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-indigo-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <Wrench className="h-6 w-6 text-white" />
          <h2 className="text-xl font-semibold text-white">
            Новая заявка на ремонт/обслуживание
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Заголовок */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <FileText className="inline h-4 w-4 mr-1" />
            Заголовок заявки *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.title
                ? "border-red-300 focus:border-red-500"
                : "border-gray-300 focus:border-indigo-500"
            }`}
            placeholder="Краткое описание проблемы"
            maxLength={255}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Описание */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Подробное описание *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.description
                ? "border-red-300 focus:border-red-500"
                : "border-gray-300 focus:border-indigo-500"
            }`}
            placeholder="Детально опишите проблему, что именно нужно отремонтировать или обслужить..."
            maxLength={2000}
          />
          <div className="mt-1 flex justify-between items-center">
            {errors.description ? (
              <p className="text-sm text-red-600">{errors.description}</p>
            ) : (
              <p className="text-sm text-gray-500">Минимум 10 символов</p>
            )}
            <p className="text-sm text-gray-400">
              {formData.description.length}/2000
            </p>
          </div>
        </div>

        {/* Местоположение */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <MapPin className="inline h-4 w-4 mr-1" />
            Местоположение *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.location
                ? "border-red-300 focus:border-red-500"
                : "border-gray-300 focus:border-indigo-500"
            }`}
            placeholder="Например: Офис 205, 2 этаж, здание А"
            maxLength={500}
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
        </div>

        {/* Категория и Приоритет в одной строке */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Категория */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Категория работ
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {Object.values(RequestCategory).map((category) => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>

          {/* Приоритет */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              Приоритет
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {Object.values(RequestPriority).map((priority) => (
                <option key={priority} value={priority}>
                  {getPriorityLabel(priority)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Информационная панель */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                <span className="text-blue-600 text-sm">ℹ️</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Что происходит после отправки заявки?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="space-y-1">
                  <li>• Ваша заявка будет рассмотрена менеджером</li>
                  <li>• К ней будет назначен подходящий техник</li>
                  <li>• Вы получите уведомление о статусе выполнения</li>
                  <li>• Вы сможете отслеживать прогресс в личном кабинете</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <button
            type="submit"
            disabled={createRequestMutation.isPending}
            className="flex-1 sm:flex-none px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
          >
            {createRequestMutation.isPending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Создание...
              </div>
            ) : (
              "Создать заявку"
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={createRequestMutation.isPending}
              className="flex-1 sm:flex-none px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Отмена
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
