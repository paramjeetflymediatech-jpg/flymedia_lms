import { requireAdmin } from '../../../src/lib/auth';
import { Payment } from '../../../src/db/models';
import DeleteConfirmButton from '../../../src/components/admin/DeleteConfirmButton';
import { deletePaymentAction } from '../../actions';
import Pagination from '../../../src/components/admin/Pagination';

export const revalidate = 0;

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const [allPayments, paginatedData] = await Promise.all([
    Payment.findAll({ attributes: ['amount', 'status'] }),
    Payment.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    })
  ]);

  const payments = paginatedData.rows.map(p => p.toJSON());
  const totalPages = Math.ceil(paginatedData.count / limit) || 1;
  
  const totalRevenue = allPayments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + Number(p.amount), 0);
    
  const successfulTransactions = allPayments.filter(p => p.status === 'SUCCESS').length;
  const refunds = allPayments.filter(p => p.status === 'FAILED').length; // For simplicity, using failed as refunds or just 0

  return (
    <div className="p-6 md:p-10 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payments & Revenue</h1>
          <p className="text-sm text-slate-500">Track transactions, refunds, and revenue analytics.</p>
        </div>
        <button className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
          <div className="text-3xl font-black text-slate-900">₹{totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-slate-500">Lifetime earnings</p>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transactions</span>
          <div className="text-3xl font-black text-slate-900">{successfulTransactions}</div>
          <p className="text-xs text-slate-500">Total successful payments</p>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Failed / Refunds</span>
          <div className="text-3xl font-black text-slate-900">{refunds}</div>
          <p className="text-xs text-slate-500">Failed transactions</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
        </div>
        {payments.length === 0 ? (
          <p className="p-6 text-xs text-slate-400 italic text-center">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs font-bold text-slate-400 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{p.transactionId}</td>
                    <td className="px-6 py-4 font-bold">₹{Number(p.amount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                        p.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                        p.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">{p.provider}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="text-slate-400 hover:text-blue-600 transition-colors" title="Edit Payment">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <DeleteConfirmButton 
                          itemType="Payment" 
                          onDelete={async () => {
                            'use server';
                            await deletePaymentAction(p.id);
                          }} 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination 
          page={page} 
          totalPages={totalPages} 
          totalItems={paginatedData.count} 
          limit={limit} 
          baseUrl="/admin/payments" 
        />
      </div>

    </div>
  );
}
