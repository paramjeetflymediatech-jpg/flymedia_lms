"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const goToPage = (page: number) => {
    router.push(createPageUrl(page));
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Previous Page"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          // Simple pagination (show 5 pages around current)
          if (
            totalPages > 7 &&
            page !== 1 &&
            page !== totalPages &&
            Math.abs(page - currentPage) > 1
          ) {
            if (page === 2 || page === totalPages - 1) {
              return <span key={page} className="text-slate-400 px-1">...</span>;
            }
            return null;
          }

          return (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                currentPage === page
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Next Page"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
