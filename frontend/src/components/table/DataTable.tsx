/**
 * 데이터 테이블 컴포넌트
 * 정렬, 페이지네이션 지원
 */

import { useTable } from './useTable';
import TablePagination from './TablePagination';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
  emptyMessage = '데이터가 없습니다.',
  onRowClick,
}: DataTableProps<T>) {
  const table = useTable({ data, initialPageSize: pageSize });

  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    const icon = table.getSortIcon(column.key as string);
    return (
      <span className="ml-1 inline-block">
        {icon === 'asc' && '↑'}
        {icon === 'desc' && '↓'}
        {icon === 'none' && <span className="text-gray-300">↕</span>}
      </span>
    );
  };

  const getValue = (row: T, key: string): unknown => {
    return key.split('.').reduce<unknown>((obj, k) => {
      if (obj && typeof obj === 'object') {
        return (obj as Record<string, unknown>)[k];
      }
      return undefined;
    }, row);
  };

  if (data.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  onClick={() => column.sortable && table.toggleSort(column.key as string)}
                  className={`px-4 py-3 text-left font-medium text-gray-700 ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                  } ${column.className || ''}`}
                >
                  {column.header}
                  {renderSortIcon(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.pageData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              >
                {columns.map((column) => {
                  const value = getValue(row, column.key as string);
                  return (
                    <td key={column.key as string} className={`px-4 py-3 ${column.className || ''}`}>
                      {column.render ? column.render(value, row) : String(value ?? '-')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TablePagination
        currentPage={table.currentPage}
        totalPages={table.totalPages}
        totalItems={table.totalItems}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
      />
    </div>
  );
}
