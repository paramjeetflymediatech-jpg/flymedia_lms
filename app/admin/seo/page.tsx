import { requireAdmin } from '../../../src/lib/auth';
import { SeoSetting } from '../../../src/db/models';
import DeleteConfirmButton from '../../../src/components/admin/DeleteConfirmButton';
import Pagination from '../../../src/components/admin/Pagination';
import { adminDeleteSeo } from '../../actions';
import Link from 'next/link';
import { Op } from 'sequelize';

export const revalidate = 0;

export default async function AdminSeoPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; page?: string }>;
}) {
  await requireAdmin();

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const searchParam = ((resolvedSearchParams?.search as string) || '').trim();
  const pageParam = resolvedSearchParams?.page;
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) || 1 : 1;
  const limit = 15;
  const offset = (page - 1) * limit;

  const whereClause: any = {};
  if (searchParam) {
    whereClause[Op.or] = [
      { pagePath: { [Op.like]: `%${searchParam}%` } },
      { title: { [Op.like]: `%${searchParam}%` } },
      { description: { [Op.like]: `%${searchParam}%` } },
      { keywords: { [Op.like]: `%${searchParam}%` } },
    ];
  }

  const [{ count, rows: seoData }, globalRecord] = await Promise.all([
    SeoSetting.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['pagePath', 'ASC']],
    }),
    SeoSetting.findOne({ where: { pagePath: 'GLOBAL' } }),
  ]);

  const seoSettings = seoData.map((s) => s.toJSON());
  const totalPages = Math.ceil(count / limit) || 1;
  const hasGlobalSeo = !!globalRecord;

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SEO Management</h1>
          <p className="text-sm text-slate-500">Manage page metadata, titles, descriptions, global scripts, and dynamic sitemaps.</p>
        </div>
        <div className="flex items-center gap-3">
          {!hasGlobalSeo && (
            <Link
              href="/admin/seo/new?path=GLOBAL"
              className="inline-flex items-center justify-center px-4 py-2.5 font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 transition-all text-xs gap-1.5"
            >
              <span>+ Setup Global SEO</span>
            </Link>
          )}
          <Link 
            href="/admin/seo/new" 
            className="inline-flex items-center justify-center px-6 py-3 font-extrabold text-white bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600 rounded-2xl shadow-md transition-all gap-2 text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Create New SEO
          </Link>
        </div>
      </div>

      {/* Sitemap & Global Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-orange-50/80 to-amber-50/50 rounded-2xl border border-orange-100/80 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full">
                Dynamic Sitemap
              </span>
              <span className="text-xs text-slate-500 font-medium">Single XML file</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time dynamic XML sitemap containing all courses, blogs, categories, and site pages in a single file.
            </p>
          </div>
          <div className="pt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <a 
              href="/sitemap.xml" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-50 transition-colors shadow-2xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              /sitemap.xml
            </a>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-indigo-50/80 to-blue-50/50 rounded-2xl border border-indigo-100/80 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                AI & LLMs File
              </span>
              <span className="text-xs text-indigo-600 font-bold">llmstxt.org</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Comprehensive real-time syllabus, courses, and platform documentation optimized for ChatGPT, Claude, and Perplexity.
            </p>
          </div>
          <div className="pt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <a 
              href="/llms.txt" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-2xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              /llms.txt
            </a>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                Global Header & Footer
              </span>
              <span className={`text-xs font-bold ${hasGlobalSeo ? 'text-emerald-600' : 'text-amber-600'}`}>
                {hasGlobalSeo ? '● Configured' : '○ Not Configured'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Global scripts (GTM, Meta Pixel, Analytics, Verification) injected site-wide via <span className="font-mono font-bold text-orange-600">GLOBAL</span>.
            </p>
          </div>
          <div className="pt-3">
            {hasGlobalSeo ? (
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-block">
                ✓ Active across all site pages
              </span>
            ) : (
              <Link 
                href="/admin/seo/new?path=GLOBAL" 
                className="text-xs font-bold text-orange-600 hover:text-orange-700 underline"
              >
                Configure Global Scripts →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl space-y-4">
        {/* Table Toolbar with Search Option */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">SEO Records</h2>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              {count} {count === 1 ? 'entry' : 'entries'}
            </span>
            {searchParam && (
              <span className="text-xs text-orange-600 bg-orange-50 font-semibold px-2.5 py-1 rounded-full border border-orange-200">
                Filtered by &quot;{searchParam}&quot;
              </span>
            )}
          </div>

          {/* Search Form */}
          <form method="GET" action="/admin/seo" className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <input 
                type="text" 
                name="search" 
                defaultValue={searchParam}
                placeholder="Search path, title, or keywords..." 
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs text-slate-900 placeholder:text-slate-400"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <button 
              type="submit" 
              className="px-4 py-2.5 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-xs text-xs whitespace-nowrap"
            >
              Search
            </button>
            {searchParam && (
              <Link 
                href="/admin/seo" 
                className="px-3 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-xl transition-colors text-xs whitespace-nowrap"
              >
                Clear
              </Link>
            )}
          </form>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Page Path</th>
                  <th className="px-6 py-4">Title / Description</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {seoSettings.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                      {searchParam ? (
                        <div className="space-y-2">
                          <p>No SEO settings found matching &quot;{searchParam}&quot;.</p>
                          <Link href="/admin/seo" className="text-orange-600 hover:underline text-xs font-bold">
                            Clear search filter
                          </Link>
                        </div>
                      ) : (
                        'No SEO settings found. Create one to get started.'
                      )}
                    </td>
                  </tr>
                ) : (
                  seoSettings.map((seo) => (
                    <tr key={seo.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded font-mono text-xs">
                            {seo.pagePath}
                          </span>
                          {seo.pagePath === 'GLOBAL' && (
                            <span className="text-[9px] font-black uppercase bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Global Scripts</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{seo.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-2 mt-1 max-w-sm" title={seo.description}>{seo.description}</div>
                        {seo.keywords && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {seo.keywords.split(',').map((kw: string, idx: number) => (
                              <span key={idx} className="text-[9px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                {kw.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link 
                            href={`/admin/seo/${seo.id}/edit`}
                            className="text-slate-500 hover:text-orange-600 transition-colors p-1"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </Link>
                          <DeleteConfirmButton
                            itemType="SEO"
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                            onDelete={adminDeleteSeo.bind(null, seo.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={count}
            limit={limit}
            baseUrl="/admin/seo"
            searchParams={searchParam ? { search: searchParam } : {}}
          />
        </div>
      </div>
    </div>
  );
}
