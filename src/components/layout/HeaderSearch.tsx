'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeaderSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/packages?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative hidden xl:flex items-center w-64 2xl:w-72"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search courses, skills..."
        className="w-full pl-9 pr-4 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-orange-500 rounded-full outline-none transition-all duration-200 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500/20"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute left-3 text-slate-400 hover:text-orange-500 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </form>
  );
}
