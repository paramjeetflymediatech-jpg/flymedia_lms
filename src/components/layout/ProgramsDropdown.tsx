'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

export default function ProgramsDropdown({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      <Link
        href="/packages"
        className="hover:text-orange-500 transition-colors relative group flex items-center gap-1.5"
      >
        <span>Programs</span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180 text-orange-500' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full" />
      </Link>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Arrow pointer */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-slate-100 rotate-45" />

          {/* Header */}
          {/* <div className="px-4 py-3 bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Browse by Category</p>
          </div> */}

          {/* Category list */}
          <div className="py-2 max-h-72 overflow-y-auto">
            {categories.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-400">No categories yet</p>
            ) : (
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/packages/category/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors group/item"
                >
                  {cat.icon ? (
                    <img src={cat.icon} alt={cat.name} className="w-7 h-7 object-contain rounded-lg p-0.5 bg-white border border-slate-100 flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-black">
                      {cat.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-slate-700 group-hover/item:text-orange-600 transition-colors">
                    {cat.name}
                  </span>
                  <svg className="w-3.5 h-3.5 text-slate-300 ml-auto group-hover/item:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))
            )}
          </div>

          {/* Footer link */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <Link
              href="/packages"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
            >
              View all programs
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
