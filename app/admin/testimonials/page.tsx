import { requireAdmin } from '../../../src/lib/auth';
import { Testimonial } from '../../../src/db/models';
import Link from 'next/link';
import DeleteConfirmButton from '../../../src/components/admin/DeleteConfirmButton';
import { deleteTestimonial } from './actions';

export default async function AdminTestimonialsPage() {
  await requireAdmin();
  
  // Safe db fetch with a try catch in case the table is not created yet
  let testimonials: Testimonial[] = [];
  let errorMsg = null;
  try {
    testimonials = await Testimonial.findAll({ order: [['createdAt', 'DESC']] });
  } catch(e: any) {
    console.error(e);
    errorMsg = 'Failed to load testimonials. Database might need syncing. Please restart the server.';
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-red-500 to-orange-500">Testimonials</h1>
          <p className="text-slate-500 mt-2">Manage homepage testimonials</p>
        </div>
        <Link 
          href="/admin/testimonials/new"
          className="px-6 py-2 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-sm"
        >
          Add Testimonial
        </Link>
      </div>

      {errorMsg ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-bold">
          {errorMsg}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-bold">Author</th>
                <th className="px-6 py-4 font-bold">Content</th>
                <th className="px-6 py-4 font-bold">Rating</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {testimonials.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {t.avatar ? (
                        <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">{t.name.charAt(0)}</div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900">{t.name}</div>
                        <div className="text-xs text-slate-500">{t.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="line-clamp-2 max-w-xs">{t.content}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 text-orange-400">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/testimonials/${t.id}`} className="text-blue-600 font-bold hover:underline">Edit</Link>
                      <DeleteConfirmButton 
                        itemType="Testimonial"
                        onDelete={async () => {
                          'use server';
                          await deleteTestimonial(t.id);
                        }} 
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {testimonials.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No testimonials found.
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
