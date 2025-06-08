// src/components/common/Navbar.tsx (Рефакторинг)

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole, getRoleLabel, getRoleColor } from "@/types";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  Bell,
  Search,
  Plus,
  BarChart3,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { useDebouncedCallback } from "@/utils/performance";

// Типы для навигации
interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description?: string;
  requiresPermission?: string;
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

export function Navbar() {
  const {
    user,
    logout,
    isLoggingOut,
    canManageUsers,
    canManageRequests,
    canCreateRequests,
  } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const getDashboardPath = useCallback((role: UserRole): string => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "/admin"; // Изменено с /super-admin на /admin
      case UserRole.MANAGER:
        return "/manager";
      case UserRole.TECHNICIAN:
        return "/technician";
      case UserRole.REQUESTER:
        return "/requester";
      default:
        return "/";
    }
  }, []);

  const debouncedLogout = useDebouncedCallback(async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  }, 300);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const toggleProfileMenu = useCallback(() => {
    setIsProfileMenuOpen((prev) => !prev);
  }, []);

  const closeMenus = useCallback(() => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, []);

  // Генерация навигационных ссылок на основе роли
  const navigationGroups = useMemo((): NavigationGroup[] => {
    if (!user) return [];

    const groups: NavigationGroup[] = [];

    // Основные разделы
    const mainItems: NavigationItem[] = [
      {
        href: getDashboardPath(user.role),
        label: "Главная",
        icon: Home,
        description: "Обзор и статистика",
      },
    ];

    // Заявки
    const requestItems: NavigationItem[] = [];

    if (canManageRequests) {
      requestItems.push({
        href: "/requests",
        label: "Все заявки",
        icon: ClipboardList,
        description: "Управление всеми заявками",
      });
    }

    if (canCreateRequests) {
      requestItems.push({
        href: "/requests/create",
        label: "Новая заявка",
        icon: Plus,
        description: "Создать заявку на ремонт",
      });
    }

    if (user.role === UserRole.TECHNICIAN) {
      requestItems.push({
        href: "/technician/assigned",
        label: "Мои заявки",
        icon: Wrench,
        description: "Назначенные мне заявки",
      });
    }

    if (user.role === UserRole.REQUESTER) {
      requestItems.push({
        href: "/requester/requests",
        label: "Мои заявки",
        icon: ClipboardList,
        description: "Поданные мною заявки",
      });
    }

    if (canCreateRequests) {
      requestItems.push({
        href: "/requests/create",
        label: "Новая заявка",
        icon: Plus,
        description: "Создать заявку на ремонт",
      });
    }

    if (requestItems.length > 0) {
      groups.push({
        title: "Заявки",
        items: requestItems,
      });
    }

    // Управление (только для админов и менеджеров)
    if (canManageUsers || user.role === UserRole.SUPER_ADMIN) {
      const managementItems: NavigationItem[] = [];

      if (canManageUsers) {
        managementItems.push({
          href: "/admin/users",
          label: "Пользователи",
          icon: Users,
          description: "Управление пользователями",
        });
      }

      managementItems.push(
        {
          href: "/analytics",
          label: "Аналитика",
          icon: BarChart3,
          description: "Отчеты и статистика",
        },
        {
          href: "/settings",
          label: "Настройки",
          icon: Settings,
          description: "Настройки системы",
        }
      );

      groups.push({
        title: "Управление",
        items: managementItems,
      });
    }

    // Основная группа всегда первая
    groups.unshift({
      title: "Основное",
      items: mainItems,
    });

    return groups;
  }, [
    user,
    canManageUsers,
    canManageRequests,
    canCreateRequests,
    getDashboardPath,
  ]);

  // Проверка активного пути
  const isActivePath = useCallback(
    (href: string): boolean => {
      if (href === getDashboardPath(user?.role || UserRole.REQUESTER)) {
        return pathname === href;
      }
      return pathname.startsWith(href);
    },
    [pathname, user?.role, getDashboardPath]
  );

  // Иконка роли
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

  const RoleIcon = getRoleIcon(user.role);

  return (
    <>
      {/* Основная навигационная панель */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Левая часть - лого и основная навигация */}
            <div className="flex items-center">
              {/* Лого */}
              <Link
                href={getDashboardPath(user.role)}
                className="flex-shrink-0 flex items-center group"
                onClick={closeMenus}
              >
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-700 transition-colors">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                  Система заявок
                </span>
              </Link>

              {/* Десктопная навигация */}
              <div className="hidden lg:ml-8 lg:flex lg:space-x-1">
                {navigationGroups[0]?.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    isActive={isActivePath(item.href)}
                    onClick={closeMenus}
                  />
                ))}
              </div>
            </div>

            {/* Правая часть - действия и профиль */}
            <div className="flex items-center space-x-4">
              {/* Поиск (скрыт на мобильных) */}
              <div className="hidden md:block">
                <SearchButton />
              </div>

              {/* Уведомления */}
              <NotificationButton />

              {/* Быстрые действия */}
              {canCreateRequests && (
                <Link
                  href="/requests/create"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  onClick={closeMenus}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Новая заявка</span>
                </Link>
              )}

              {/* Профиль пользователя - десктоп */}
              <div className="hidden md:block relative">
                <UserProfileDropdown
                  user={user}
                  isOpen={isProfileMenuOpen}
                  onToggle={toggleProfileMenu}
                  onLogout={debouncedLogout}
                  isLoggingOut={isLoggingOut}
                  onClose={closeMenus}
                />
              </div>

              {/* Мобильное меню - кнопка */}
              <div className="md:hidden">
                <button
                  onClick={toggleMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                  aria-expanded={isMenuOpen}
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
      </nav>

      {/* Мобильное меню */}
      <MobileMenu
        isOpen={isMenuOpen}
        navigationGroups={navigationGroups}
        user={user}
        isActivePath={isActivePath}
        onLogout={debouncedLogout}
        isLoggingOut={isLoggingOut}
        onClose={closeMenus}
      />

      {/* Оверлей для закрытия меню */}
      {(isMenuOpen || isProfileMenuOpen) && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-25 md:hidden"
          onClick={closeMenus}
        />
      )}
    </>
  );
}

// Компонент ссылки навигации
interface NavLinkProps {
  item: NavigationItem;
  isActive: boolean;
  onClick: () => void;
  mobile?: boolean;
}

function NavLink({ item, isActive, onClick, mobile = false }: NavLinkProps) {
  const baseClasses = mobile
    ? "flex items-center px-4 py-3 text-base font-medium transition-colors"
    : "inline-flex items-center px-3 py-2 text-sm font-medium transition-colors";

  const activeClasses = mobile
    ? "text-indigo-700 bg-indigo-50 border-r-4 border-indigo-700"
    : "text-indigo-600 border-b-2 border-indigo-500";

  const inactiveClasses = mobile
    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300";

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <item.icon
        className={`${mobile ? "h-5 w-5 mr-3" : "h-4 w-4 mr-2"} flex-shrink-0`}
      />
      {item.label}
      {item.badge && (
        <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

// Компонент мобильного меню
interface MobileMenuProps {
  isOpen: boolean;
  navigationGroups: NavigationGroup[];
  user: any;
  isActivePath: (href: string) => boolean;
  onLogout: () => void;
  isLoggingOut: boolean;
  onClose: () => void;
}

function MobileMenu({
  isOpen,
  navigationGroups,
  user,
  isActivePath,
  onLogout,
  isLoggingOut,
  onClose,
}: MobileMenuProps) {
  if (!isOpen) return null;

  const RoleIcon =
    user.role === UserRole.SUPER_ADMIN
      ? Shield
      : user.role === UserRole.MANAGER
      ? Users
      : user.role === UserRole.TECHNICIAN
      ? Wrench
      : User;

  return (
    <div className="md:hidden fixed top-16 inset-x-0 z-40 bg-white shadow-lg border-b border-gray-200 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="pt-2 pb-3 space-y-1">
        {/* Профиль пользователя в мобильном меню */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center">
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
        </div>

        {/* Навигационные группы */}
        {navigationGroups.map((group, groupIndex) => (
          <div key={group.title}>
            {groupIndex > 0 && (
              <div className="border-t border-gray-200 my-2" />
            )}
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {group.title}
              </h3>
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={isActivePath(item.href)}
                onClick={onClose}
                mobile
              />
            ))}
          </div>
        ))}

        {/* Действия */}
        <div className="border-t border-gray-200 pt-4 pb-3">
          <div className="px-4 space-y-2">
            <button
              onClick={() => {
                onClose();
                // Открыть поиск
              }}
              className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Search className="h-5 w-5 mr-3" />
              Поиск
            </button>

            <Link
              href="/help"
              onClick={onClose}
              className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <HelpCircle className="h-5 w-5 mr-3" />
              Помощь
            </Link>

            <button
              onClick={onLogout}
              disabled={isLoggingOut}
              className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mr-3"></div>
              ) : (
                <LogOut className="h-5 w-5 mr-3" />
              )}
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент выпадающего меню профиля
interface UserProfileDropdownProps {
  user: any;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  onClose: () => void;
}

function UserProfileDropdown({
  user,
  isOpen,
  onToggle,
  onLogout,
  isLoggingOut,
  onClose,
}: UserProfileDropdownProps) {
  const RoleIcon =
    user.role === UserRole.SUPER_ADMIN
      ? Shield
      : user.role === UserRole.MANAGER
      ? Users
      : user.role === UserRole.TECHNICIAN
      ? Wrench
      : User;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
          <RoleIcon className="h-5 w-5 text-gray-600" />
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">{user.name}</div>
          <div className="text-xs text-gray-500">{getRoleLabel(user.role)}</div>
        </div>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {/* Информация о пользователе */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${getRoleColor(
                  user.role
                )}`}
              >
                {getRoleLabel(user.role)}
              </span>
            </div>

            {/* Ссылки профиля */}
            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User className="h-4 w-4 mr-3" />
              Мой профиль
            </Link>

            <Link
              href="/profile/settings"
              onClick={onClose}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className="h-4 w-4 mr-3" />
              Настройки
            </Link>

            <div className="border-t border-gray-100">
              <button
                onClick={onLogout}
                disabled={isLoggingOut}
                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-3"></div>
                ) : (
                  <LogOut className="h-4 w-4 mr-3" />
                )}
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент кнопки поиска
function SearchButton() {
  return (
    <button
      onClick={() => {
        // TODO: Открыть модальное окно поиска
        console.log("Открыть поиск");
      }}
      className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
      title="Поиск"
    >
      <Search className="h-5 w-5" />
    </button>
  );
}

// Компонент кнопки уведомлений
function NotificationButton() {
  const [hasUnread] = useState(false); // TODO: Подключить к реальным данным

  return (
    <button
      onClick={() => {
        // TODO: Открыть панель уведомлений
        console.log("Открыть уведомления");
      }}
      className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
      title="Уведомления"
    >
      <Bell className="h-5 w-5" />
      {hasUnread && (
        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
      )}
    </button>
  );
}
