// src/components/profile/ChangePasswordModal.tsx

"use client";

import React, { useState } from "react";
import { account } from "@/services/appwriteClient";
import { toast } from "react-toastify";
import { X, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<PasswordFormData>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<PasswordFormData> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Введите текущий пароль";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Введите новый пароль";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Пароль должен содержать минимум 8 символов";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword =
        "Пароль должен содержать заглавные и строчные буквы, цифры";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Подтвердите новый пароль";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "Новый пароль должен отличаться от текущего";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Очищаем ошибку для поля при изменении
    if (errors[name as keyof PasswordFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.warning("⚠️ Проверьте правильность заполнения формы");
      return;
    }

    setIsSubmitting(true);

    try {
      // Используем Appwrite API для изменения пароля
      await account.updatePassword(
        formData.newPassword,
        formData.currentPassword
      );

      toast.success("✅ Пароль успешно изменен!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Сброс формы и закрытие модального окна
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      onClose();
    } catch (error: any) {
      console.error("Ошибка при изменении пароля:", error);

      let errorMessage = "Произошла ошибка при изменении пароля";

      if (error.code === 401) {
        errorMessage = "Неверный текущий пароль";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`❌ ${errorMessage}`, {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;

    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    onClose();
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    return strength;
  };

  const getPasswordStrengthLabel = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return { label: "Слабый", color: "text-red-600" };
      case 2:
        return { label: "Слабый", color: "text-red-600" };
      case 3:
        return { label: "Средний", color: "text-yellow-600" };
      case 4:
        return { label: "Хороший", color: "text-green-600" };
      case 5:
        return { label: "Отличный", color: "text-green-700" };
      default:
        return { label: "", color: "" };
    }
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);
  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-indigo-600" />
            Изменить пароль
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Текущий пароль */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Текущий пароль *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`block w-full pr-10 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.currentPassword
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-indigo-500"
                  }`}
                  placeholder="Введите текущий пароль"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  disabled={isSubmitting}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* Новый пароль */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Новый пароль *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`block w-full pr-10 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.newPassword
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-indigo-500"
                  }`}
                  placeholder="Введите новый пароль"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  disabled={isSubmitting}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Индикатор сложности пароля */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Сложность пароля:</span>
                    <span className={strengthInfo.color}>
                      {strengthInfo.label}
                    </span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        passwordStrength <= 2
                          ? "bg-red-500"
                          : passwordStrength === 3
                          ? "bg-yellow-500"
                          : passwordStrength === 4
                          ? "bg-green-500"
                          : "bg-green-600"
                      }`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Подтверждение пароля */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Подтвердите новый пароль *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`block w-full pr-10 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.confirmPassword
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-indigo-500"
                  }`}
                  placeholder="Повторите новый пароль"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  disabled={isSubmitting}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Требования к паролю */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Требования к паролю:
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li
                className={
                  formData.newPassword.length >= 8
                    ? "text-green-600"
                    : "text-gray-600"
                }
              >
                ✓ Минимум 8 символов
              </li>
              <li
                className={
                  /[a-z]/.test(formData.newPassword)
                    ? "text-green-600"
                    : "text-gray-600"
                }
              >
                ✓ Строчные буквы (a-z)
              </li>
              <li
                className={
                  /[A-Z]/.test(formData.newPassword)
                    ? "text-green-600"
                    : "text-gray-600"
                }
              >
                ✓ Заглавные буквы (A-Z)
              </li>
              <li
                className={
                  /\d/.test(formData.newPassword)
                    ? "text-green-600"
                    : "text-gray-600"
                }
              >
                ✓ Цифры (0-9)
              </li>
              <li
                className={
                  /[^a-zA-Z\d]/.test(formData.newPassword)
                    ? "text-green-600"
                    : "text-gray-600"
                }
              >
                ✓ Специальные символы (!@#$%^&*)
              </li>
            </ul>
          </div>

          {/* Кнопки */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSubmitting || passwordStrength < 3}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Изменение...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Изменить пароль
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
