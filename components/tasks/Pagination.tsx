'use client';

import type { IPagination } from '@/types';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

interface PaginationProps {
  pagination: IPagination | null;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{start}–{end}</span> of{' '}
        <span className="font-semibold text-gray-700 dark:text-gray-300">{total}</span> tasks
      </p>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!pagination.hasPrev}
          className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <HiChevronLeft size={18} />
        </button>

        {/* First page if not visible */}
        {pages[0] > 1 && (
          <>
            <PageButton num={1} active={page === 1} onClick={() => onPageChange(1)} />
            {pages[0] > 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}

        {pages.map((num) => (
          <PageButton
            key={num}
            num={num}
            active={num === page}
            onClick={() => onPageChange(num)}
          />
        ))}

        {/* Last page if not visible */}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="px-1 text-gray-400">…</span>
            )}
            <PageButton
              num={totalPages}
              active={page === totalPages}
              onClick={() => onPageChange(totalPages)}
            />
          </>
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!pagination.hasNext}
          className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <HiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function PageButton({ num, active, onClick }: { num: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`min-w-[36px] h-9 px-2 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {num}
    </button>
  );
}
