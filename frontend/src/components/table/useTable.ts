/**
 * 테이블 상태 관리 훅
 * 정렬, 페이지네이션 지원
 */

import { useState, useMemo, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  column: string | null;
  direction: SortDirection;
}

interface UseTableOptions<T> {
  data: T[];
  initialPageSize?: number;
  initialSort?: SortState;
}

interface UseTableReturn<T> {
  // 데이터
  pageData: T[];
  totalItems: number;
  totalPages: number;

  // 페이지네이션
  currentPage: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // 정렬
  sortState: SortState;
  toggleSort: (column: string) => void;
  getSortIcon: (column: string) => 'asc' | 'desc' | 'none';
}

export function useTable<T extends Record<string, unknown>>({
  data,
  initialPageSize = 10,
  initialSort = { column: null, direction: null },
}: UseTableOptions<T>): UseTableReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [sortState, setSortState] = useState<SortState>(initialSort);

  // 정렬된 데이터
  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortState.column as keyof T];
      const bVal = b[sortState.column as keyof T];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortState.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortState]);

  // 페이지네이션된 데이터
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(data.length / pageSize);

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages || 1)));
  }, [totalPages]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  const toggleSort = useCallback((column: string) => {
    setSortState((prev) => {
      if (prev.column !== column) {
        return { column, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { column, direction: 'desc' };
      }
      return { column: null, direction: null };
    });
  }, []);

  const getSortIcon = useCallback(
    (column: string): 'asc' | 'desc' | 'none' => {
      if (sortState.column !== column) return 'none';
      return sortState.direction || 'none';
    },
    [sortState]
  );

  return {
    pageData,
    totalItems: data.length,
    totalPages,
    currentPage,
    pageSize,
    setPage,
    setPageSize,
    sortState,
    toggleSort,
    getSortIcon,
  };
}
