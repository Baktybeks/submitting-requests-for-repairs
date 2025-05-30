// src/utils/performance.tsx - Изменено расширение на .tsx для поддержки JSX

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Типы для утилит
type DebounceFunction<T extends (...args: any[]) => any> = T & {
  cancel: () => void;
  flush: () => void;
};

// Хук для debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Хук для debounced функций
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): DebounceFunction<T> {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Обновляем callback при изменении deps
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      callbackRef.current();
      timeoutRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  // Добавляем методы cancel и flush к функции
  (debouncedCallback as any).cancel = cancel;
  (debouncedCallback as any).flush = flush;

  return debouncedCallback as DebounceFunction<T>;
}

// Хук для throttled функций
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const callbackRef = useRef(callback);
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  const throttledCallback = useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= delay) {
        lastCallRef.current = now;
        callbackRef.current(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callbackRef.current(...args);
        }, delay - timeSinceLastCall);
      }
    }) as T,
    [delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

// Хук для отслеживания предыдущего значения
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// Хук для intersection observer (виртуализация)
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefCallback<Element>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState<Element | null>(null);

  const observer = useMemo(
    () =>
      typeof window !== "undefined"
        ? new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
          }, options)
        : null,
    [options.root, options.rootMargin, options.threshold]
  );

  useEffect(() => {
    if (!observer || !element) return;

    observer.observe(element);
    return () => observer.disconnect();
  }, [observer, element]);

  const ref = useCallback((node: Element | null) => {
    setElement(node);
  }, []);

  return [ref, isIntersecting];
}

// Хук для мемоизации тяжелых вычислений
export function useExpensiveValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

// Хук для отслеживания размеров элемента
export function useElementSize(): [
  React.RefCallback<HTMLElement>,
  { width: number; height: number }
] {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [element, setElement] = useState<HTMLElement | null>(null);

  const observer = useMemo(
    () =>
      typeof window !== "undefined"
        ? new ResizeObserver((entries) => {
            for (const entry of entries) {
              const { width, height } = entry.contentRect;
              setSize({ width, height });
            }
          })
        : null,
    []
  );

  useEffect(() => {
    if (!observer || !element) return;

    observer.observe(element);
    return () => observer.disconnect();
  }, [observer, element]);

  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  return [ref, size];
}

// Хук для состояния со стабильными сеттерами
export function useStableState<T>(
  initialState: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState(initialState);

  const stableSetState = useCallback((value: T | ((prev: T) => T)) => {
    setState(value);
  }, []);

  return [state, stableSetState];
}

// Хук для пагинации
export function usePagination<T>({
  data,
  pageSize = 10,
  initialPage = 1,
}: {
  data: T[];
  pageSize?: number;
  initialPage?: number;
}) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const paginatedData = useMemo(() => {
    const totalPages = Math.ceil(data.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      items: data.slice(startIndex, endIndex),
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    };
  }, [data, pageSize, currentPage]);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, paginatedData.totalPages)));
    },
    [paginatedData.totalPages]
  );

  const nextPage = useCallback(() => {
    if (paginatedData.hasNext) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [paginatedData.hasNext]);

  const prevPage = useCallback(() => {
    if (paginatedData.hasPrev) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [paginatedData.hasPrev]);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    ...paginatedData,
    currentPage,
    goToPage,
    nextPage,
    prevPage,
    reset,
  };
}

// Компонент для lazy loading
interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export function LazyComponent({
  children,
  fallback = null,
  rootMargin = "100px",
  threshold = 0,
}: LazyComponentProps) {
  const [ref, isVisible] = useIntersectionObserver({
    rootMargin,
    threshold,
  });

  return <div ref={ref}>{isVisible ? children : fallback}</div>;
}

// Хук для отслеживания производительности
export function usePerformanceMonitor(name: string) {
  const startTime = useRef<number | undefined>(undefined);

  useEffect(() => {
    startTime.current = performance.now();

    return () => {
      if (startTime.current) {
        const duration = performance.now() - startTime.current;
        if (process.env.NODE_ENV === "development") {
          console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
        }
      }
    };
  }, [name]);

  const mark = useCallback(
    (label: string) => {
      if (startTime.current) {
        const duration = performance.now() - startTime.current;
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[Performance] ${name} - ${label}: ${duration.toFixed(2)}ms`
          );
        }
      }
    },
    [name]
  );

  return { mark };
}
