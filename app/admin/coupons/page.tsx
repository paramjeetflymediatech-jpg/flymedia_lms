import { requireAdmin } from '../../../src/lib/auth';
import { Coupon } from '../../../src/db/models';
import { adminCreateCoupon, adminDeleteCoupon } from '../../actions';
import DeleteConfirmButton from '../../../src/components/admin/DeleteConfirmButton';

export const revalidate = 0; // Fresh admin logs

export default async function AdminCouponsPage() {
  await requireAdmin();
  
  const couponsData = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
  const coupons = couponsData.map(c => c.toJSON());

  return (
    <div className="p-6 md:p-10 space-y-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Coupons & Discounts</h1>
        <p className="text-sm text-slate-500">Create promotional codes for student checkouts.</p>
      </div>

      <div className="space-y-8 max-w-5xl">
        <details className="group [&_summary::-webkit-details-marker]:hidden">
          <summary className="inline-flex items-center justify-center px-6 py-3 font-extrabold text-white bg-slate-900 hover:bg-slate-800 rounded-2xl cursor-pointer list-none transition-all shadow-md">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              Create New Coupon
            </span>
          </summary>
          
          <div className="mt-6 bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-xl font-bold text-slate-900">Coupon Details</h3>
            
            <form action={async (formData) => { 'use server'; await adminCreateCoupon(formData); }} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Coupon Code</label>
                <input
                  name="code"
                  type="text"
                  required
                  placeholder="e.g. SUMMER50"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-sm font-bold uppercase text-slate-900"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Discount Percentage (%)</label>
                <input
                  name="discountPercentage"
                  type="number"
                  min="1"
                  max="100"
                  required
                  placeholder="e.g. 50"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-sm text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center px-6 py-3 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow text-sm"
              >
                Generate Coupon
              </button>
            </form>
          </div>
        </details>

        <div className="space-y-6 pt-4">
          <h3 className="text-2xl font-extrabold text-slate-900">Active Coupons</h3>

          {coupons.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col items-center justify-center py-24 px-4 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Active Coupons</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6">You haven't created any promotional codes yet. Generate a coupon code above to offer discounts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {coupons.map((coupon: any) => (
                <div key={coupon.id} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="inline-block px-3 py-1 bg-green-50 border border-green-100 text-green-700 font-extrabold text-lg rounded-lg tracking-wider">
                      {coupon.code}
                    </div>
                    <DeleteConfirmButton 
                      itemType="Coupon"
                      onDelete={async () => {
                        'use server';
                        await adminDeleteCoupon(coupon.id);
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-slate-900">
                      {coupon.discountPercentage}% <span className="text-sm font-medium text-slate-500">OFF</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-400 mt-2">
                      Created on {new Date(coupon.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
