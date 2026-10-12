'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PublicFilterFormProps {
  currentCategory?: string;
  currentMode?: string;
  currentDuration?: string;
  durations?: string[];
  currentSearch?: string;
  actionPath: string; // '/packages' or '/packages/category/graphics'
}

export default function PublicFilterForm({ 
  currentCategory, 
  currentMode = '', 
  currentDuration = '',
  durations = [],
  currentSearch = '', 
  actionPath 
}: PublicFilterFormProps) {
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

  const hasFilters = currentSearch || currentMode || currentDuration || (currentCategory && actionPath === '/packages');

  return (
    <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-2 w-full justify-center">
      {currentCategory && actionPath === '/packages' && <input type="hidden" name="category" value={currentCategory} />}
      
      {/* Mode Filter */}
      <div className="relative">
        <select
          name="mode"
          value={currentMode}
          className="w-full sm:w-auto appearance-none pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white shadow-sm font-semibold text-slate-700 text-sm cursor-pointer hover:border-slate-300 transition-colors"
          onChange={(e) => updateFilters('mode', e.target.value)}
        >
          <option value="">All Modes</option>
          <option value="ONLINE">Online Only</option>
          <option value="OFFLINE">Offline Only</option>
          <option value="BOTH">ONLINE & OFFLINE</option>
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Duration Filter */}
      {durations.length > 0 && (
        <div className="relative">
          <select
            name="duration"
            value={currentDuration}
            className="w-full sm:w-auto appearance-none pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white shadow-sm font-semibold text-slate-700 text-sm cursor-pointer hover:border-slate-300 transition-colors"
            onChange={(e) => updateFilters('duration', e.target.value)}
          >
            <option value="">All Durations</option>
            {durations.map((dur) => (
              <option key={dur} value={dur}>{dur}</option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      )}
      
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
