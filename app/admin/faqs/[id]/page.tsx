import { requireAdmin } from '../../../../src/lib/auth';
import { updateFaq } from '../actions';
import { Faq } from '../../../../src/db/models';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;

  const faq = await Faq.findByPk(id);
  if (!faq) {
    notFound();
  }

  // We need to bind the ID to the update action
  const updateFaqWithId = updateFaq.bind(null, id);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/faqs" className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit FAQ</h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <form action={updateFaqWithId} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Question</label>
            <input 
              type="text" 
              name="question" 
              defaultValue={faq.question}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Answer</label>
            <textarea 
              name="answer" 
              defaultValue={faq.answer}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Order</label>
            <input 
              type="number" 
              name="order" 
              defaultValue={faq.order}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox" 
              name="isActive" 
              id="isActive"
              defaultChecked={faq.isActive}
              className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="isActive" className="font-bold text-slate-700">Active</label>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
            >
              Update FAQ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
