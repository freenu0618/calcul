/**
 * 테이블 페이지네이션 컴포넌트
 */

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: TablePaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage > 3) pages.push('ellipsis');

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push('ellipsis');

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-200">
      {/* 표시 정보 */}
      <div className="text-sm text-gray-600">
        {totalItems > 0 ? (
          <>
            <span className="font-medium">{startItem}</span> - <span className="font-medium">{endItem}</span>
            {' / '}
            <span className="font-medium">{totalItems}</span>개
          </>
        ) : (
          '데이터 없음'
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* 페이지 크기 선택 */}
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}개씩
              </option>
            ))}
          </select>
        )}

        {/* 페이지 네비게이션 */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {getPageNumbers().map((page, idx) =>
            page === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[32px] h-8 rounded text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
}
