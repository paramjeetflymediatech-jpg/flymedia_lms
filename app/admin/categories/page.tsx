import { requireAdmin } from '../../../src/lib/auth';
import { Category } from '../../../src/db/models';
import { adminCreateCategory, adminDeleteCategory } from '../../actions';
import DeleteConfirmButton from '../../../src/components/admin/DeleteConfirmButton';
import Pagination from '../../../src/components/admin/Pagination';
import { Op } from 'sequelize';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  await requireAdmin();

  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams?.page;
  const searchParam = resolvedSearchParams?.search as string || '';
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) || 1 : 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const whereClause = searchParam ? {
    name: { [Op.like]: `%${searchParam}%` }
  } : {};

  const { count, rows } = await Category.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });
  
  const categories = rows.map(c => c.toJSON());
  const totalPages = Math.ceil(count / limit) || 1;

  return (
    <div className="p-6 md:p-10 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Category Management</h1>
          <p className="text-sm text-slate-500">Create and manage categories for your packages.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">Create New Category</h3>
            <form action={async (formData) => {
              'use server';
              await adminCreateCategory(formData);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
                  placeholder="e.g. Graphic Design"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Icon (Upload)</label>
                <input
                  name="iconFile"
                  type="file"
                  accept="image/*"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Or Icon URL</label>
                <input
                  name="iconUrl"
                  type="text"
                  placeholder="e.g. https://example.com/icon.png"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 font-bold text-white bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600 rounded-xl transition-all text-sm"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-2xl font-extrabold text-slate-900">Your Categories</h3>
            
            <form method="GET" action="/admin/categories" className="flex items-center gap-2 max-w-sm w-full">
              <input 
                type="text" 
                name="search" 
                defaultValue={searchParam}
                placeholder="Search categories..." 
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
              />
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600 text-white font-bold rounded-xl transition-colors text-sm">
                Search
              </button>
              {searchParam && (
                <a href="/admin/categories" className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
                  Clear
                </a>
              )}
            </form>
          </div>

          {categories.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-100 rounded-3xl text-slate-500 font-medium">
              No categories found. Create your first category.
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {categories.map((cat: any) => (
                  <div key={cat.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      {cat.icon ? (
                        <img src={cat.icon} alt={cat.name} className="w-12 h-12 object-contain rounded-xl border border-slate-100 bg-slate-50 p-1" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl">
                          {cat.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-lg leading-tight">{cat.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">Slug: {cat.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/categories/edit/${cat.id}`}
                        className="text-orange-500 hover:text-orange-700 transition-colors p-2 bg-orange-50 hover:bg-orange-100 rounded-xl flex items-center justify-center"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </Link>
                      <DeleteConfirmButton
                        itemType="Category"
                        onDelete={adminDeleteCategory.bind(null, cat.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2 bg-red-50 hover:bg-red-100 rounded-xl"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Pagination 
                page={page} 
                totalPages={totalPages} 
                totalItems={count} 
                limit={limit} 
                baseUrl="/admin/categories" 
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
