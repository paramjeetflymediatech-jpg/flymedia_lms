'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PublicFilterFormProps {
  currentCategory?: string;
  currentMode?: string;
  currentSearch?: string;
  actionPath: string; // '/packages' or '/packages/category/graphics'
}

export default function PublicFilterForm({ currentCategory, currentMode = '', currentSearch = '', actionPath }: PublicFilterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${actionPath}?${params.toString()}`, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;
    updateFilters('search', search);
  };

  const hasFilters = currentSearch || currentMode || (currentCategory && actionPath === '/packages');

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 w-full justify-center">
      {currentCategory && actionPath === '/packages' && <input type="hidden" name="category" value={currentCategory} />}
      <select
        name="mode"
        value={currentMode}
        className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white shadow-sm"
        onChange={(e) => updateFilters('mode', e.target.value)}
      >
        <option value="">All Modes</option>
        <option value="ONLINE">Online Only</option>
        <option value="OFFLINE">Offline Only</option>
        <option value="BOTH">ONLINE & OFFLINE</option>
      </select>
      
      {/* Search Input (only show on /packages, not on specific category for now, or show everywhere?) */}
      {actionPath === '/packages' && (
        <>
          <input 
            type="text"  
            name="search" 
            defaultValue={currentSearch}
            placeholder="Search packages..." 
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm"
          />
          <button type="submit" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm shrink-0">
            Search
          </button>
        </>
      )}

      {hasFilters && (
        <Link href={actionPath} scroll={false} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold text-center rounded-xl hover:bg-slate-200 transition-colors shadow-sm shrink-0">
          Clear
        </Link>
      )}
    </form>
  );
}
