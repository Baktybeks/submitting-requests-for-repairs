// src/middleware.ts (обновленная версия)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "@/types";

export function middleware(request: NextRequest) {
  const authSession = request.cookies.get("auth-storage");
  let user = null;

  if (authSession) {
    try {
      const parsed = JSON.parse(authSession.value);
      user = parsed.state?.user;
    } catch (error) {
      console.error("Ошибка при разборе auth-session:", error);
    }
  }

  const isAuthenticated = !!user;
  const isActive = user?.isActive === true;
  const path = request.nextUrl.pathname;

  // Публичные страницы - логин и регистрация
  if (path.startsWith("/login") || path.startsWith("/register")) {
    if (isAuthenticated && isActive) {
      return redirectByRole(user.role, request);
    }
    return NextResponse.next();
  }

  // Если пользователь не авторизован или не активирован
  if (!isAuthenticated || !isActive) {
    const loginUrl = new URL(request.nextUrl.origin);
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Защита маршрутов по ролям

  // Супер админ - доступ ко всем маршрутам /admin
  if (path.startsWith("/admin") && user.role !== UserRole.SUPER_ADMIN) {
    return redirectByRole(user.role, request);
  }

  // Менеджер - доступ к маршрутам /manager
  if (
    path.startsWith("/manager") &&
    ![UserRole.SUPER_ADMIN, UserRole.MANAGER].includes(user.role)
  ) {
    return redirectByRole(user.role, request);
  }

  // Техник - доступ к маршрутам /technician
  if (
    path.startsWith("/technician") &&
    ![UserRole.SUPER_ADMIN, UserRole.TECHNICIAN].includes(user.role)
  ) {
    return redirectByRole(user.role, request);
  }

  // Заявитель - доступ к маршрутам /requester
  if (
    path.startsWith("/requester") &&
    ![UserRole.SUPER_ADMIN, UserRole.REQUESTER].includes(user.role)
  ) {
    return redirectByRole(user.role, request);
  }

  // Общий дашборд - доступ для всех авторизованных пользователей
  if (path.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Перенаправление с главной страницы
  if (path === "/") {
    return redirectByRole(user.role, request);
  }

  return NextResponse.next();
}

function redirectByRole(role: UserRole, request: NextRequest) {
  let path: string;

  switch (role) {
    case UserRole.SUPER_ADMIN:
      path = "/admin";
      break;
    case UserRole.MANAGER:
      path = "/manager";
      break;
    case UserRole.TECHNICIAN:
      path = "/technician";
      break;
    case UserRole.REQUESTER:
      path = "/requester";
      break;
    default:
      path = "/login";
  }

  const url = new URL(request.nextUrl.origin);
  url.pathname = path;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|public|favicon.ico).*)",
    "/admin/:path*",
    "/manager/:path*",
    "/technician/:path*",
    "/requester/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/",
  ],
};
