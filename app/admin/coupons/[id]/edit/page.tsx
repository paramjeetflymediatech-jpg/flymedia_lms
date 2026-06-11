import { requireAdmin } from '../../../../../src/lib/auth';
import { Coupon } from '../../../../../src/db/models';
import { adminUpdateCoupon } from '../../../../actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const couponData = await Coupon.findByPk(id);

  if (!couponData) {
    redirect('/admin/coupons');
  }

  const coupon = couponData.toJSON() as any;

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Coupon</h1>
          <p className="text-sm text-slate-500">Update promotional code details.</p>
        </div>
        <Link href="/admin/coupons" className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
          Back to Coupons
        </Link>
      </div>

      <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
        <form action={async (formData) => {
          'use server';
          const res = await adminUpdateCoupon(coupon.id, formData);
          if (res?.success) {
            redirect('/admin/coupons');
          } else {
            console.error(res?.error);
          }
        }} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Coupon Code</label>
              <input
                name="code"
                type="text"
                defaultValue={coupon.code}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900 uppercase"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Discount Percentage (%)</label>
              <input
                name="discountPercentage"
                type="number"
                min="1"
                max="100"
                defaultValue={coupon.discountPercentage}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Expiry Date (Optional)</label>
              <input
                name="expiresAt"
                type="datetime-local"
                defaultValue={coupon.expiresAt ? new Date(new Date(coupon.expiresAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center px-8 py-3 font-bold text-white gradient-bg hover:opacity-90 rounded-xl transition-all shadow-md text-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
