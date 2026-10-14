import { requireAdmin } from '../../../../src/lib/auth';
import { Package, Category } from '../../../../src/db/models';
import { adminCreateSeo } from '../../../actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function NewSeoPage({
  searchParams,
}: {
  searchParams?: Promise<{ path?: string }>;
}) {
  await requireAdmin();
  const resolvedParams = searchParams ? await searchParams : {};
  const defaultPath = resolvedParams?.path || '';

  let packages: any[] = [];
  let categories: any[] = [];
  try {
    const [pList, cList] = await Promise.all([
      Package.findAll({ where: { status: 'PUBLISHED' }, attributes: ['slug', 'title'], limit: 50 }),
      Category.findAll({ attributes: ['slug', 'name'], limit: 50 }),
    ]);
    packages = pList.map((p) => p.toJSON());
    categories = cList.map((c) => c.toJSON());
  } catch (e) {
    console.error('Failed to load packages/categories for SEO suggestions:', e);
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create SEO Setting</h1>
          <p className="text-sm text-slate-500">Add metadata and scripts for a specific page or site-wide (GLOBAL).</p>
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Page Path</label>
                <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded">
                  Enter 'GLOBAL' for site-wide scripts
                </span>
              </div>
              <input
                name="pagePath"
                type="text"
                list="seo-paths"
                defaultValue={defaultPath}
                placeholder="e.g. /, /packages, /about, or GLOBAL"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 placeholder:text-slate-400 font-mono"
              />
              <datalist id="seo-paths">
                <option value="GLOBAL">GLOBAL - Site-wide scripts (GTM, Pixel, Analytics) & default fallback</option>
                <option value="/">/ - Homepage</option>
                <option value="/packages">/packages - All Courses & Bootcamps</option>
                <option value="/about">/about - About Us</option>
                <option value="/contact">/contact - Contact Us</option>
                <option value="/blog">/blog - Tech Blog</option>
                <option value="/faq">/faq - Help Center & FAQ</option>
                <option value="/mentors">/mentors - Mentors & Instructors</option>
                <option value="/become-tutor">/become-tutor - Become an Instructor</option>
                <option value="/register">/register - Student Registration / Sign Up</option>
                <option value="/login">/login - Student & User Login</option>
                <option value="/terms">/terms - Terms of Service</option>
                <option value="/privacy">/privacy - Privacy Policy</option>
                <option value="/cookies">/cookies - Cookie Policy</option>
                {packages.map((pkg) => (
                  <option key={pkg.slug} value={`/packages/${pkg.slug}`}>
                    {`/packages/${pkg.slug} - ${pkg.title}`}
                  </option>
                ))}
                {categories.map((cat) => (
                  <option key={cat.slug} value={`/packages/category/${cat.slug}`}>
                    {`/packages/category/${cat.slug} - ${cat.name}`}
                  </option>
                ))}
              </datalist>
              <p className="text-[10px] text-slate-500 mt-1">
                Select from suggestions or enter any path like <span className="font-bold text-slate-800">/</span>, <span className="font-bold text-slate-800">/packages</span>, <span className="font-bold text-slate-800">/about</span>, or <span className="font-bold text-slate-800">GLOBAL</span> for site-wide scripts.
              </p>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Meta Title</label>
              <input
                name="title"
                type="text"
                placeholder="e.g. Web Development Training | Flymedia"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 placeholder:text-slate-400"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Meta Description</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Brief description of the page for search engines..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 placeholder:text-slate-400"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Keywords (Optional)</label>
              <input
                name="keywords"
                type="text"
                placeholder="e.g. web dev, training, bootcamp"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">OG Title (Optional)</label>
                <input
                  name="ogTitle"
                  type="text"
                  placeholder="e.g. Learn Web Development"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 placeholder:text-slate-400"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">OG Description (Optional)</label>
                <textarea
                  name="ogDescription"
                  rows={2}
                  placeholder="Description for social sharing..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 placeholder:text-slate-400"
                />
              </div>
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Footer Script (Optional)</label>
                  <textarea
                    name="footerScript"
                    rows={4}
                    placeholder="<script>...</script> (Injected before </body>)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 placeholder:text-slate-400"
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
