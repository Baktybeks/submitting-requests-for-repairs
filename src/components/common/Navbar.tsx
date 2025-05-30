// src/components/common/Navbar.tsx

"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole, getRoleLabel, getRoleColor } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Home,
  ClipboardList,
  Users,
  Wrench,
  Shield,
} from "lucide-react";

export function Navbar() {
  const { user, logout, isLoggingOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  const getNavigationLinks = () => {
    if (!user) return [];

    const baseLinks = [
      {
        href: getDashboardPath(user.role),
        label: "Главная",
        icon: Home,
      },
    ];

    // Добавляем ссылки в зависимости от роли
    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        return [
          ...baseLinks,
          { href: "/admin/users", label: "Пользователи", icon: Users },
          { href: "/admin/requests", label: "Все заявки", icon: ClipboardList },
          { href: "/admin/analytics", label: "Аналитика", icon: Settings },
        ];

      case UserRole.MANAGER:
        return [
          ...baseLinks,
          { href: "/manager/requests", label: "Заявки", icon: ClipboardList },
          { href: "/manager/team", label: "Команда", icon: Users },
          { href: "/manager/analytics", label: "Аналитика", icon: Settings },
        ];

      case UserRole.TECHNICIAN:
        return [
          ...baseLinks,
          { href: "/technician/assigned", label: "Мои заявки", icon: Wrench },
          { href: "/technician/all", label: "Все заявки", icon: ClipboardList },
        ];

      case UserRole.REQUESTER:
        return [
          ...baseLinks,
          {
            href: "/requester/requests",
            label: "Мои заявки",
            icon: ClipboardList,
          },
          {
            href: "/requester/create",
            label: "Новая заявка",
            icon: ClipboardList,
          },
        ];

      default:
        return baseLinks;
    }
  };

  const getDashboardPath = (role: UserRole): string => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "/admin";
      case UserRole.MANAGER:
        return "/manager";
      case UserRole.TECHNICIAN:
        return "/technician";
      case UserRole.REQUESTER:
        return "/requester";
      default:
        return "/";
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return Shield;
      case UserRole.MANAGER:
        return Users;
      case UserRole.TECHNICIAN:
        return Wrench;
      case UserRole.REQUESTER:
        return User;
      default:
        return User;
    }
  };

  if (!user) {
    return null;
  }

  const navigationLinks = getNavigationLinks();
  const RoleIcon = getRoleIcon(user.role);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Левая часть - лого и навигация */}
          <div className="flex items-center">
            {/* Лого */}
            <Link
              href={getDashboardPath(user.role)}
              className="flex-shrink-0 flex items-center"
            >
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                Система заявок
              </span>
            </Link>

            {/* Навигационные ссылки - десктоп */}
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent transition-colors"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Правая часть - профиль пользователя */}
          <div className="flex items-center">
            {/* Информация о пользователе - десктоп */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <div className="flex items-center justify-end">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                      user.role
                    )}`}
                  >
                    <RoleIcon className="h-3 w-3 mr-1" />
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>

              {/* Кнопка выхода */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Выйти
              </button>
            </div>

            {/* Мобильное меню - кнопка */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Профиль пользователя в мобильном меню */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <RoleIcon className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {user.name}
                </div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleColor(
                    user.role
                  )}`}
                >
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 mr-3"></div>
                ) : (
                  <LogOut className="h-5 w-5 mr-3" />
                )}
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
