"use client";

import { useState, useMemo } from 'react';
import FaqAccordion from '../home/FaqAccordion';

interface FaqItem {
  id?: string | number;
  question: string;
  answer: string;
  page?: string;
  order?: number;
}

interface FaqPageTabsProps {
  faqs: FaqItem[];
}

export default function FaqPageTabs({ faqs }: FaqPageTabsProps) {
  const [selectedPage, setSelectedPage] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { tabs, filteredFaqs } = useMemo(() => {
    const pageCounts: Record<string, number> = { ALL: faqs.length };
    const distinctPages = new Set<string>();

    faqs.forEach(f => {
      const p = (f.page || 'HOME').toUpperCase();
      distinctPages.add(p);
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    });

    const knownLabelMap: Record<string, { label: string; icon: string }> = {
      HOME: { label: 'Courses & Learning', icon: '🎓' },
      PARTNER: { label: 'Colleges & Charities', icon: '🤝' },
      ABOUT: { label: 'About & Platform', icon: 'ℹ️' },
      CONTACT: { label: 'Contact Us', icon: '📞' },
      PACKAGES: { label: 'All Packages', icon: '📦' },
      GALLERY: { label: 'Placements', icon: '🏆' },
      'BECOME-TUTOR': { label: 'Become a Tutor', icon: '👩‍🏫' },
      GLOBAL: { label: 'General / Platform', icon: '🌐' },
    };

    const tabList: Array<{ key: string; label: string; count: number; icon: string }> = [
      { key: 'ALL', label: 'All Questions', count: pageCounts.ALL, icon: '🌟' },
    ];

    const mainOrder = ['HOME', 'PARTNER', 'ABOUT'];
    mainOrder.forEach(k => {
      if (distinctPages.has(k) || pageCounts[k]) {
        tabList.push({
          key: k,
          label: knownLabelMap[k]?.label || k,
          count: pageCounts[k] || 0,
          icon: knownLabelMap[k]?.icon || '📄',
        });
      }
    });

    distinctPages.forEach(p => {
      if (!mainOrder.includes(p) && p !== 'ALL') {
        const info = knownLabelMap[p];
        tabList.push({
          key: p,
          label: info?.label || p.replace(/_/g, ' '),
          count: pageCounts[p] || 0,
          icon: info?.icon || '📄',
        });
      }
    });

    const filtered = faqs.filter(faq => {
      const faqPage = (faq.page || 'HOME').toUpperCase();
      if (selectedPage !== 'ALL') {
        if (selectedPage === 'HOME') {
          if (faqPage !== 'HOME' && faqPage !== 'GLOBAL') return false;
        } else if (selectedPage === 'ABOUT') {
          if (faqPage !== 'ABOUT' && faqPage !== 'GLOBAL') return false;
        } else {
          if (faqPage !== selectedPage && faqPage !== 'GLOBAL') return false;
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuestion = faq.question.toLowerCase().includes(query);
        const matchesAnswer = faq.answer.toLowerCase().includes(query);
        return matchesQuestion || matchesAnswer;
      }

      return true;
    });

    return { tabs: tabList, filteredFaqs: filtered };
  }, [faqs, selectedPage, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by keyword, question, or topic..." 
          className="w-full pl-14 pr-12 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 text-slate-800 text-base transition-all placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
            title="Clear search"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Page Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
        {tabs.map((tab) => {
          const isActive = selectedPage === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedPage(tab.key)}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-[1.02]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* FAQs List or Empty State */}
      {filteredFaqs.length > 0 ? (
        <FaqAccordion faqs={filteredFaqs} />
      ) : (
        <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-bold text-slate-800 mb-1">No questions found</h4>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {searchQuery 
              ? `No FAQs matching "${searchQuery}". Try a different search term or view all questions.`
              : 'No FAQs available under this section yet.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedPage('ALL'); }}
              className="mt-4 text-xs font-bold text-orange-600 hover:text-orange-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
