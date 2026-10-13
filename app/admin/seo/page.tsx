import { requireAdmin } from '../../../src/lib/auth';
import { SeoSetting } from '../../../src/db/models';
import DeleteConfirmButton from '../../../src/components/admin/DeleteConfirmButton';
import { adminCreateSeo, adminDeleteSeo } from '../../actions';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminSeoPage() {
  await requireAdmin();

  const seoData = await SeoSetting.findAll({
    order: [['pagePath', 'ASC']],
  });
  
  const seoSettings = seoData.map((s) => s.toJSON());
  const hasGlobalSeo = seoSettings.some((s) => s.pagePath === 'GLOBAL');

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
              <span className="text-xs text-slate-500 font-medium">5,000 URLs / page</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sitemaps are generated dynamically with real-time course, blog, mentor, category, and page URLs.
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
            <a 
              href="/sitemap/0.xml" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              /sitemap/0.xml
            </a>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-indigo-50/80 to-blue-50/50 rounded-2xl border border-indigo-100/80 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                AI & LLMs Files
              </span>
              <span className="text-xs text-indigo-600 font-bold">llmstxt.org</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time Markdown summaries optimized for ChatGPT, Claude, Perplexity, and AI search engines.
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
            <a 
              href="/llms-full.txt" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              /llms-full.txt
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

      <div className="max-w-7xl">
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
                      No SEO settings found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  seoSettings.map((seo) => (
                    <tr key={seo.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
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
          </div>
      </div>
    </div>
  );
}
