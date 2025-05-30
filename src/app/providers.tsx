// app/providers.tsx
"use client";

import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AxiosError } from "axios";
import { useSyncAuthCookie } from "@/hooks/useSyncAuthCookie";
import { ClientOnlyToastContainer } from "@/components/ClientOnlyToastContainer";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (
                error instanceof AxiosError &&
                error.response?.status === 429
              ) {
                return failureCount < 3;
              }
              return false;
            },
          },
        },
      })
  );

  // Состояние для отслеживания монтирования на клиенте
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useSyncAuthCookie();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Рендерим devtools только на клиенте в dev режиме */}
      {isClient && process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools />
      )}
      <ClientOnlyToastContainer />
    </QueryClientProvider>
  );
}
