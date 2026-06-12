"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, FormEvent } from 'react';

export default function TutorSearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }
    
    // Reset to page 1 on new search
    params.delete('page');
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tutors by name or bio..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-sm transition-colors bg-white text-slate-900"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors"
      >
        Search
      </button>
    </form>
  );
}
