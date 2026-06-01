import { requireAdmin } from '../../../src/lib/auth';

export default async function AdminCouponsPage() {
  await requireAdmin();

  return (
    <div className="p-6 md:p-10 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Coupons & Discounts</h1>
          <p className="text-sm text-slate-500">Create promotional codes for student checkouts.</p>
        </div>
        <button className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all">
          + Create Coupon
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">No Active Coupons</h3>
        <p className="text-sm text-slate-500 max-w-sm mb-6">You haven't created any promotional codes yet. Generate a coupon code to offer discounts on your courses.</p>
        <button className="inline-flex items-center justify-center px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm">
          Create First Coupon
        </button>
      </div>
    </div>
  );
}
