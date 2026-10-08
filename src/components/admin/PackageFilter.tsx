'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PackageFilterProps {
  categories: { id: string; name: string }[];
}

export default function PackageFilter({ categories }: PackageFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get('category') || '';
  const currentStatus = searchParams.get('status') || '';
  const currentSearch = searchParams.get('search') || '';
  const [searchValue, setSearchValue] = useState(currentSearch);

  // Sync state if URL changes from outside (like clicking Clear)
  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/admin/packages?${params.toString()}`);
  };

  const handleSearch = () => {
    updateFilters('search', searchValue);
  };

  const hasFilters = currentSearch || currentCategory || currentStatus;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 max-w-3xl w-full sm:justify-end">
      <select
        value={currentStatus}
        onChange={(e) => updateFilters('status', e.target.value)}
        className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm bg-white"
      >
        <option value="">All Statuses</option>
        <option value="PUBLISHED">Published</option>
        <option value="DRAFT">Draft</option>
      </select>
      
      <select
        value={currentCategory}
        onChange={(e) => updateFilters('category', e.target.value)}
        className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm bg-white"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
        ))}
      </select>
      
      <div className="flex w-full sm:w-auto flex-1 max-w-xs relative gap-2">
        <input 
          type="text" 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search packages..." 
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <button 
          onClick={handleSearch}
          className="px-4 py-2 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600 text-white font-bold rounded-xl transition-colors text-sm shrink-0"
        >
          Search
        </button>
      </div>

      {hasFilters && (
        <Link href="/admin/packages" className="w-full sm:w-auto text-center px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm shrink-0">
          Clear
        </Link>
      )}
    </div>
  );
}
