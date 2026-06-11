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

  return (
    <div className="p-6 md:p-10 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SEO Management</h1>
          <p className="text-sm text-slate-500">Manage page metadata, titles, descriptions, and global scripts.</p>
        </div>
        <Link 
          href="/admin/seo/new" 
          className="inline-flex items-center justify-center px-6 py-3 font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-md transition-all gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Create New SEO
        </Link>
      </div>

      <div className="max-w-7xl pt-4">
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
                          <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
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
                            className="text-slate-500 hover:text-blue-600 transition-colors p-1"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </Link>
                          <DeleteConfirmButton
                            itemType="SEO"
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                            onDelete={async () => {
                              'use server';
                              await adminDeleteSeo(seo.id);
                            }}
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
