import { requireAdmin } from '../../../src/lib/auth';
import { Faq } from '../../../src/db/models';
import Link from 'next/link';
import DeleteConfirmButton from '../../../src/components/admin/DeleteConfirmButton';
import { deleteFaq } from './actions';
import { PRESET_PAGES } from '../../../src/constants/faqPages';

export const revalidate = 0;

export default async function AdminFaqsPage({
  searchParams,
}: {
  searchParams: Promise<{ pageFilter?: string }>;
}) {
  await requireAdmin();
  const resolvedSearchParams = await searchParams;
  const currentFilter = resolvedSearchParams.pageFilter || 'ALL';

  let faqs: Faq[] = [];
  let allFaqsForCounts: Faq[] = [];
  let errorMsg = null;
  try {
    allFaqsForCounts = await Faq.findAll({
      attributes: ['id', 'page'],
    });

    const whereClause: any = {};
    if (currentFilter !== 'ALL') {
      whereClause.page = currentFilter;
    }
    faqs = await Faq.findAll({
      where: whereClause,
      order: [['page', 'ASC'], ['order', 'ASC'], ['createdAt', 'ASC']],
    });
  } catch (e: unknown) {
    console.error(e);
    errorMsg = 'Failed to load FAQs. Database might need syncing.';
  }

  // Count by page
  const countsByPage: Record<string, number> = { ALL: allFaqsForCounts.length };
  const pagesInDb = new Set<string>();

  allFaqsForCounts.forEach(f => {
    const p = (f.page || 'HOME').toUpperCase();
    pagesInDb.add(p);
    countsByPage[p] = (countsByPage[p] || 0) + 1;
  });

  // Map known presets
  const presetMap = new Map(PRESET_PAGES.map(p => [p.key, p]));

  // Combine standard pages and any dynamic custom pages found in DB
  const filterTabs: Array<{ key: string; label: string; count: number; icon: string }> = [
    { key: 'ALL', label: 'All Pages', count: countsByPage.ALL, icon: '🌟' }
  ];

  // Add presets that have counts or are the default ones
  const defaultAlwaysShow = ['HOME', 'PARTNER', 'ABOUT', 'GLOBAL'];
  for (const preset of PRESET_PAGES) {
    if (defaultAlwaysShow.includes(preset.key) || pagesInDb.has(preset.key)) {
      filterTabs.push({
        key: preset.key,
        label: preset.label,
        count: countsByPage[preset.key] || 0,
        icon: preset.icon || '📄'
      });
    }
  }

  // Add any custom dynamic pages created by admin that are not in presets
  pagesInDb.forEach(p => {
    if (!presetMap.has(p) && p !== 'ALL') {
      filterTabs.push({
        key: p,
        label: p,
        count: countsByPage[p] || 0,
        icon: '📄'
      });
    }
  });

  const getPageBadge = (pageKey?: string) => {
    const key = (pageKey || 'HOME').toUpperCase();
    const preset = presetMap.get(key);
    if (preset) {
      if (key === 'PARTNER') {
        return (
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            🤝 {preset.label}
          </span>
        );
      }
      if (key === 'ABOUT') {
        return (
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200">
            ℹ️ {preset.label}
          </span>
        );
      }
      if (key === 'GLOBAL') {
        return (
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
            🌐 {preset.label}
          </span>
        );
      }
      if (key === 'CONTACT') {
        return (
          <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
            📞 {preset.label}
          </span>
        );
      }
      return (
        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
          {preset.icon || '📄'} {preset.label}
        </span>
      );
    }

    // Dynamic custom page badge
    return (
      <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
        📄 {key}
      </span>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-red-500 to-orange-500">
            Dynamic Page-Wise FAQs
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Create FAQs for any dynamic page or assign them to standard pages.
          </p>
        </div>
        <Link
          href="/admin/faqs/new"
          className="px-6 py-2.5 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm self-start sm:self-center"
        >
          + Add FAQ
        </Link>
      </div>

      {/* Dynamic Page Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100/70 p-1.5 rounded-2xl w-fit border border-slate-200/60 max-w-full">
        {filterTabs.map(opt => {
          const active = currentFilter === opt.key;
          return (
            <Link
              key={opt.key}
              href={opt.key === 'ALL' ? '/admin/faqs' : `/admin/faqs?pageFilter=${opt.key}`}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                active
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${active ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-500'}`}>
                {opt.count}
              </span>
            </Link>
          );
        })}
      </div>

      {errorMsg ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-bold">
          {errorMsg}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-extrabold">
              <tr>
                <th className="px-6 py-4">Page</th>
                <th className="px-6 py-4">Question</th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {faqs.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPageBadge(f.page)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 line-clamp-1">{f.question}</div>
                    <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{f.answer}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                    {f.order}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        f.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {f.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 items-center">
                      <Link
                        href={`/admin/faqs/${f.id}`}
                        className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg border border-blue-200 transition-all"
                      >
                        Edit
                      </Link>
                      <DeleteConfirmButton
                        itemType="FAQ"
                        onDelete={async () => {
                          'use server';
                          await deleteFaq(f.id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {faqs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-medium">
                    No FAQs found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
