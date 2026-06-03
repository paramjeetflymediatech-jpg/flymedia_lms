import Link from 'next/link';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
}

export default function Pagination({ page, totalPages, totalItems, limit, baseUrl, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  const offset = (page - 1) * limit;
  const startItem = totalItems === 0 ? 0 : offset + 1;
  const endItem = Math.min(offset + limit, totalItems);

  const getUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('page', pageNum.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
      <span className="text-sm text-slate-500 font-medium">
        Showing <span className="font-bold text-slate-900">{startItem}</span> to <span className="font-bold text-slate-900">{endItem}</span> of <span className="font-bold text-slate-900">{totalItems}</span> entries
      </span>
      <div className="flex items-center gap-2">
        <Link 
          href={getUrl(page - 1)}
          className={`px-3 py-1.5 text-xs font-bold rounded border ${page <= 1 ? 'border-slate-200 text-slate-400 pointer-events-none' : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-100 transition-colors'}`}
        >
          Previous
        </Link>
        <div className="text-sm font-bold text-slate-700 px-2">
          {page} / {totalPages}
        </div>
        <Link 
          href={getUrl(page + 1)}
          className={`px-3 py-1.5 text-xs font-bold rounded border ${page >= totalPages ? 'border-slate-200 text-slate-400 pointer-events-none' : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-100 transition-colors'}`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
