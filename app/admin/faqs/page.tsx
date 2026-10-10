import { requireAdmin } from '../../../src/lib/auth';
import { Faq } from '../../../src/db/models';
import Link from 'next/link';
import DeleteConfirmButton from '../../../src/components/admin/DeleteConfirmButton';
import { deleteFaq } from './actions';

export default async function AdminFaqsPage() {
  await requireAdmin();
  
  let faqs: Faq[] = [];
  let errorMsg = null;
  try {
    faqs = await Faq.findAll({ order: [['order', 'ASC'], ['createdAt', 'ASC']] });
  } catch(e: any) {
    console.error(e);
    errorMsg = 'Failed to load FAQs. Database might need syncing.';
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-red-500 to-orange-500">FAQs</h1>
          <p className="text-slate-500 mt-2">Manage homepage FAQs</p>
        </div>
        <Link 
          href="/admin/faqs/new"
          className="px-6 py-2 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-sm"
        >
          Add FAQ
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
                <th className="px-6 py-4 font-bold">Question</th>
                <th className="px-6 py-4 font-bold">Order</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {faqs.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 line-clamp-1">{f.question}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {f.order}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${f.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {f.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/faqs/${f.id}`} className="text-blue-600 font-bold hover:underline">Edit</Link>
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
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No FAQs found.
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
