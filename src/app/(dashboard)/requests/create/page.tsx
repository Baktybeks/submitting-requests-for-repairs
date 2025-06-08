// src/app/(dashboard)/requests/create/page.tsx

"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { CreateRequestForm } from "@/components/requests/CreateRequestForm";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function CreateRequestPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleSuccess = () => {
    // Перенаправляем в зависимости от роли
    switch (user.role) {
      case "SUPER_ADMIN":
        router.push("/admin");
        break;
      case "MANAGER":
        router.push("/manager");
        break;
      case "REQUESTER":
        router.push("/requester");
        break;
      default:
        router.push("/");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={handleCancel}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Создание новой заявки
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Заполните форму для создания заявки на ремонт или обслуживание
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CreateRequestForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}
