import { requireAdmin } from '../../../../src/lib/auth';
import { adminCreateSeo } from '../../../actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function NewSeoPage() {
  await requireAdmin();

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create SEO Setting</h1>
          <p className="text-sm text-slate-500">Add metadata and scripts for a specific page or GLOBAL.</p>
        </div>
        <Link href="/admin/seo" className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
          Back to SEO
        </Link>
      </div>

      <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
        <form action={async (formData) => {
          'use server';
          const res = await adminCreateSeo(formData);
          if (res?.success) {
            redirect('/admin/seo');
          } else {
            console.error(res?.error);
          }
        }} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Page Path</label>
              <input
                name="pagePath"
                type="text"
                placeholder="e.g. /courses, /about, or GLOBAL"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900 placeholder:text-slate-400"
              />
              <p className="text-[10px] text-slate-500 mt-1">Use 'GLOBAL' for site-wide header/footer scripts.</p>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Meta Title</label>
              <input
                name="title"
                type="text"
                placeholder="e.g. Web Development Training | Flymedia"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900 placeholder:text-slate-400"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Meta Description</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Brief description of the page for search engines..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900 placeholder:text-slate-400"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Keywords (Optional)</label>
              <input
                name="keywords"
                type="text"
                placeholder="e.g. web dev, training, bootcamp"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Custom Scripts</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Header Script (Optional)</label>
                  <textarea
                    name="headerScript"
                    rows={4}
                    placeholder="<script>...</script> (Injected inside <head>)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Footer Script (Optional)</label>
                  <textarea
                    name="footerScript"
                    rows={4}
                    placeholder="<script>...</script> (Injected before </body>)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center px-8 py-3 font-bold text-white gradient-bg hover:opacity-90 rounded-xl transition-all shadow-md text-sm"
            >
              Save SEO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
